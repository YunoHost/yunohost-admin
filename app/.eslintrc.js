module.exports = {
  root: true,
  env: {
    es2021: true,
    node: true
  },
  extends: [
    'plugin:vue/strongly-recommended',
    'eslint:recommended',
    'standard'
  ],
  rules: {
    'vue/max-attributes-per-line': [
      'error',
      {
        singleline: 3,
        multiline: 3
      }
    ],
    'vue/multi-word-component-names': 'off', // FIXME this should be adressed at some point
    'no-console': 'warn',
    'template-curly-spacing': 'off',
    camelcase: 'warn',
    indent: 'off',
    'no-irregular-whitespace': 'off',
    'no-unused-vars': [
      'warn',
      { varsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_' }
    ],
    quotes: 'warn',
    'no-multiple-empty-lines': [
      'error',
      {
        max: 2
      }
    ]
  }
}
