import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
  CombinedGraphQLErrors,
} from '@apollo/client';
import { Observable } from 'rxjs';
import { SetContextLink } from '@apollo/client/link/context';
import { ErrorLink } from '@apollo/client/link/error';
import { useAuthStore } from '../auth/authStore';
import { REFRESH_TOKEN_MUTATION } from './mutations/auth.mutation';

// ─── HTTP Link ────────────────────────────────────────────────────────────────

const httpLink = new HttpLink({
  uri: import.meta.env.VITE_ARP_GRAPHQL_API_URL,
  // CRÍTICO: instrui o browser a enviar o cookie httpOnly em toda request
  credentials: 'include',
});

// ─── Auth Link — injeta o Bearer token em cada request ───────────────────────
// ATENÇÃO: SetContextLink inverte a ordem dos args em relação ao setContext legado.
// Era: setContext((operation, prevContext) => ...)
// Agora: new SetContextLink((prevContext, operation) => ...)

const authLink = new SetContextLink((prevContext) => {
  const token = useAuthStore.getState().accessToken;

  return {
    headers: {
      ...prevContext.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
});

// ─── Refresh Token Logic ──────────────────────────────────────────────────────

// Fila de requests que chegaram enquanto o refresh estava em andamento.
// Quando o refresh resolver, todas são liberadas com o novo token.
let pendingRequests: Array<(token: string) => void> = [];

const resolvePendingRequests = (newToken: string) => {
  pendingRequests.forEach((resolve) => resolve(newToken));
  pendingRequests = [];
};

const refreshAccessToken = (): Promise<string> => {
  return apolloClient
    .mutate<{ refreshToken: { accessToken: string } }>({
      mutation: REFRESH_TOKEN_MUTATION,
    })
    .then(({ data }) => {
      const newToken = data?.refreshToken.accessToken;
      if (!newToken) throw new Error('No access token returned');

      useAuthStore.getState().setAccessToken(newToken);
      return newToken;
    });
};

// ─── Error Link — intercepta erros de autenticação e executa refresh ─────────
// ErrorLink no Apollo Client 4:
//   - Recebe { error, operation, forward } — um único objeto 'error' unificado
//   - CombinedGraphQLErrors.is(error) substitui a checagem de graphQLErrors[]
//   - Retornar forward(operation) faz o retry automático com o novo contexto

const errorLink = new ErrorLink(({ error, operation, forward }) => {
  if (!CombinedGraphQLErrors.is(error)) return;

  const isUnauthorized = error.errors.some(
    (err) =>
      err.extensions?.code === 'AUTH_NOT_AUTHORIZED' ||
      err.extensions?.code === 'UNAUTHENTICATED'
  );

  if (!isUnauthorized) return;

  const { isRefreshing, setRefreshing, clearAuth } = useAuthStore.getState();

  // Observable do RxJS (não mais de zen-observable / @apollo/client)
  // O subscriber usa métodos declarados como funções, não arrow functions — é
  // o formato que o Apollo Link espera internamente.
  return new Observable((observer) => {
    if (isRefreshing) {
      // Refresh em andamento — enfileira e aguarda o novo token
      pendingRequests.push((newToken: string) => {
        operation.setContext(({ headers = {} }) => ({
          headers: { ...headers, Authorization: `Bearer ${newToken}` },
        }));
        forward(operation).subscribe(observer);
      });
      return;
    }

    setRefreshing(true);

    refreshAccessToken()
      .then((newToken) => {
        resolvePendingRequests(newToken);
        setRefreshing(false);

        operation.setContext(({ headers = {} }) => ({
          headers: { ...headers, Authorization: `Bearer ${newToken}` },
        }));

        forward(operation).subscribe(observer);
      })
      .catch((err) => {
        pendingRequests = [];
        setRefreshing(false);
        clearAuth();

        apolloClient.clearStore().then(() => {
          window.location.href = '/login';
        });

        observer.error(err);
      });
  });
});

// ─── Apollo Client ────────────────────────────────────────────────────────────

export const apolloClient = new ApolloClient({
  // Ordem importa: errorLink → authLink → httpLink
  link: ApolloLink.from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'cache-first',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});