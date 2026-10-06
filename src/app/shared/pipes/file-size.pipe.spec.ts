import { FileSizePipe } from './file-size.pipe';

describe('FileSizePipe', () => {
  const pipe = new FileSizePipe();

  it('formats bytes, kilobytes and megabytes', () => {
    expect(pipe.transform(512)).toBe('512 B');
    expect(pipe.transform(1536)).toBe('1.5 KB');
    expect(pipe.transform(10 * 1024 * 1024)).toBe('10 MB');
  });

  it('returns an empty string for missing values', () => {
    expect(pipe.transform(null)).toBe('');
  });
});
