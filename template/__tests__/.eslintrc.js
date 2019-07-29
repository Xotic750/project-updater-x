module.exports = {
  env: {
    browser: false,
    commonjs: true,
    jest: true,
    node: true,
  },
  rules: {
    'jest/no-hooks': 'off',
    'no-void': 'off',
    'lodash/prefer-noop': 'off',
    'compat/compat': 'off',
    'prefer-rest-params': 'off',
    'no-prototype-builtins': 'off',
    'jest/no-standalone-expect': 'warn',
    complexity: ['warn', 6],
    'max-lines-per-function': ['warn', {max: 15, skipBlankLines: true, skipComments: true}],
    'max-params': ['error', 2],
  },
};
