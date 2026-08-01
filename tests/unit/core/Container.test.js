/**
 * Container tests.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import Container from '../../../src/core/Container.js';

describe('Container', () => {
  let container;

  beforeEach(() => {
    container = new Container();
  });

  describe('register', () => {
    it('should register a service', () => {
      container.register('test', { value: 123 });
      expect(container.has('test')).toBe(true);
    });

    it('should throw when registering duplicate service', () => {
      container.register('test', { value: 123 });
      expect(() => container.register('test', { value: 456 })).toThrow();
    });
  });

  describe('singleton', () => {
    it('should return the same instance', () => {
      let counter = 0;
      container.singleton('counter', () => ++counter);
      
      const result1 = container.get('counter');
      const result2 = container.get('counter');
      
      expect(result1).toBe(1);
      expect(result2).toBe(1);
      expect(result1).toBe(result2);
    });
  });

  describe('factory', () => {
    it('should return a new instance each time', () => {
      let counter = 0;
      container.factory('counter', () => ++counter);
      
      const result1 = container.get('counter');
      const result2 = container.get('counter');
      
      expect(result1).toBe(1);
      expect(result2).toBe(2);
      expect(result1).not.toBe(result2);
    });
  });

  describe('alias', () => {
    it('should create an alias for a service', () => {
      container.singleton('original', { value: 123 });
      container.alias('alias', 'original');
      
      expect(container.get('alias')).toBe(container.get('original'));
    });
  });

  describe('dependency injection', () => {
    it('should inject dependencies', () => {
      container.singleton('depA', { value: 'A' });
      container.singleton('depB', { value: 'B' });
      
      container.factory('combined', (deps) => {
        return `${deps.depA.value}${deps.depB.value}`;
      }, { dependencies: ['depA', 'depB'] });
      
      expect(container.get('combined')).toBe('AB');
    });
  });

  describe('child container', () => {
    it('should inherit from parent', () => {
      container.singleton('parent', { value: 'parent' });
      const child = container.createChild();
      
      expect(child.has('parent')).toBe(true);
      expect(child.get('parent')).toBe(container.get('parent'));
    });

    it('should override parent services', () => {
      container.singleton('test', { value: 'parent' });
      const child = container.createChild();
      child.singleton('test', { value: 'child' });
      
      expect(child.get('test').value).toBe('child');
      expect(container.get('test').value).toBe('parent');
    });
  });
});
