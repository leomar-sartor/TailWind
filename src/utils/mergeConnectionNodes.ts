/**
 * Concatenates previous and next connection nodes for Apollo `fetchMore`
 * `updateQuery`. Never replace the list with only the next page.
 */
export function mergeConnectionNodes<TNode>(
  previousNodes: TNode[] | null | undefined,
  nextNodes: TNode[] | null | undefined,
): TNode[] {
  return [...(previousNodes ?? []), ...(nextNodes ?? [])];
}
