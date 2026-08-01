/**
 * Container tests - Complete Revision
 * 
 * @module tests/unit/core/Container.test
 * @author Luxarion Labs
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Container from '../../../src/core/Container.js';

describe('Container', () => {
  let container;

  beforeEach(() => {
    container = new Container();
    
    // Set environment for security module
    if (typeof process !== 'undefined' && process.env) {
      process.env.ALLOWED_ORIGINS = 'http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000';
    }
  });

  afterEach(() => {
    container.clear();
  });

  describe('register', () => {
    it('should register a service', () => {
      container.register('test', { value: 123 });
      expect(container.has('test')).toBe(true);
    });

    it('should throw when registering duplicate service', () => {
      container.register('test', { value: 123 });
      expect(() => container.register('test', { value: 456 })).toThrow(/already registered/);
    });

    it('should register with type transient by default', () => {
      container.register('test', { value: 123 });
      const info = container.getServiceInfo('test');
      expect(info.type).toBe('transient');
    });

    it('should register with custom options', () => {
      container.register('test', { value: 123 }, { 
        type: 'singleton',
        dependencies: ['dep1', 'dep2']
      });
      const info = container.getServiceInfo('test');
      expect(info.type).toBe('singleton');
      expect(info.dependencies).toEqual(['dep1', 'dep2']);
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

    it('should return the same instance for object values', () => {
      const obj = { value: 42 };
      container.singleton('test', obj);
      
      const result1 = container.get('test');
      const result2 = container.get('test');
      
      expect(result1).toBe(obj);
      expect(result2).toBe(obj);
      expect(result1).toBe(result2);
    });

    it('should handle singleton with dependencies', () => {
      container.singleton('dep', { value: 'dependency' });
      container.singleton('test', (deps) => {
        return { value: deps.dep.value };
      }, { dependencies: ['dep'] });
      
      const result1 = container.get('test');
      const result2 = container.get('test');
      
      expect(result1).toBe(result2);
      expect(result1.value).toBe('dependency');
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

    it('should handle factory with positional dependencies', () => {
      container.singleton('depA', 'A');
      container.singleton('depB', 'B');
      
      container.factory('combined', (depA, depB) => {
        return depA + depB;
      }, { dependencies: ['depA', 'depB'] });
      
      const result = container.get('combined');
      expect(result).toBe('AB');
    });

    it('should handle factory with named dependencies as object', () => {
      container.singleton('depA', 'A');
      container.singleton('depB', 'B');
      
      container.factory('combined', (deps) => {
        return deps.depA + deps.depB;
      }, { dependencies: ['depA', 'depB'] });
      
      const result = container.get('combined');
      expect(result).toBe('AB');
    });

    it('should handle factory with complex dependencies', () => {
      container.singleton('config', { api: 'https://api.example.com', timeout: 5000 });
      container.singleton('logger', { log: (msg) => msg });
      
      container.factory('service', (deps) => {
        return {
          url: deps.config.api,
          timeout: deps.config.timeout,
          log: deps.logger.log
        };
      }, { dependencies: ['config', 'logger'] });
      
      const service = container.get('service');
      expect(service.url).toBe('https://api.example.com');
      expect(service.timeout).toBe(5000);
      expect(typeof service.log).toBe('function');
    });
  });

  describe('transient', () => {
    it('should return a new instance each time', () => {
      let counter = 0;
      container.transient('counter', () => ++counter);
      
      const result1 = container.get('counter');
      const result2 = container.get('counter');
      
      expect(result1).toBe(1);
      expect(result2).toBe(2);
      expect(result1).not.toBe(result2);
    });

    it('should handle transient with dependencies', () => {
      container.singleton('depA', 'A');
      container.singleton('depB', 'B');
      
      container.transient('combined', (deps) => {
        return deps.depA + deps.depB;
      }, { dependencies: ['depA', 'depB'] });
      
      const result1 = container.get('combined');
      const result2 = container.get('combined');
      
      expect(result1).toBe('AB');
      expect(result2).toBe('AB');
      expect(result1).toBe(result2); // Transient with same dependencies returns same value but different instance
    });
  });

  describe('alias', () => {
    it('should create an alias for a service', () => {
      container.singleton('original', { value: 123 });
      container.alias('alias', 'original');
      
      expect(container.get('alias')).toBe(container.get('original'));
    });

    it('should throw when target service does not exist', () => {
      expect(() => container.alias('alias', 'nonexistent')).toThrow(
        /Target service "nonexistent" not found/
      );
    });

    it('should resolve alias through parent container', () => {
      const parent = new Container();
      parent.singleton('original', { value: 'parent' });
      const child = parent.createChild();
      child.alias('alias', 'original');
      
      expect(child.get('alias')).toBe(parent.get('original'));
    });
  });

  describe('dependency injection - CRITICAL', () => {
    it('should inject dependencies with primitive values', () => {
      container.singleton('depA', 'Hello');
      container.singleton('depB', 'World');
      
      container.factory('combined', (deps) => {
        return deps.depA + ' ' + deps.depB;
      }, { dependencies: ['depA', 'depB'] });
      
      expect(container.get('combined')).toBe('Hello World');
    });

    it('should inject dependencies with object values', () => {
      container.singleton('depA', { value: 'Hello' });
      container.singleton('depB', { value: 'World' });
      
      container.factory('combined', (deps) => {
        return deps.depA.value + ' ' + deps.depB.value;
      }, { dependencies: ['depA', 'depB'] });
      
      expect(container.get('combined')).toBe('Hello World');
    });

    it('should inject dependencies with mixed types', () => {
      container.singleton('name', 'Luxarion');
      container.singleton('version', 1.0);
      container.singleton('config', { debug: true });
      
      container.factory('service', (deps) => {
        return {
          name: deps.name,
          version: deps.version,
          debug: deps.config.debug
        };
      }, { dependencies: ['name', 'version', 'config'] });
      
      const service = container.get('service');
      expect(service.name).toBe('Luxarion');
      expect(service.version).toBe(1.0);
      expect(service.debug).toBe(true);
    });

    it('should inject dependencies with factory functions', () => {
      container.singleton('depA', 'A');
      container.singleton('depB', 'B');
      
      container.factory('combined', (depA, depB) => {
        return depA + depB + '!';
      }, { dependencies: ['depA', 'depB'] });
      
      expect(container.get('combined')).toBe('AB!');
    });

    it('should handle dependency chains', () => {
      container.singleton('base', 'base');
      container.singleton('middle', (deps) => {
        return deps.base + '-middle';
      }, { dependencies: ['base'] });
      container.singleton('top', (deps) => {
        return deps.middle + '-top';
      }, { dependencies: ['middle'] });
      
      const result = container.get('top');
      expect(result).toBe('base-middle-top');
    });

    it('should handle circular dependencies gracefully', () => {
      container.singleton('serviceA', (deps) => {
        return { name: 'A', getB: () => deps.serviceB };
      }, { dependencies: ['serviceB'] });
      
      container.singleton('serviceB', (deps) => {
        return { name: 'B', getA: () => deps.serviceA };
      }, { dependencies: ['serviceA'] });
      
      expect(() => container.get('serviceA')).toThrow(/Circular dependency/);
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

    it('should not affect parent when child registers new service', () => {
      container.singleton('parent', { value: 'parent' });
      const child = container.createChild();
      child.singleton('child', { value: 'child' });
      
      expect(child.has('child')).toBe(true);
      expect(container.has('child')).toBe(false);
    });

    it('should resolve dependencies from parent', () => {
      container.singleton('dep', 'from parent');
      const child = container.createChild();
      
      child.factory('test', (deps) => {
        return deps.dep;
      }, { dependencies: ['dep'] });
      
      expect(child.get('test')).toBe('from parent');
    });

    it('should support multi-level inheritance', () => {
      container.singleton('level1', 'level1');
      const child = container.createChild();
      child.singleton('level2', 'level2');
      const grandchild = child.createChild();
      grandchild.singleton('level3', 'level3');
      
      expect(grandchild.get('level1')).toBe('level1');
      expect(grandchild.get('level2')).toBe('level2');
      expect(grandchild.get('level3')).toBe('level3');
    });
  });

  describe('getServiceInfo', () => {
    it('should return service info', () => {
      container.register('test', { value: 123 }, { type: 'singleton' });
      const info = container.getServiceInfo('test');
      
      expect(info.name).toBe('test');
      expect(info.type).toBe('singleton');
      expect(info.isAlias).toBe(false);
      expect(info.target).toBeNull();
    });

    it('should return null for non-existent service', () => {
      expect(container.getServiceInfo('nonexistent')).toBeNull();
    });

    it('should return info for alias', () => {
      container.singleton('original', { value: 123 });
      container.alias('alias', 'original');
      const info = container.getServiceInfo('alias');
      
      expect(info.isAlias).toBe(true);
      expect(info.target).toBe('original');
    });

    it('should return info from parent container', () => {
      container.singleton('parent', { value: 'parent' });
      const child = container.createChild();
      const info = child.getServiceInfo('parent');
      
      expect(info.name).toBe('parent');
      expect(info.type).toBe('singleton');
    });
  });

  describe('remove', () => {
    it('should remove a service', () => {
      container.register('test', { value: 123 });
      expect(container.has('test')).toBe(true);
      
      const removed = container.remove('test');
      expect(removed).toBe(true);
      expect(container.has('test')).toBe(false);
    });

    it('should return false when removing non-existent service', () => {
      const removed = container.remove('nonexistent');
      expect(removed).toBe(false);
    });

    it('should remove singleton instance', () => {
      container.singleton('test', { value: 123 });
      const instance1 = container.get('test');
      
      container.remove('test');
      container.singleton('test', { value: 456 });
      const instance2 = container.get('test');
      
      expect(instance1).not.toBe(instance2);
      expect(instance2.value).toBe(456);
    });
  });

  describe('clear', () => {
    it('should remove all services', () => {
      container.register('test1', { value: 1 });
      container.register('test2', { value: 2 });
      
      container.clear();
      
      expect(container.has('test1')).toBe(false);
      expect(container.has('test2')).toBe(false);
    });

    it('should clear singleton cache', () => {
      container.singleton('test', { value: 123 });
      const instance1 = container.get('test');
      
      container.clear();
      container.singleton('test', { value: 456 });
      const instance2 = container.get('test');
      
      expect(instance1).not.toBe(instance2);
      expect(instance2.value).toBe(456);
    });
  });

  describe('getOrCreate', () => {
    it('should get existing service', () => {
      container.singleton('test', { value: 123 });
      const result = container.getOrCreate('test', () => ({ value: 456 }));
      
      expect(result.value).toBe(123);
    });

    it('should create new service if not exists', () => {
      const result = container.getOrCreate('test', () => ({ value: 456 }));
      
      expect(result.value).toBe(456);
      expect(container.has('test')).toBe(true);
    });

    it('should pass options to registration', () => {
      const result = container.getOrCreate('test', () => ({ value: 123 }), {
        dependencies: ['dep']
      });
      
      const info = container.getServiceInfo('test');
      expect(info.dependencies).toEqual(['dep']);
    });
  });

  describe('type checks', () => {
    it('should check if service is singleton', () => {
      container.singleton('single', { value: 1 });
      container.factory('factory', () => 2);
      container.transient('trans', { value: 3 });
      
      expect(container.isSingleton('single')).toBe(true);
      expect(container.isSingleton('factory')).toBe(false);
      expect(container.isSingleton('trans')).toBe(false);
    });

    it('should check if service is factory', () => {
      container.singleton('single', { value: 1 });
      container.factory('factory', () => 2);
      container.transient('trans', { value: 3 });
      
      expect(container.isFactory('single')).toBe(false);
      expect(container.isFactory('factory')).toBe(true);
      expect(container.isFactory('trans')).toBe(false);
    });

    it('should check parent container for type', () => {
      container.singleton('parent', { value: 1 });
      const child = container.createChild();
      
      expect(child.isSingleton('parent')).toBe(true);
    });

    it('should return false for non-existent service', () => {
      expect(container.isSingleton('nonexistent')).toBe(false);
      expect(container.isFactory('nonexistent')).toBe(false);
    });
  });

  describe('listServices', () => {
    it('should list all registered services', () => {
      container.register('test1', { value: 1 });
      container.register('test2', { value: 2 });
      
      const services = container.listServices();
      expect(services).toContain('test1');
      expect(services).toContain('test2');
    });

    it('should include parent services', () => {
      container.register('parent', { value: 1 });
      const child = container.createChild();
      child.register('child', { value: 2 });
      
      const services = child.listServices();
      expect(services).toContain('parent');
      expect(services).toContain('child');
    });

    it('should not include duplicates', () => {
      container.register('test', { value: 1 });
      const child = container.createChild();
      child.register('test', { value: 2 });
      
      const services = child.listServices();
      const count = services.filter(s => s === 'test').length;
      expect(count).toBe(1); // Child overrides parent
    });
  });

  describe('setParent', () => {
    it('should set parent container', () => {
      const parent = new Container();
      const child = new Container();
      
      child.setParent(parent);
      expect(child.getParent()).toBe(parent);
    });

    it('should inherit services after setParent', () => {
      const parent = new Container();
      parent.singleton('test', { value: 'parent' });
      const child = new Container();
      
      child.setParent(parent);
      expect(child.get('test').value).toBe('parent');
    });
  });

  describe('static createDefault', () => {
    it('should create container with default services', () => {
      const defaultContainer = Container.createDefault();
      
      expect(defaultContainer.has('container')).toBe(true);
      expect(defaultContainer.has('logger')).toBe(true);
      expect(defaultContainer.has('errorHandler')).toBe(true);
      expect(defaultContainer.has('config')).toBe(true);
    });

    it('should handle onError callback', () => {
      let errorCalled = false;
      const defaultContainer = Container.createDefault({
        onError: (error) => {
          errorCalled = true;
        }
      });
      
      const errorHandler = defaultContainer.get('errorHandler');
      expect(() => errorHandler.handle(new Error('test error'))).toThrow('test error');
      expect(errorCalled).toBe(true);
    });

    it('should handle custom logger', () => {
      const customLogger = {
        log: () => {},
        error: () => {},
        warn: () => {},
        info: () => {}
      };
      
      const defaultContainer = Container.createDefault({
        logger: customLogger
      });
      
      const logger = defaultContainer.get('logger');
      expect(logger).toBe(customLogger);
    });

    it('should include config with environment', () => {
      const defaultContainer = Container.createDefault();
      const config = defaultContainer.get('config');
      
      expect(config).toHaveProperty('environment');
      expect(config).toHaveProperty('debug');
    });
  });
});
