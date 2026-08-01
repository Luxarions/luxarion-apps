/**
 * Rollup configuration for Luxarion Engine.
 * Builds ESM, CJS, and UMD bundles.
 */

import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import analyzer from 'rollup-plugin-analyzer';

const isProduction = process.env.NODE_ENV === 'production';
const buildTarget = process.env.BUILD || 'esm';

/**
 * Generate external dependencies configuration.
 */
const external = [
  // No external dependencies - everything is bundled
];

/**
 * Create a build configuration.
 */
function createConfig(input, output, options = {}) {
  const {
    format = 'esm',
    minify = isProduction,
    analyze = false,
    name = 'Luxarion',
    exports = 'named',
    sourcemap = true
  } = options;

  const plugins = [
    resolve({
      browser: true,
      preferBuiltins: false
    }),
    commonjs(),
  ];

  if (minify) {
    plugins.push(terser({
      compress: {
        drop_console: false,
        passes: 2
      },
      mangle: {
        reserved: ['Luxarion', 'luxarion']
      }
    }));
  }

  if (analyze) {
    plugins.push(analyzer({
      summaryOnly: true
    }));
  }

  return {
    input,
    external,
    output: {
      file: output,
      format,
      name,
      exports,
      sourcemap,
      globals: {},
      ...(format === 'umd' ? { esModule: true } : {})
    },
    plugins,
    treeshake: {
      moduleSideEffects: false,
      propertyReadSideEffects: false,
      tryCatchDeoptimization: false
    },
    onwarn: (warning) => {
      if (warning.code === 'CIRCULAR_DEPENDENCY') return;
      if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return;
      console.warn(warning.message);
    }
  };
}

// Main configurations
const configs = [];

// ESM build
if (buildTarget === 'esm' || buildTarget === 'all') {
  configs.push(createConfig(
    'src/index.js',
    'dist/index.esm.js',
    { format: 'esm', minify: false }
  ));
  configs.push(createConfig(
    'src/index.js',
    'dist/index.esm.min.js',
    { format: 'esm', minify: true }
  ));
}

// CJS build
if (buildTarget === 'cjs' || buildTarget === 'all') {
  configs.push(createConfig(
    'src/index.js',
    'dist/index.cjs.js',
    { format: 'cjs', minify: false }
  ));
  configs.push(createConfig(
    'src/index.js',
    'dist/index.cjs.min.js',
    { format: 'cjs', minify: true }
  ));
}

// UMD build
if (buildTarget === 'umd' || buildTarget === 'all') {
  configs.push(createConfig(
    'src/index.js',
    'dist/index.umd.js',
    { format: 'umd', name: 'Luxarion', minify: false }
  ));
  configs.push(createConfig(
    'src/index.js',
    'dist/index.umd.min.js',
    { format: 'umd', name: 'Luxarion', minify: true }
  ));
}

// Security module separate builds
if (buildTarget === 'esm' || buildTarget === 'all') {
  configs.push(createConfig(
    'src/utils/SecurityCybork.js',
    'dist/utils/SecurityCybork.esm.js',
    { format: 'esm', minify: false }
  ));
}

// Core module separate builds
if (buildTarget === 'esm' || buildTarget === 'all') {
  configs.push(createConfig(
    'src/core/Luxarion.js',
    'dist/core/Luxarion.esm.js',
    { format: 'esm', minify: false }
  ));
}

export default configs;
