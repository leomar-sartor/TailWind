import { gql } from '@apollo/client';
export const GET_TENANTS = gql`
  query GetTenants($first: Int = 10, $after: String, $where: TenantFilterInput) {
    tenants(first: $first, after: $after, where: $where, order: [{ id: DESC }]) {
      nodes { id nome ativo } totalCount pageInfo { hasNextPage endCursor }
    }
  }
`;
export const UPDATE_TENANT = gql`mutation UpdateTenant($id: Long!, $nome: String!) { updateTenant(id: $id, nome: $nome) { id nome } }`;
export const REMOVE_TENANT = gql`mutation RemoveTenant($id: Long!) { removeTenant(id: $id) }`;
export type TenantNode = { id: string; nome: string; ativo: boolean };
export type GetTenantsData = { tenants: { nodes: TenantNode[]; totalCount: number; pageInfo: { hasNextPage: boolean; endCursor: string | null } } | null };
