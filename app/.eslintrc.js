module.exports = {
  root: true,
  env: {
    es2021: true,
    node: true,
  },
  extends: [
    'plugin:vue/vue3-strongly-recommended',
    'eslint:recommended',
    'plugin:prettier/recommended',
  ],
  rules: {
    // 'no-unused-vars': [
    //   'warn',
    //   { varsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_' },
    // ],
    // temp vue3 compat3
    'vue/no-v-for-template-key-on-child': 'error',
    'vue/no-v-for-template-key': 'off',
    'vue/attribute-hyphenation': 'off',
    'vue/v-on-event-hyphenation': 'off',
    // temp flemme
    'vue/require-explicit-emits': 'off',
    'vue/require-default-prop': 'off',
    'no-unused-vars': 'off',
  },
}
