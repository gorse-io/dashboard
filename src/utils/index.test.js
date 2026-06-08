import { mapFields, parseLines } from './index';

test('test parse lines', () => {
  expect(parseLines('1,2,3\r\n4,5,6\r\n', ','))
    .toStrictEqual([['1', '2', '3'], ['4', '5', '6']]);
  expect(parseLines('"1,2","3,4","5,6"\r\n"2,3","4,6","6,9"', ','))
    .toStrictEqual([['1,2', '3,4', '5,6'], ['2,3', '4,6', '6,9']]);
  expect(parseLines('"""1,2"",""3,4"",""5,6"""\r\n"""2,3"",""4,6"",""6,9"""', ','))
    .toStrictEqual([['"1,2","3,4","5,6"'], ['"2,3","4,6","6,9"']]);
  expect(parseLines('"1\r\n2","3\r\n4","5\r\n6"\r\n"2\r\n3","4\r\n6","6\r\n9"', ','))
    .toStrictEqual([['1\r\n2', '3\r\n4', '5\r\n6'], ['2\r\n3', '4\r\n6', '6\r\n9']]);
});

test('test map fields', () => {
  expect(mapFields('abc', [0, 1, 2])).toStrictEqual('abc');
  expect(mapFields('abc', [1, 2, 0])).toStrictEqual('cab');
  expect(mapFields('abc', [1, 2, 4])).toStrictEqual('_ab_c');
});
