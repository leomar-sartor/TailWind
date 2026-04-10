# learning-tailwind

A React + Vite learning project focused on **Tailwind CSS v4**, with authentication, GraphQL, and client state management.

## Package versions (from `package.json`)

| Area | Package | Version (range) |
|------|---------|-------------------|
| **Build** | [Vite](https://vitejs.dev/) | `^7.2.4` |
| **React** | `react` / `react-dom` | `^19.2.0` |
| **Styling** | `tailwindcss` | `^4.1.18` |
| **Styling** | `@tailwindcss/vite` | `^4.1.18` |
| **State** | [Zustand](https://github.com/pmndrs/zustand) | `^5.0.11` |
| **API** | `@apollo/client` | `^4.1.6` |
| **API** | `graphql` | `^16.13.1` |
| **Routing** | `react-router-dom` | `^7.13.1` |
| **Forms** | `react-hook-form` | `^7.71.2` |
| **Icons** | `lucide-react` | `^1.0.1` |
| **Auth helper** | `jwt-decode` | `^4.0.0` |
| **Apollo links** | `rxjs` | `^7.8.2` |
| **Language** | `typescript` | `~5.9.3` |
| **Lint** | `eslint` | `^9.39.1` |

Dev tooling also includes `@vitejs/plugin-react-swc` `^4.2.2` for fast React refresh with SWC.

## Vite

- **Role:** Dev server, production build, and preview.
- **Config:** `vite.config.ts` — plugins: `@tailwindcss/vite`, `@vitejs/plugin-react-swc`.
- **Path alias:** `@` → `./src` (use imports like `@/auth/authStore`).
- **Scripts:** `yarn dev` (dev), `yarn build` (`tsc -b` then `vite build`), `yarn preview`.

## Tailwind CSS v4

- **Versions:** `tailwindcss` and `@tailwindcss/vite` are aligned (e.g. `^4.1.18`).
- **Integration:** The Vite plugin (`tailwindcss()` in `vite.config.ts`) wires Tailwind into the build; there is no separate `tailwind.config.js` in the classic v3 style unless you add one later.
- **Entry:** `src/index.css` uses `@import "tailwindcss";` plus project layers: `base.css`, `theme.css`, and component CSS under `styles/components/`.

## Zustand

- **Version:** `^5.0.11`.
- **Usage:** Global auth state in `src/auth/authStore.ts` — `useAuthStore` with the **devtools** middleware (store name `AuthStore` in Redux DevTools).
- **Pattern:** State is hydrated from `sessionStorage` via `authStorage`; actions sync token/user and update the store; selectors (`selectAccessToken`, etc.) help limit re-renders.
- **Apollo integration:** `useAuthStore.getState()` is used in the GraphQL client for the auth header and refresh-token flow.

## GraphQL (Apollo Client 4)

- **Client:** `src/graphql/client.ts` — `ApolloClient` with `InMemoryCache`, `HttpLink` to `import.meta.env.VITE_ARP_GRAPHQL_API_URL`, `credentials: 'include'` for cookies.
- **Links:** `ErrorLink` (token refresh on auth errors), `SetContextLink` (Bearer token), then HTTP — order matters.
- **RxJS:** Custom link logic uses `Observable` from `rxjs` (Apollo Client 4 link expectations).
- **App:** `ApolloProvider` wraps the router in `src/router/AppRouter.tsx`.

## Other libraries (short)

- **React Router v7:** `BrowserRouter`, `Routes`, protected routes (`ProtectedRoute`, `AuthGuard`).
- **React Hook Form:** form handling (e.g. login flows).
- **Lucide React:** icon set.
- **jwt-decode:** decoding JWT payloads when needed (paired with server-issued tokens).

## Environment

- **`VITE_ARP_GRAPHQL_API_URL`:** GraphQL HTTP endpoint for the Apollo `HttpLink` (set in a `.env` / `.env.local` file for local development).

## Project layout (high level)

- `src/main.tsx` — entry; mounts `AppRouter`.
- `src/router/` — routing and provider composition.
- `src/auth/` — Zustand store, storage helpers, guards, and auth context.
- `src/graphql/` — Apollo client and mutations.
- `src/pages/` — page components.
- `src/components/` — reusable UI (buttons, inputs, etc.).
- `src/styles/` — Tailwind layers and component-specific CSS.

---

*Versions listed as semver ranges from `package.json`; run `yarn why <package>` to see how a dependency is resolved (version and why it is installed).*
