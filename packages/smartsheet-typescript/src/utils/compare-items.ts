export function compareItems<T>(a: T[] | undefined | null, b: T[] | undefined | null): boolean {
  if (!a || !b) return false;
  return a.every((aItem) => b.includes(aItem)) && b.every((bItem) => a.includes(bItem));
}
