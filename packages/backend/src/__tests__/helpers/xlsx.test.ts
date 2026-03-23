import { getCellValue } from '../../helpers/xlsx';

describe('xlsx helpers', () => {
  describe('getCellValue', () => {
    it('should return empty string for null', () => {
      expect(getCellValue(null)).toBe('');
    });

    it('should return empty string for undefined', () => {
      expect(getCellValue(undefined)).toBe('');
    });

    it('should return string value as-is', () => {
      expect(getCellValue('hello')).toBe('hello');
    });

    it('should convert number to string', () => {
      expect(getCellValue(42)).toBe('42');
    });

    it('should extract result from formula cell', () => {
      expect(getCellValue({ formula: 'A1+B1', result: 'test@email.com' })).toBe('test@email.com');
    });

    it('should return empty string for formula cell without result', () => {
      expect(getCellValue({ formula: 'A1+B1' })).toBe('');
    });

    it('should return empty string for formula cell with null result', () => {
      expect(getCellValue({ formula: 'A1+B1', result: null })).toBe('');
    });

    it('should extract text from hyperlink cell', () => {
      expect(getCellValue({ text: 'user@email.com', hyperlink: 'mailto:user@email.com' })).toBe('user@email.com');
    });

    it('should join rich text fragments', () => {
      expect(getCellValue({ richText: [{ text: 'hello ' }, { text: 'world' }] })).toBe('hello world');
    });

    it('should return empty string for error cell', () => {
      expect(getCellValue({ error: '#N/A' })).toBe('');
    });

    it('should return empty string for unknown object', () => {
      expect(getCellValue({ unknown: true })).toBe('');
    });
  });
});
