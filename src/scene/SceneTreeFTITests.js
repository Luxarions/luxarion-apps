/**
 * LXRN SceneTreeFTITests Module
 * @namespace LXRN.SceneTreeFTITests
 * @author LXRN
 */

const SceneTreeFTI = require('./SceneTreeFTI.js');
const Node = require('./Node.js');

/**
 * FTI tests for SceneTreeFTI
 * @class SceneTreeFTITests
 */
class SceneTreeFTITests {
  /**
   * Run all tests
   * @returns {Array}
   */
  static runTests() {
    const results = [];
    results.push(SceneTreeFTITests.__testBasicFTI());
    results.push(SceneTreeFTITests.__testNodeRegistration());
    results.push(SceneTreeFTITests.__testUpdateRequest());
    results.push(SceneTreeFTITests.__testPerformance());
    return results;
  }

  /**
   * Test basic FTI functionality
   * @private
   * @returns {Object}
   */
  static __testBasicFTI() {
    const tree = new SceneTreeFTI();
    const test = {
      name: 'Basic FTI Test',
      passed: true,
      message: '',
    };
    
    try {
      if (!tree.ftiEnabled) {
        tree.ftiEnabled = true;
      }
      if (!tree.ftiEnabled) {
        test.passed = false;
        test.message = 'FTI enable failed';
      }
    } catch (error) {
      test.passed = false;
      test.message = error.message;
    }
    return test;
  }

  /**
   * Test node registration
   * @private
   * @returns {Object}
   */
  static __testNodeRegistration() {
    const tree = new SceneTreeFTI();
    const test = {
      name: 'Node Registration Test',
      passed: true,
      message: '',
    };
    
    try {
      const node = new Node('TestNode');
      tree.registerFTINode(node, { test: true });
      if (!tree.isFTINodeRegistered(node)) {
        test.passed = false;
        test.message = 'Node registration failed';
      }
      tree.unregisterFTINode(node);
      if (tree.isFTINodeRegistered(node)) {
        test.passed = false;
        test.message = 'Node unregistration failed';
      }
    } catch (error) {
      test.passed = false;
      test.message = error.message;
    }
    return test;
  }

  /**
   * Test update request
   * @private
   * @returns {Object}
   */
  static __testUpdateRequest() {
    const tree = new SceneTreeFTI();
    const test = {
      name: 'Update Request Test',
      passed: true,
      message: '',
    };
    
    try {
      const node = new Node('UpdateNode');
      tree.registerFTINode(node);
      tree.requestFTIUpdate(node);
      tree.__processFTIUpdates();
      if (tree._ftiPending.length > 0 && !tree.isFtiActive()) {
        test.passed = false;
        test.message = 'FTI not processing updates';
      }
    } catch (error) {
      test.passed = false;
      test.message = error.message;
    }
    return test;
  }

  /**
   * Test performance
   * @private
   * @returns {Object}
   */
  static __testPerformance() {
    const tree = new SceneTreeFTI();
    const test = {
      name: 'Performance Test',
      passed: true,
      message: '',
    };
    
    try {
      const start = Date.now();
      for (let i = 0; i < 100; i++) {
        const node = new Node(`PerfNode${i}`);
        tree.registerFTINode(node);
        tree.requestFTIUpdate(node);
      }
      tree.__processFTIUpdates();
      const elapsed = Date.now() - start;
      if (elapsed > 1000) {
        test.passed = false;
        test.message = `Performance test took too long: ${elapsed}ms`;
      }
    } catch (error) {
      test.passed = false;
      test.message = error.message;
    }
    return test;
  }

  /**
   * Run all tests with summary
   * @returns {Object}
   */
  static runAllTests() {
    const results = SceneTreeFTITests.runTests();
    const summary = {
      total: results.length,
      passed: results.filter(r => r.passed).length,
      failed: results.filter(r => !r.passed).length,
      results: results,
    };
    return summary;
  }
}

module.exports = SceneTreeFTITests;
