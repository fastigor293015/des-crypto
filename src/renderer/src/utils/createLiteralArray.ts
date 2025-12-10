export function createLiteralArray<T extends string>(...args: T[]): T[] {
  return args
}
