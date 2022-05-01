module.exports = {
  parserOptions: {
    ecmaVersion: 13,
    sourceType: 'module'
  },
  extends: ['eslint:recommended', 'prettier'],
  env: {
    es6: true,
    browser: true
  },
  plugins: ['prettier'],
  ignorePatterns: ['node_modules'],
  globals: {
    d3: true
  },
  rules: {
    indent: ['error', 2, { SwitchCase: 1 }],
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single'],
    'prefer-const': ['error'],
    semi: ['error', 'always'],
    'max-len': [
      'warn',
      {
        code: 80
      }
    ],
    'prettier/prettier': 2,
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/restrict-template-expressions': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-unnecessary-type-assertion': 'off',
    'no-self-assign': 'off'
  }
};
