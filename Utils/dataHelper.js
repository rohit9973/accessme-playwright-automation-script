import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const raw     = require('../test-data/testData.json');

const { email, password } = raw.credentials;
const existingEmail = email;

function uniqueEmail() {
  return `testuser.${Date.now()}@mail.com`;
}

// Positive
const loginPositive = raw.login.positive.map(tc => ({
  ...tc, email, password,
}));

// Negative
const loginNegative = raw.login.negative.map(tc => ({
  ...tc,
  email:    tc.email    ?? email,
  password: tc.password ?? password,
}));

// Signup
const signupPositive = raw.signup.positive.map(tc => ({
  ...tc, email: uniqueEmail(),
}));

const signupNegative = raw.signup.negative.map(tc => ({
  ...tc,
  email: tc.email === 'EXISTING' ? existingEmail
       : tc.email === 'UNIQUE'   ? uniqueEmail()
       : tc.email,
}));

export default {
  credentials: { email, password },
  login:  { positive: loginPositive,  negative: loginNegative },
  signup: { positive: signupPositive, negative: signupNegative },
};