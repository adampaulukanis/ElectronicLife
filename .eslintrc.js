module.exports = {
    extends: ['prettier', 'eslint:recommended', 'plugin:mocha/recommended'],
    rules: {
        'prettier/prettier': 'error',
        quotes: [2, 'single'],
        semi: ['error', 'always'],
    },
    plugins: ['prettier', 'mocha'],
    parserOptions: {
        ecmaVersion: 6,
        ecmaFeatures: {
            arrowFunctions: true,
            classes: true,
            modules: true,
        },
    },
    env: {
        es6: true,
        browser: true,
        node: true,
    },
};
