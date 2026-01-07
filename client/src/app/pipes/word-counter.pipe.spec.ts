import { WordCounterPipe } from './word-counter.pipe';

describe('WordCounterPipe', () => {
  let pipe: WordCounterPipe;

  beforeEach(() => {
    pipe = new WordCounterPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should count words in a simple sentence', () => {
    expect(pipe.transform('hello world')).toBe(2);
  });

  it('should count words with multiple spaces', () => {
    expect(pipe.transform('hello    world')).toBe(2);
  });

  it('should count words with leading and trailing spaces', () => {
    expect(pipe.transform('  hello world  ')).toBe(2);
  });

  it('should count a single word', () => {
    expect(pipe.transform('hello')).toBe(1);
  });

  it('should return 0 for empty string', () => {
    expect(pipe.transform('')).toBe(0);
  });

  it('should return 0 for null', () => {
    expect(pipe.transform(null)).toBe(0);
  });

  it('should return 0 for undefined', () => {
    expect(pipe.transform(undefined)).toBe(0);
  });

  it('should return 0 for non-string values', () => {
    expect(pipe.transform(123)).toBe(0);
    expect(pipe.transform({})).toBe(0);
    expect(pipe.transform([])).toBe(0);
  });

  it('should count words with tabs and newlines', () => {
    expect(pipe.transform('hello\tworld\ntest')).toBe(3);
  });
});
