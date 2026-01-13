export function compareById(a, b) {
  return a.id - b.id
}

export function quickSort(arr, compare) {
  if (!Array.isArray(arr)) return []
  if (arr?.length <= 1) {
    return arr
  }

  const pivot = arr[0]
  const left = []
  const right = []

  for (let i = 1; i < arr?.length; i++) {
    if (compare(arr[i], pivot) < 0) {
      left.push(arr[i])
    } else {
      right.push(arr[i])
    }
  }

  return [...quickSort(left, compare), pivot, ...quickSort(right, compare)]
}
