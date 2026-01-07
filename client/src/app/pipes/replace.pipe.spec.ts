import { ReplacePipe } from './replace.pipe';

describe('ReplacePipe', () => {
  let pipe: ReplacePipe;

  beforeEach(() => {
    pipe = new ReplacePipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should replace a single occurrence', () => {
    const result = pipe.transform('hello world', 'world', 'universe');
    expect(result).toBe('hello universe');
  });

  it('should replace all occurrences', () => {
    const result = pipe.transform('hello hello hello', 'hello', 'hi');
    expect(result).toBe('hi hi hi');
  });

  it('should handle case-sensitive replacement', () => {
    const result = pipe.transform('Hello hello HELLO', 'hello', 'hi');
    expect(result).toBe('Hello hi HELLO');
  });

  it('should return original string if search term not found', () => {
    const result = pipe.transform('hello world', 'foo', 'bar');
    expect(result).toBe('hello world');
  });

  it('should replace with every character when search string is empty', () => {
    const result = pipe.transform('hello', '', 'x');
    // Empty regex matches every position in string
    expect(result.length).toBeGreaterThan('hello'.length);
  });

  it('should handle special regex characters', () => {
    const result = pipe.transform('hello.world', '\\.', '-');
    expect(result).toBe('hello-world');
  });

  it('should replace with empty string', () => {
    const result = pipe.transform('hello world', ' ', '');
    expect(result).toBe('helloworld');
  });
});
