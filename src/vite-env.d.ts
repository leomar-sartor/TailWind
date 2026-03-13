// src/vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ARP_GRAPHQL_API_URL: string;
  // adicione outras variáveis aqui conforme precisar
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}