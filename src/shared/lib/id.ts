let sequence = 100

export function createId(prefix: string) {
  sequence += 1
  return `${prefix}_${sequence}`
}
