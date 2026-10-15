import { gql } from '@apollo/client';

export const CREATE_TENANT = gql`
  mutation CreateTenant($nome: String!) {
    createTenant(nome: $nome) { id nome }
  }
`;

export const GRANT_TENANT_MEMBERSHIP = gql`
  mutation GrantTenantMembership($userId: Long!, $tenantId: Long!) {
    grantTenantMembership(userId: $userId, tenantId: $tenantId) { id }
  }
`;

export const GRANT_COMPANY_MEMBERSHIP = gql`
  mutation GrantCompanyMembership($userId: Long!, $companyId: Long!) {
    grantCompanyMembership(userId: $userId, companyId: $companyId) { id }
  }
`;

export const REVOKE_COMPANY_MEMBERSHIP = gql`
  mutation RevokeCompanyMembership($userId: Long!, $companyId: Long!) {
    revokeCompanyMembership(userId: $userId, companyId: $companyId)
  }
`;

export const ASSIGN_PERSONA = gql`
  mutation AssignPersona($userId: Long!, $personaCode: String!, $tenantId: Long!, $companyId: Long) {
    assignPersona(userId: $userId, personaCode: $personaCode, tenantId: $tenantId, companyId: $companyId) { id }
  }
`;

export const GRANT_GLOBAL_ADMIN = gql`
  mutation GrantGlobalAdmin($userId: Long!) {
    grantGlobalAdmin(userId: $userId)
  }
`;

export const REVOKE_GLOBAL_ADMIN = gql`
  mutation RevokeGlobalAdmin($userId: Long!) {
    revokeGlobalAdmin(userId: $userId)
  }
`;

export const SET_PERSONA_PERMISSIONS = gql`
  mutation SetPersonaPermissions($personaCode: String!, $permissionCodes: [String!]!) {
    setPersonaPermissions(personaCode: $personaCode, permissionCodes: $permissionCodes)
  }
`;

export const REVOKE_PERSONA = gql`
  mutation RevokePersona($assignmentId: Long!) {
    revokePersona(assignmentId: $assignmentId)
  }
`;

export const UPDATE_ACCESS_USER = gql`
  mutation UpdateAccessUser($userId: Long!, $userName: String!, $email: String!) {
    updateAccessUser(userId: $userId, userName: $userName, email: $email)
  }
`;
export const REMOVE_ACCESS_USER = gql`
  mutation RemoveAccessUser($userId: Long!) { removeAccessUser(userId: $userId) }
`;
export const UPDATE_ACCESS_PERMISSION = gql`
  mutation UpdateAccessPermission($id: Long!, $descricao: String!) { updateAccessPermission(id: $id, descricao: $descricao) }
`;
export const REMOVE_ACCESS_PERMISSION = gql`
  mutation RemoveAccessPermission($id: Long!) { removeAccessPermission(id: $id) }
`;
export const UPDATE_TENANT_MEMBERSHIP = gql`
  mutation UpdateTenantMembership($userId: Long!, $tenantId: Long!, $newTenantId: Long!) {
    updateTenantMembership(userId: $userId, tenantId: $tenantId, newTenantId: $newTenantId)
  }
`;
export const REVOKE_TENANT_MEMBERSHIP = gql`
  mutation RevokeTenantMembership($userId: Long!, $tenantId: Long!) {
    revokeTenantMembership(userId: $userId, tenantId: $tenantId)
  }
`;
