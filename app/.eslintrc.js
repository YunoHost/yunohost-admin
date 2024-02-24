module.exports = {
  root: true,
  env: {
    es2021: true,
    node: true
  },
  extends: [
    'plugin:vue/strongly-recommended',
    'eslint:recommended',
    'plugin:prettier/recommended',
  ],
  rules: {
    'no-unused-vars': [
      'warn',
      { varsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_' },
    ],
  },
}
