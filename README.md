# Access.Me — Playwright Automation Framework

## Tech Stack
| Tool | Purpose |
|------|---------|
| Playwright 1.43 | Browser automation |
| Winston | Real-time structured logging |
| dotenv | Environment config (no hardcoding) |

---

## Project Structure

```
accessme-automation/
├── pages/
│   ├── BasePage.js       ← Shared helpers (screenshot, logger, click, fill)
│   ├── LoginPage.js      ← Login modal POM
│   └── SignupPage.js     ← Signup modal POM
├── tests/
│   ├── login.spec.js     ← 5 positive + 5 negative login tests
│   └── signup.spec.js    ← 5 positive + 5 negative signup tests
├── test-data/
│   └── testData.json     ← All test data (no hardcoding in specs)
├── utils/
│   ├── logger.js         ← Winston logger (console + file)
│   └── dataHelper.js     ← Resolves {{PLACEHOLDER}} tokens
├── reports/              ← Auto-generated (HTML, JSON, screenshots, logs)
├── .env                  ← Credentials (gitignored)
├── playwright.config.js
└── package.json
```

---

## Quick Start

```bash
# 1. Install dependencies
npm install
npx playwright install chromium firefox

# 2. Configure credentials
cp .env.example .env     # then fill in VALID_EMAIL, VALID_PASSWORD, etc.

# 3. Run all tests
npm test

# 4. Run single suite
npm run test:login
npm run test:signup

# 5. Run headed (watch mode)
HEADED=true npm run test:headed

# 6. Open HTML report
npm run report
```

---

## Test Scenarios

### 🔐 Login
| ID | Type | Description |
|----|------|-------------|
| LP-01 | ✅ Positive | Valid credentials |
| LP-02 | ✅ Positive | Email with uppercase |
| LP-03 | ✅ Positive | Email with whitespace trimmed |
| LP-04 | ✅ Positive | Long password account |
| LP-05 | ✅ Positive | Login then logout |
| LN-01 | ❌ Negative | Wrong password |
| LN-02 | ❌ Negative | Non-existent email |
| LN-03 | ❌ Negative | Empty email |
| LN-04 | ❌ Negative | Empty password |
| LN-05 | ❌ Negative | Malformed email format |

### 📝 Sign-Up
| ID | Type | Description |
|----|------|-------------|
| SP-01 | ✅ Positive | Valid – School plan |
| SP-02 | ✅ Positive | Valid – College plan |
| SP-03 | ✅ Positive | Name with hyphens/apostrophes |
| SP-04 | ✅ Positive | Long valid password |
| SP-05 | ✅ Positive | International name characters |
| SN-01 | ❌ Negative | All fields empty |
| SN-02 | ❌ Negative | Invalid email format |
| SN-03 | ❌ Negative | Weak/short password |
| SN-04 | ❌ Negative | Already registered email |
| SN-05 | ❌ Negative | Missing last name |

---

## Reports

After running tests:
- **HTML Report** → `reports/html/index.html` (run `npm run report`)
- **JSON Results** → `reports/results.json`
- **Screenshots** → `reports/screenshots/` (on failure)
- **Videos** → `reports/test-artifacts/` (on failure)
- **Logs** → `reports/logs/test-run.log` + `errors.log`

---

## Adding New Tests

1. Add data to `test-data/testData.json`
2. Add `{{PLACEHOLDER}}` if env-based, resolve in `dataHelper.js`
3. Write test in `tests/*.spec.js` — import POM + data, no hardcoding



//  "positive": [
//     //   { "id": "LP-01", "description": "Valid credentials" },
//     //   { "id": "LP-02", "description": "Email with uppercase" },
//     //   { "id": "LP-03", "description": "Email with whitespace trimmed" },
//     //   { "id": "LP-04", "description": "Valid long password" },
//     //   { "id": "LP-05", "description": "Login then logout", "action": "logout" }
//     // ],