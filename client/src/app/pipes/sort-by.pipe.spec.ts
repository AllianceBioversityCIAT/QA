import { SortByPipe } from './sort-by.pipe';

describe('SortByPipe', () => {
  let pipe: SortByPipe;

  beforeEach(() => {
    pipe = new SortByPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return original array if value is null or undefined', () => {
    expect(pipe.transform(null, 'asc')).toBe(null);
    expect(pipe.transform(undefined, 'asc')).toBe(undefined);
  });

  it('should return original array if order is empty', () => {
    const arr = [3, 1, 2];
    expect(pipe.transform(arr, '')).toBe(arr);
  });

  it('should return original array if order is not provided', () => {
    const arr = [3, 1, 2];
    expect(pipe.transform(arr, null as any)).toBe(arr);
  });

  it('should sort simple array without column', () => {
    const arr = [3, 1, 2];
    const result = pipe.transform(arr, 'asc');
    expect(result).toEqual([1, 2, 3]);
  });

  it('should return array unchanged if length is 1 or less', () => {
    const singleItem = [{ name: 'test' }];
    expect(pipe.transform(singleItem, 'asc', 'name')).toEqual(singleItem);

    const emptyArray: any[] = [];
    expect(pipe.transform(emptyArray, 'asc', 'name')).toEqual(emptyArray);
  });

  it('should sort array of objects by column in ascending order', () => {
    const arr = [
      { id: 3, name: 'Charlie' },
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' }
    ];
    const result = pipe.transform(arr, 'asc', 'name');
    expect(result[0].name).toBe('Alice');
    expect(result[1].name).toBe('Bob');
    expect(result[2].name).toBe('Charlie');
  });

  it('should sort array of objects by column in descending order', () => {
    const arr = [
      { id: 3, name: 'Charlie' },
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' }
    ];
    const result = pipe.transform(arr, 'desc', 'name');
    expect(result[0].name).toBe('Charlie');
    expect(result[1].name).toBe('Bob');
    expect(result[2].name).toBe('Alice');
  });

  it('should sort using id as secondary sort key', () => {
    const arr = [
      { id: 2, name: 'Alice' },
      { id: 1, name: 'Alice' },
      { id: 3, name: 'Bob' }
    ];
    const result = pipe.transform(arr, 'asc', 'name');
    expect(result[0].id).toBe(1);
    expect(result[1].id).toBe(2);
  });

  it('should handle empty column parameter', () => {
    const arr = [3, 1, 2];
    const result = pipe.transform(arr, 'asc', '');
    expect(result).toEqual([1, 2, 3]);
  });
});
