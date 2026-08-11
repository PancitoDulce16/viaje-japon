import fs from 'node:fs';
import assert from 'node:assert/strict';

const rules = fs.readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8');
const auth = fs.readFileSync(new URL('../js/core/auth.js', import.meta.url), 'utf8');
const balances = fs.readFileSync(new URL('../js/features/budget/expense-balances.js', import.meta.url), 'utf8');

assert.match(rules, /allow list:[\s\S]{0,220}request\.auth\.uid in resource\.data\.members/);
assert.match(rules, /affectedKeys\(\)[\s\S]{0,120}hasAny\(\['members', 'memberEmails'\]\)/);
assert.match(rules, /resource\.data\.createdBy == request\.auth\.uid \|\| isTripOwner\(tripId\)/);
assert.match(rules, /match \/settlements[\s\S]{0,260}request\.resource\.data\.payerId == request\.auth\.uid/);
assert.match(rules, /request\.resource\.data\.confirmedBy == request\.auth\.uid/);
assert.doesNotMatch(rules.match(/match \/tasks[\s\S]*?match \/packingItems/)?.[0] || '', /payerId/);
assert.match(rules, /request\.resource\.data\.targetUserId == resource\.data\.targetUserId/);
assert.match(auth, /setTimeout\(\(\) => this\.showAuthTimeout\(\), 15000\)/);
assert.match(auth, /No pudimos verificar tu sesión/);
assert.match(balances, /payerId!==auth\.currentUser\?\.uid/);

console.log('security-regressions: ok');
