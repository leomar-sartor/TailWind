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
import { RemoveTypenameFromVariablesLink } from '@apollo/client/link/remove-typename';
import { useAuthStore } from '../auth/authStore';
import { REFRESH_TOKEN_MUTATION } from './mutations/auth.mutation';
import type { RefreshTokenData } from './types/auth.types';

// ─── HTTP Link ────────────────────────────────────────────────────────────────

const graphqlEndpoint = (import.meta.env.VITE_ARP_GRAPHQL_API_URL || 'http://localhost:5084/graphql/').replace(/\/?$/, '/');

const cleanGraphQLBody = (body: Record<string, unknown>) => {
  if (typeof body !== 'object' || body === null) return body;

  if (body.operationName !== undefined) {
    delete body.operationName;
  }

  if (body.variables && typeof body.variables === 'object') {
    const variables = body.variables as Record<string, unknown>;
    for (const key of Object.keys(variables)) {
      if (variables[key] === null || variables[key] === undefined) {
        delete variables[key];
      }
    }
    if (Object.keys(variables).length === 0) {
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
      const parsedBody = JSON.parse(options.body) as Record<string, unknown>;
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

const SKIP_REFRESH_OPERATIONS = new Set(['Login', 'RefreshToken', 'Logout']);

// Fila de requests que chegaram enquanto o refresh estava em andamento.
// Quando o refresh resolver, todas são liberadas com o novo token (ou rejeitadas).
type PendingRequest = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};

let pendingRequests: PendingRequest[] = [];

const resolvePendingRequests = (newToken: string) => {
  pendingRequests.forEach(({ resolve }) => resolve(newToken));
  pendingRequests = [];
};

const rejectPendingRequests = (error: unknown) => {
  pendingRequests.forEach(({ reject }) => reject(error));
  pendingRequests = [];
};

const refreshAccessToken = (): Promise<string> => {
  return apolloClient
    .mutate<RefreshTokenData>({
      mutation: REFRESH_TOKEN_MUTATION,
    })
    .then(({ data, error }) => {
      if (error) throw error;

      const payload = data?.refreshToken;
      const newToken = payload?.accessToken;
      if (!newToken || payload.success === false) {
        throw new Error('No access token returned');
      }

      useAuthStore.getState().setAccessToken(newToken);
      return newToken;
    });
};

// ─── Error Link — intercepta erros de autenticação e executa refresh ─────────
// ErrorLink no Apollo Client 4:
//   - Recebe { error, operation, forward } — um único objeto 'error' unificado
//   - CombinedGraphQLErrors.is(error) substitui a checagem de graphQLErrors[]
//   - Retornar forward(operation) faz o retry automático com o novo contexto
// Refresh SOMENTE em UNAUTHENTICATED (sessão expirada). AUTH_NOT_AUTHORIZED
// é falta de permissão e NÃO deve disparar refresh.

const errorLink = new ErrorLink(({ error, operation, forward }) => {
  if (!CombinedGraphQLErrors.is(error)) return;

  if (operation.operationName && SKIP_REFRESH_OPERATIONS.has(operation.operationName)) {
    return;
  }

  const isUnauthenticated = error.errors.some(
    (err) => err.extensions?.code === 'UNAUTHENTICATED'
  );

  if (!isUnauthenticated) return;

  const { isRefreshing, setRefreshing, clearAuth } = useAuthStore.getState();

  // Observable do RxJS (não mais de zen-observable / @apollo/client)
  // O subscriber usa métodos declarados como funções, não arrow functions — é
  // o formato que o Apollo Link espera internamente.
  return new Observable((observer) => {
    if (isRefreshing) {
      // Refresh em andamento — enfileira e aguarda o novo token
      pendingRequests.push({
        resolve: (newToken: string) => {
          operation.setContext(({ headers = {} }) => ({
            headers: { ...headers, Authorization: `Bearer ${newToken}` },
          }));
          forward(operation).subscribe(observer);
        },
        reject: (err: unknown) => {
          observer.error(err);
        },
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
        rejectPendingRequests(err);
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
  // Ordem importa: errorLink → authLink → removeTypename (variables) → httpLink
  // NÃO remova __typename da query — o cache Apollo depende dele.
  link: ApolloLink.from([
    errorLink,
    authLink,
    new RemoveTypenameFromVariablesLink(),
    httpLink,
  ]),
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
