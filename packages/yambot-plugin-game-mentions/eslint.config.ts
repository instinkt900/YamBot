import tseslint from 'typescript-eslint';
import eslintBase from '../../eslint.config';

export default tseslint.config(eslintBase, {
    files: ['src/**/*.ts'],
    rules: {
        '@typescript-eslint/no-explicit-any': 'off'
    }
});
