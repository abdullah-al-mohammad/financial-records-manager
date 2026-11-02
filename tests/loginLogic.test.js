import test from 'node:test';
import assert from 'node:assert/strict';

import { validateLogin } from '../src/components/login/loginLogic.js';

test('username and password are required', () => {
  assert.equal(
    validateLogin({ username: '', password: '', live: false, url: '' }),
    'Username and password are required'
  );
  assert.equal(
    validateLogin({ username: '   ', password: 'secret', live: false, url: '' }),
    'Username and password are required'
  );
  assert.equal(
    validateLogin({ username: 'admin', password: '  ', live: false, url: '' }),
    'Username and password are required'
  );
});

test('live mode requires a script URL', () => {
  assert.equal(
    validateLogin({ username: 'admin', password: 'admin123', live: true, url: '' }),
    'Please provide a Google Apps Script Web App URL for Live Mode'
  );
  assert.equal(
    validateLogin({ username: 'admin', password: 'admin123', live: true, url: '   ' }),
    'Please provide a Google Apps Script Web App URL for Live Mode'
  );
});

test('demo mode does not require a script URL', () => {
  assert.equal(validateLogin({ username: 'admin', password: 'admin123', live: false, url: '' }), '');
});

test('valid live credentials pass validation', () => {
  assert.equal(
    validateLogin({
      username: 'admin',
      password: 'admin123',
      live: true,
      url: 'https://script.google.com/macros/s/demo/exec',
    }),
    ''
  );
});

test('empty input defaults are treated as invalid', () => {
  assert.equal(validateLogin(), 'Username and password are required');
});
