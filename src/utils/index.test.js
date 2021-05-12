import csv from './index';

test('test parse lines', () => {
  expect(csv.parseLines('1,2,3\r\n4,5,6\r\n', ','))
    .toStrictEqual([['1', '2', '3'], ['4', '5', '6']]);
  expect(csv.parseLines('"1,2","3,4","5,6"\r\n"2,3","4,6","6,9"', ','))
    .toStrictEqual([['1,2', '3,4', '5,6'], ['2,3', '4,6', '6,9']]);
  expect(csv.parseLines('"""1,2"",""3,4"",""5,6"""\r\n"""2,3"",""4,6"",""6,9"""', ','))
    .toStrictEqual([['"1,2","3,4","5,6"'], ['"2,3","4,6","6,9"']]);
  expect(csv.parseLines('"1\r\n2","3\r\n4","5\r\n6"\r\n"2\r\n3","4\r\n6","6\r\n9"', ','))
    .toStrictEqual([['1\r\n2', '3\r\n4', '5\r\n6'], ['2\r\n3', '4\r\n6', '6\r\n9']]);
});

test('test map fields', () => {
  expect(csv.mapFields('abc', [0, 1, 2])).toStrictEqual('abc');
  expect(csv.mapFields('abc', [1, 2, 0])).toStrictEqual('cab');
  expect(csv.mapFields('abc', [1, 2, 4])).toStrictEqual('_ab_c');
});
