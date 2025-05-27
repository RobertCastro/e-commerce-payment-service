/* eslint-disable prettier/prettier */
const crypto = require('crypto');

Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => crypto.randomUUID(),
    ...(crypto.webcrypto || crypto),
  },
  writable: true,
  configurable: true,
});
