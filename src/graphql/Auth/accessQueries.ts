import { gql } from '@apollo/client';

export const GET_MY_AVAILABLE_ACCESS_CONTEXTS = gql`
  query MyAvailableAccessContexts {
    myAvailableAccessContexts {
      isAdmin
      contexts {
        tenantId
        tenantName
        companyId
        companyName
      }
    }
  }
`;

export const GET_MY_ACCESS_CONTROL = gql`
  query MyAccessControl {
    myPersonas
    myPermissions
  }
`;

export type GetMyAccessControlData = {
  myPersonas: string[];
  myPermissions: string[];
};

export const GET_ACCESS_MANAGED_USERS = gql`
  query GetAccessManagedUsers {
    accessManagedUsers {
      id
      email
      userName
      ativo
      isAdmin
      companyIds
    }
  }
`;

export const GET_TENANT_COMPANIES_FOR_ACCESS = gql`
  query GetTenantCompaniesForAccessManagement($tenantId: Long!) {
    tenantCompaniesForAccessManagement(tenantId: $tenantId) {
      id
      name
    }
  }
`;

export const GET_ACCESS_CATALOG = gql`
  query GetAccessCatalog {
    accessCatalog {
      id
      codigo
      nome
      permissoes {
        permissao {
          codigo
          descricao
        }
      }
    }
  }
`;

export const GET_ACTIVE_PERSONA_ASSIGNMENTS = gql`
  query GetActivePersonaAssignments {
    activePersonaAssignments {
      id
      userId
      email
      userName
      personaCode
      tenantId
      tenantName
      companyId
      companyName
    }
  }
`;

export const GET_ASSIGNABLE_PERMISSIONS = gql`
  query GetAssignablePermissions($personaCode: String!) {
    assignablePermissions(personaCode: $personaCode) {
      id
      codigo
      descricao
    }
  }
`;

export type GetAccessManagedUsersData = {
  accessManagedUsers: Array<{
    id: string;
    email: string;
    userName: string;
    ativo: boolean;
    isAdmin: boolean;
    companyIds: Array<string | number>;
  }>;
};

export type GetTenantCompaniesForAccessData = {
  tenantCompaniesForAccessManagement: Array<{ id: string; name: string }>;
};

export type GetAccessCatalogData = {
  accessCatalog: Array<{
    id: string;
    codigo: string;
    nome: string;
    permissoes: Array<{ permissao: { codigo: string; descricao: string } }>;
  }>;
};

export type GetActivePersonaAssignmentsData = {
  activePersonaAssignments: Array<{
    id: string;
    userId: string;
    email: string;
    userName: string;
    personaCode: string;
    tenantId: string;
    tenantName: string;
    companyId: string | null;
    companyName: string | null;
  }>;
};

export type AvailableAccessContext = {
  tenantId: string | null;
  tenantName: string;
  companyId: string | null;
  companyName: string | null;
};

export type GetMyAvailableAccessContextsData = {
  myAvailableAccessContexts: {
    isAdmin: boolean;
    contexts: AvailableAccessContext[];
  };
};

export type GetAssignablePermissionsData = {
  assignablePermissions: Array<{ id: string; codigo: string; descricao: string }>;
};

export const GET_ACCESS_PERMISSIONS = gql`
  query GetAccessPermissions { accessPermissions { id codigo descricao ativo } }
`;
export type AccessPermission = { id: string; codigo: string; descricao: string; ativo: boolean };
export type GetAccessPermissionsData = { accessPermissions: AccessPermission[] };

export const GET_ACCESS_USER_TENANTS = gql`
  query GetAccessUserTenants($userId: Long!) { accessUserTenants(userId: $userId) { id tenantId tenantName } }
`;
export type AccessUserTenant = { id: string; tenantId: string; tenantName: string };
export type GetAccessUserTenantsData = { accessUserTenants: AccessUserTenant[] };
