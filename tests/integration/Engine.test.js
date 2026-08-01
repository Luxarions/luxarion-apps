/**
 * Engine integration tests.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Luxarion, { Container, LuxarionEngine } from '../../src/index.js';

describe('Engine Integration', () => {
  let engine;

  beforeEach(() => {
    engine = LuxarionEngine.create({
      autoInit: true,
      security: {
        allowedOrigins: ['http://localhost:3000'],
        strictMode: false
      }
    });
  });

  afterEach(() => {
    engine.dispose();
  });

  describe('Core Services', () => {
    it('should have access to constants', () => {
      const constants = engine.get('constants');
      expect(constants.NAME).toBe('Luxarion');
      expect(constants.VERSION).toBe('1.0.0');
    });

    it('should have access to version', () => {
      const version = engine.get('version');
      expect(version.VERSION).toBe('1.0.0');
      expect(version.NAME).toBe('Luxarion');
    });

    it('should have access to utils', () => {
      const utils = engine.get('utils');
      expect(utils.array).toBeDefined();
      expect(utils.console).toBeDefined();
      expect(utils.async).toBeDefined();
      expect(utils.security).toBeDefined();
    });
  });

  describe('Security', () => {
    it('should initialize security module', () => {
      const security = engine.get('security');
      expect(security).toBeDefined();
      expect(security.getStatus().initialized).toBe(true);
    });

    it('should be authorized in allowed origin', () => {
      const security = engine.get('security');
      // Mock origin check
      const origGetOrigin = security._getOrigin;
      security._getOrigin = () => 'http://localhost:3000';
      
      expect(security.isAuthorized()).toBe(true);
      
      security._getOrigin = origGetOrigin;
    });
  });

  describe('Registration', () => {
    it('should register custom services', () => {
      engine.singleton('custom', { value: 'custom' });
      expect(engine.get('custom').value).toBe('custom');
    });

    it('should register factory services', () => {
      let counter = 0;
      engine.factory('counter', () => ++counter);
      
      expect(engine.get('counter')).toBe(1);
      expect(engine.get('counter')).toBe(2);
    });
  });

  describe('Child Engine', () => {
    it('should create child engine', () => {
      const child = engine.createChild();
      expect(child).toBeInstanceOf(LuxarionEngine);
      expect(child.get('constants')).toBe(engine.get('constants'));
    });
  });
});
