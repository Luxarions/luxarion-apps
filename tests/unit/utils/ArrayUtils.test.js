/**
 * ArrayUtils tests.
 */

import { describe, it, expect } from 'vitest';
import * as ArrayUtils from '../../../src/utils/ArrayUtils.js';

describe('ArrayUtils', () => {
  describe('min', () => {
    it('should return the minimum value', () => {
      expect(ArrayUtils.min([1, 2, 3])).toBe(1);
      expect(ArrayUtils.min([-1, -2, -3])).toBe(-3);
      expect(ArrayUtils.min([5])).toBe(5);
      expect(ArrayUtils.min([])).toBe(Infinity);
    });
  });

  describe('max', () => {
    it('should return the maximum value', () => {
      expect(ArrayUtils.max([1, 2, 3])).toBe(3);
      expect(ArrayUtils.max([-1, -2, -3])).toBe(-1);
      expect(ArrayUtils.max([5])).toBe(5);
      expect(ArrayUtils.max([])).toBe(-Infinity);
    });
  });

  describe('sum', () => {
    it('should return the sum of all elements', () => {
      expect(ArrayUtils.sum([1, 2, 3])).toBe(6);
      expect(ArrayUtils.sum([-1, -2, -3])).toBe(-6);
      expect(ArrayUtils.sum([])).toBe(0);
    });
  });

  describe('average', () => {
    it('should return the average of all elements', () => {
      expect(ArrayUtils.average([1, 2, 3])).toBe(2);
      expect(ArrayUtils.average([-1, -2, -3])).toBe(-2);
      expect(ArrayUtils.average([])).toBe(0);
    });
  });

  describe('unique', () => {
    it('should return unique values', () => {
      expect(ArrayUtils.unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
      expect(ArrayUtils.unique(['a', 'b', 'a', 'c'])).toEqual(['a', 'b', 'c']);
    });
  });

  describe('chunk', () => {
    it('should chunk array into smaller arrays', () => {
      expect(ArrayUtils.chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
      expect(ArrayUtils.chunk([1, 2, 3], 5)).toEqual([[1, 2, 3]]);
    });
  });

  describe('range', () => {
    it('should create a range array', () => {
      expect(ArrayUtils.range(0, 5)).toEqual([0, 1, 2, 3, 4]);
      expect(ArrayUtils.range(5, 0, -1)).toEqual([5, 4, 3, 2, 1]);
      expect(ArrayUtils.range(0, 10, 2)).toEqual([0, 2, 4, 6, 8]);
    });
  });
});
