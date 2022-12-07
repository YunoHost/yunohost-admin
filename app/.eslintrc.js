module.exports = {
  root: true,
  env: {
    es2021: true,
  },
  extends: [
    'plugin:vue/strongly-recommended',
    'eslint:recommended',
  ],
  rules: {
    'vue/multi-word-component-names': 'off',

    'vue/max-attributes-per-line': [
      'error',
      {
        singleline: 3,
        multiline: 3,
      }
    ],
    'vue/no-v-for-template-key': 'off',
    'no-console': 'warn',
    'template-curly-spacing': 'off',
    'camelcase': 'off',
    'indent': 'off',
    'no-irregular-whitespace': 'off',
    'no-multiple-empty-lines': [
      'error',
      {
        max: 2,
      }
    ],
    'no-unused-vars': [
      'warn',
      {
        varsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
      }
    ],
    'quotes': [
      'warn',
      'single'
    ],
  },
}
