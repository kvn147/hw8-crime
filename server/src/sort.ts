/**
 * Sorts array in descending order according to comparator
 * @param arr of elements to sort
 * @param comparator for elements of type A
 *   returns a positive number if a > b, 0 if equal, negative if a < b
 * @modifies arr
 * @effects arr[k] >= arr[k+1] for any 0 <= k <= n - 2 where n = len(arr)
 */
export const sortDescending = <A> (arr: Array<A>, comparator: (a: A, b: A) => number): void => {
  const n = arr.length; // for convenience
  let i = Infinity; // TODO: fill in Task 1e

  // Inv: [1] arr[k-1] >= arr[k] for any 1 <= k <= i - 1
  while (i < n) {
    // element we're finding the correct position for in arr[0..i]
    const toInsert = arr[i];
    let j = Infinity; // TODO: fill in Task 1e
    // {{ P1 }}

    // Inv: [2] arr[k-1] >= arr[k] for any 1 <= k <= j - 1
    //    and toInsert > arr[m-1] >= arr[m] for any j+1 <= m <= i
    while (j != 0 && comparator(arr[j - 1], toInsert) < 0) {
      arr[j] = arr[j - 1]; // shift elements forward by 1
      j = j - 1;
    }
    // {{ P4 }}
    arr[j] = toInsert;
    // {{ Q1: arr[k-1] >= arr[k] for any 1 <= k <= i }}
    i = i + 1;
  }
  // {{ P6 }}
  // {{ post: arr[k-1] >= arr[k] for any 1 <= k <= n - 1 }}
}