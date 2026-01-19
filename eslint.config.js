//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'

import reactPlugin from 'eslint-plugin-react'
import simpleImportSort from 'eslint-plugin-simple-import-sort'

export default [
  ...tanstackConfig,
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
      react: reactPlugin,
    },
    rules: {
      'sort-imports': 'off',
      'import/order': 'off',
      'react/jsx-sort-props': [
        'error',
        {
          callbacksLast: true,
          shorthandFirst: false,
          ignoreCase: true,
          noSortAlphabetically: false,
          reservedFirst: true,
        },
      ],
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // 1. Frameworks
            ['^react', '^@tanstack'],
            // 2. Third-Party Libraries
            ['^[a-z]', '^@'],
            // 3. Internal Aliases (General)
            ['^@/'],
            // 4-7. Specific Internal Feature Folders
            ['^@/lib'],
            ['^@/components', '^@/modules'],
            ['^@/utils', '^@/helpers'],
            ['^@/hooks'],
            // 8. Parent Imports (Relative)
            ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
            // 9. Sibling Imports (Relative)
            ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
            // 10. Side Effect Imports
            ['^\\u0000'],
            // 11. Catch-All
            ['^'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
    },
  },
]
