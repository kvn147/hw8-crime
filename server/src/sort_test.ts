import * as assert from 'assert';
import { sortDescending } from './sort';

describe('sort', function() {
  // Comparator functions to use in tests
  const numComp = (a: number, b: number) => a - b;
  const recComp = (a: {x: number, y: number}, b: {x: number, y: number}) => a.x - b.x;

  it('sortDescending', function() {
    // 0 case: no iterations of outer loop
    const empty: number[] = [];
    sortDescending(empty, numComp);
    assert.deepStrictEqual(empty, []);
    let lenOne = [20];
    sortDescending(lenOne, numComp);
    assert.deepStrictEqual(lenOne, [20]);

    // 1 case: 1 iteration of outer & inner loops
    let lenTwo = [20, 2];  // exits with arr[j - 1] >= elt
    sortDescending(lenTwo, numComp);
    assert.deepStrictEqual(lenTwo, [20, 2]);
    let lenTwo2 = [2, 20];  // exits with j=0
    sortDescending(lenTwo2, numComp);
    assert.deepStrictEqual(lenTwo2, [20, 2]);

    // many case: 2+ iterations over
    let lenThree = [3, 2, 6];  // exits with arr[j - 1] >= elt then j = 0
    sortDescending(lenThree, numComp);
    assert.deepStrictEqual(lenThree, [6, 3, 2]);
    let lenThree2 = [9, 8, 7];  // exits with arr[j - 1] >= elt each time
    sortDescending(lenThree2, numComp);
    assert.deepStrictEqual(lenThree2, [9, 8, 7]);
    let lenThree3 = [2, 4, 6];  // exits with j = 0 each time
    sortDescending(lenThree3, numComp);
    assert.deepStrictEqual(lenThree3, [6, 4, 2]);
    let lenFour = [1, 5, 1, 2];  // = elts exits with j = 0 each time
    sortDescending(lenFour, numComp);
    assert.deepStrictEqual(lenFour, [5, 2, 1, 1]);
    let lenSix = [4, 3, 5, 0, 1, 2];  // exits with both a few times
    sortDescending(lenSix, numComp);
    assert.deepStrictEqual(lenSix, [5, 4, 3, 2, 1, 0]);
  });

  it('sortDescending-stability', function() {
    let objArr: {x: number, y: number}[] = [
      {x: 3, y: 11},
      {x: 2, y: 1},
      {x: 4, y: 7},
      {x: 2, y: 8}
    ]
    sortDescending(objArr, recComp);

    const sortedObjArr: {x: number, y: number}[] = [
      {x: 4, y: 7},
      {x: 3, y: 11},
      {x: 2, y: 1}, // must come before other x = 2 record, otherwise stability broke
      {x: 2, y: 8}
    ]
    assert.deepStrictEqual(objArr, sortedObjArr);
  });

});