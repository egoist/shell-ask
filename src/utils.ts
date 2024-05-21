export function notEmpty<TValue>(
  value: TValue | null | undefined | "" | false
): value is TValue {
  return (
    value !== null && value !== undefined && value !== "" && value !== false
  )
}
