module.exports = {
  extends: [
    'plugin:security/recommended',
    'plugin:security-node/recommended',
  ],
  plugins: ['security', 'security-node', 'no-secrets'],
  rules: {
    // Regras de segurança personalizadas
    'security/detect-buffer-noassert': 'error',
    'security/detect-child-process': 'error',
    'security/detect-disable-mustache-escape': 'error',
    'security/detect-eval-with-expression': 'error',
    'security/detect-new-buffer': 'error',
    'security/detect-no-csrf-before-method-override': 'error',
    'security/detect-non-literal-fs-filename': 'error',
    'security/detect-non-literal-regexp': 'error',
    'security/detect-non-literal-require': 'error',
    'security/detect-object-injection': 'error',
    'security/detect-possible-timing-attacks': 'error',
    'security/detect-pseudoRandomBytes': 'error',
    'security/detect-unsafe-regex': 'error',

    // Regras específicas para Node.js
    'security-node/detect-crlf': 'error',
    'security-node/detect-dangerous-path': 'error',
    'security-node/detect-html-injection': 'error',
    'security-node/detect-nosql-injection': 'error',
    'security-node/detect-sql-injection': 'error',
    'security-node/detect-weak-crypto': 'error',

    // Regras para detecção de secrets
    'no-secrets/no-secrets': ['error', {
      ignoreContent: [
        // Padrões a serem ignorados (ex: URLs públicas)
        'http://',
        'https://',
        'ws://',
        'wss://',
      ],
      additionalRegexes: {
        'Custom Pattern': 'pattern_[A-Za-z0-9]{32}', // Exemplo de padrão personalizado
      },
    }],

    // Regras adicionais de boas práticas
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-param-reassign': 'error',
    'no-return-assign': 'error',
    'no-script-url': 'error',
    'no-self-compare': 'error',
    'no-sequences': 'error',
    'no-throw-literal': 'error',
    'no-unused-expressions': 'error',
    'no-useless-concat': 'error',
    'no-void': 'error',
    'no-with': 'error',
    'radix': 'error',
    'yoda': 'error',

    // Regras para prevenção de vazamento de informações
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    'no-alert': 'error',

    // Regras para manipulação segura de dados
    'no-var': 'error',
    'prefer-const': 'error',
    'strict': ['error', 'global'],
  },
  overrides: [
    {
      files: ['**/*.test.js', '**/*.spec.js'],
      rules: {
        'security/detect-non-literal-fs-filename': 'off',
        'security/detect-object-injection': 'off',
        'no-console': 'off',
      },
    },
  ],
  settings: {
    security: {
      // Configurações adicionais do plugin de segurança
    },
  },
}; 