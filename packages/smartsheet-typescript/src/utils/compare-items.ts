export function compareItems<T>(a: T[], b: T[]): boolean {
  return a.every((aItem) => b.includes(aItem)) && b.every((bItem) => a.includes(bItem));
}
