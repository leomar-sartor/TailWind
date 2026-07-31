// src/graphql/Common/types.ts

/** GraphQL Long / ID values may arrive as number or string depending on serialization. */
export type EntityId = string | number;

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage?: boolean;
  startCursor?: string | null;
  endCursor?: string | null;
}

export interface PaginatedResult<T> {
  nodes: T[];
  pageInfo: PageInfo;
  totalCount?: number;
}

/** HotChocolate-style filter clause used in list `where` builders. */
export type FilterClause = Record<string, unknown>;

export type OrFilterInput = {
  or: FilterClause[];
};

export type AndFilterInput = {
  and: FilterClause[];
};

export type CursorPageVars = {
  first?: number;
  after?: string | null;
  where?: FilterClause | OrFilterInput | AndFilterInput | null;
};
