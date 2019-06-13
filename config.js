'use strict';
exports.DATABASE_URL = process.env.DATABASE_URL
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://localhost/test';
exports.PORT = process.env.PORT
exports.JWT_SECRET = process.env.JWT_SECRET;
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';
exports.API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080/api';
