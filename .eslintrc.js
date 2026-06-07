module.exports = {
  root: true,
  env: {
    node: true,
    jest: true,
  },
  extends: [
    'plugin:vue/vue3-essential',
    '@vue/airbnb',
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'global-require': 'off',
    'no-new': 0, // Intrusive when using Chart.js instances.
    'no-underscore-dangle': 0, // Chart.js uses underscore dangles (_) internally.
    'import/extensions': 'off',
    'import/no-unresolved': 0, // False positives regarding imports that use aliases.
    'linebreak-style': 0,
    'vue/max-len': 'off',
    'vue/multi-word-component-names': 'off',
  },
  overrides: [
    {
      files: ['*.vue'],
      rules: {
        'max-len': 'off',
      },
    },
  ],
  parserOptions: {
    parser: '@babel/eslint-parser',
    requireConfigFile: false,
  },
};
