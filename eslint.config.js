"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var js_1 = require("@eslint/js");
var typescript_eslint_1 = require("typescript-eslint");
var recommended_1 = require("eslint-plugin-prettier/recommended");
exports.default = typescript_eslint_1.default.config(js_1.default.configs.recommended, typescript_eslint_1.default.configs.recommended, recommended_1.default, {
    rules: {
        '@typescript-eslint/no-unused-vars': [
            'error',
            {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
                caughtErrorsIgnorePattern: '^_'
            }
        ]
    }
});
