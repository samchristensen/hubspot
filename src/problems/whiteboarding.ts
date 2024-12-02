export function runWhiteboard() {
  const mergedList = mergedLists([1, 3, 5], [2, 6, 8, 9], 3);

  console.log({
    passed: mergedList[0] === 1 && mergedList[1] === 2 && mergedList[2] === 3,
    mergedList,
  });

  const mergedList2 = mergedLists([5], [9], 3);

  console.log({
    passed: mergedList2[0] === 5 && mergedList2[1] === 9 && mergedList2[2] === undefined,
    mergedList2,
  });

  const mergedList3 = mergedLists([-5], [9], 3);

  console.log({
    passed: mergedList3[0] === -5 && mergedList3[1] === 9 && mergedList3[2] === undefined,
    mergedList3,
  });

  const mergedList4 = mergedLists([4], [-8], 3);

  console.log({
    passed: mergedList4[0] === -8 && mergedList4[1] === 4 && mergedList4[2] === undefined,
    mergedList4,
  });

  const mergedList5 = mergedLists([4], [-8], 0);

  console.log({
    passed:
      mergedList5[0] === undefined && mergedList5[1] === undefined && mergedList5[2] === undefined,
    mergedList5,
  });
}

function mergedLists(a: number[], b: number[], maxResultLength: number): number[] {
  const mergedArray: number[] = [];

  let currentAIndex: number = 0;
  let currentBIndex: number = 0;

  for (
    let i = 0;
    i < maxResultLength && (currentAIndex < a.length || currentBIndex < b.length);
    i++
  ) {
    // using MAX_SAFE_INTEGER here to reduce complexity around the undefined value,
    // this assumes that the values in the arrays are all integers
    let currentAValue: number = Number.MAX_SAFE_INTEGER;
    let currentBValue: number = Number.MAX_SAFE_INTEGER;

    if (currentAIndex < a.length) {
      currentAValue = a[currentAIndex];
    }

    if (currentBIndex < b.length) {
      currentBValue = b[currentBIndex];
    }

    // no preference for a vs b when tied, so default to a but open to change this
    if (currentAValue <= currentBValue) {
      mergedArray.push(currentAValue);
      currentAIndex++;
    } else {
      mergedArray.push(currentBValue);
      currentBIndex++;
    }
  }

  return mergedArray;
}
