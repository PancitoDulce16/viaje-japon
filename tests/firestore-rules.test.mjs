import fs from 'node:fs';
import assert from 'node:assert/strict';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';

if (!process.env.FIRESTORE_EMULATOR_HOST) {
  console.log('firestore-rules: omitido (requiere Firebase Emulator)');
  process.exit(0);
}

const projectId = 'japitin-rules-test';
const testEnv = await initializeTestEnvironment({
  projectId,
  firestore: { rules: fs.readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8') }
});

const ownerId = 'owner', memberId = 'member', outsiderId = 'outsider', tripId = 'trip-secure';
const owner = testEnv.authenticatedContext(ownerId).firestore();
const member = testEnv.authenticatedContext(memberId).firestore();
const outsider = testEnv.authenticatedContext(outsiderId).firestore();

await testEnv.withSecurityRulesDisabled(async context => {
  const admin = context.firestore();
  await setDoc(doc(admin, `trips/${tripId}`), {
    info: { createdBy: ownerId, name: 'Viaje privado' },
    members: [ownerId, memberId],
    memberEmails: ['owner@example.test', 'member@example.test']
  });
  await setDoc(doc(admin, `trips/${tripId}/expenses/expense-owner`), {
    description: 'Hotel', amountMinor: 10000, originalCurrency: 'CRC',
    convertedAmountMinor: 10000, baseCurrency: 'CRC', exchangeRate: 1,
    exchangeRateScaled: 100000000, exchangeRateFetchedAt: '2026-08-09T00:00:00.000Z',
    category: 'Hospedaje', date: '2026-08-09', createdBy: ownerId
  });
});

try {
  await assertSucceeds(getDoc(doc(member, `trips/${tripId}`)));
  await assertFails(getDoc(doc(outsider, `trips/${tripId}`)));
  await assertSucceeds(getDocs(query(collection(member, 'trips'), where('members', 'array-contains', memberId))));
  await assertFails(getDocs(collection(outsider, 'trips')));

  await assertFails(updateDoc(doc(member, `trips/${tripId}`), { members: [ownerId, memberId, outsiderId] }));
  await assertSucceeds(updateDoc(doc(owner, `trips/${tripId}`), { members: [ownerId, memberId, outsiderId] }));
  await assertSucceeds(updateDoc(doc(owner, `trips/${tripId}`), { members: [ownerId, memberId] }));

  await assertFails(updateDoc(doc(member, `trips/${tripId}/expenses/expense-owner`), { amountMinor: 1, convertedAmountMinor: 1 }));
  await assertSucceeds(updateDoc(doc(owner, `trips/${tripId}/expenses/expense-owner`), { amountMinor: 9000, convertedAmountMinor: 9000 }));

  const invalidSettlement = {
    payerId: ownerId, receiverId: memberId, amountMinor: 1000, baseAmountMinor: 1000,
    currency: 'CRC', status: 'pending', applied: false, createdBy: memberId
  };
  await assertFails(setDoc(doc(member, `trips/${tripId}/settlements/forged`), invalidSettlement));
  const settlementRef = doc(owner, `trips/${tripId}/settlements/valid`);
  await assertSucceeds(setDoc(settlementRef, { ...invalidSettlement, createdBy: ownerId }));
  await assertSucceeds(updateDoc(doc(member, `trips/${tripId}/settlements/valid`), {
    status: 'confirmed', applied: true, confirmedBy: memberId, updatedAt: '2026-08-09T01:00:00.000Z'
  }));
  await assertFails(updateDoc(doc(member, `trips/${tripId}/settlements/valid`), {
    status: 'confirmed', applied: true, confirmedBy: memberId, updatedAt: '2026-08-09T02:00:00.000Z'
  }));
  console.log('firestore-rules: ok');
} finally {
  await testEnv.cleanup();
}

assert.ok(true);
