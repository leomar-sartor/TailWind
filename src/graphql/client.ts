import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
  CombinedGraphQLErrors,
} from '@apollo/client';
import { Observable } from 'rxjs';
import { visit } from 'graphql';
import { SetContextLink } from '@apollo/client/link/context';
import { ErrorLink } from '@apollo/client/link/error';
import { RemoveTypenameFromVariablesLink } from '@apollo/client/link/remove-typename';
import { useAuthStore } from '../auth/authStore';
import { REFRESH_TOKEN_MUTATION } from './mutations/auth.mutation';

// ─── HTTP Link ────────────────────────────────────────────────────────────────

const graphqlEndpoint = (import.meta.env.VITE_ARP_GRAPHQL_API_URL || 'http://localhost:5084/graphql/').replace(/\/?$/, '/');

const cleanGraphQLBody = (body: any) => {
  if (typeof body !== 'object' || body === null) return body;

  if (body.operationName !== undefined) {
    delete body.operationName;
  }

  if (body.variables && typeof body.variables === 'object') {
    for (const key of Object.keys(body.variables)) {
      if (body.variables[key] === null || body.variables[key] === undefined) {
        delete body.variables[key];
      }
    }
    if (Object.keys(body.variables).length === 0) {
      delete body.variables;
    }
  }

  if (body.extensions && typeof body.extensions === 'object') {
    delete body.extensions;
  }

  return body;
};

const customFetch: typeof fetch = async (uri, options = {}) => {
  if (options.method?.toString().toUpperCase() === 'POST' && typeof options.body === 'string') {
    try {
      const parsedBody = JSON.parse(options.body);
      const cleanedBody = cleanGraphQLBody(parsedBody);
      options.body = JSON.stringify(cleanedBody);
    } catch {
      // Não altera se o body não for JSON válido
    }
  }

  return fetch(uri, options);
};

const httpLink = new HttpLink({
  uri: graphqlEndpoint,
  // CRÍTICO: instrui o browser a enviar o cookie httpOnly em toda request
  credentials: 'include',
  fetch: customFetch,
});

const removeTypenameLink = new ApolloLink((operation, forward) => {
  if (operation.query) {
    operation.query = visit(operation.query, {
      Field(node) {
        return node.name.value === '__typename' ? null : undefined;
      },
    });
  }

  return forward(operation);
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
  // Ordem importa: errorLink → authLink → removeTypenameLink → httpLink
  link: ApolloLink.from([errorLink, authLink, new RemoveTypenameFromVariablesLink(), removeTypenameLink, httpLink]),
  cache: new InMemoryCache(),
  clientAwareness: { transport: false },
  enhancedClientAwareness: { transport: false },
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