/**
 * Nelja Tech — URQR Platform (Phase 1 Standalone Manager POS)
 * SVGO v3+ Configuration for @urqr/ui Custom POS Icon Library
 * Usage: npx svgo -f ./icons --config ./svgo.config.mjs
 */
export default {
  multipass: true,
  js2svg: {
    indent: 0,
    pretty: false,
  },
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          removeViewBox: false,
          cleanupNumericValues: {
            floatPrecision: 2,
          },
          convertPathData: {
            floatPrecision: 2,
          },
          mergePaths: {
            force: true,
            noSpaceAfterFlags: true,
          },
          removeUnknownsAndDefaults: {
            keepRoleAttr: true,
            keepAriaAttrs: true,
          },
        },
      },
    },
    'sortAttrs',
  ],
};
