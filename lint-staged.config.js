/**
 * @filename: lint-staged.config.js
 * @type {import('lint-staged').Configuration}
 */
export default {
  '*.{js,ts,jsx,tsx}': [
    'prettier --cache --cache-location .cache/prettier --write',
    'eslint --cache --cache-location .cache/eslint --fix',
  ],
  '*.{json,md,css,scss,yml,yaml}': ['prettier --cache --cache-location .cache/prettier --write'],
};
