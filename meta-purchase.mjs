import { createHash } from 'node:crypto';
import { mkdir, open, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const sha256 = value => createHash('sha256').update(value).digest('hex');
const hash = /^[a-f0-9]{64}$/i;

export function purchaseEvent(order, now = Date.now()) {
  if (order.status !== 'paid' || order.marketingConsent !== true) {
    throw new Error('Only confirmed paid orders with recorded marketing consent can be reported.');
  }
  if (typeof order.orderId !== 'string' || !/^[a-z0-9_.-]{1,96}$/i.test(order.orderId)) {
    throw new Error('Use a stable, non-personal merchant order ID.');
  }
  const time = Date.parse(order.paidAt);
  if (!Number.isFinite(time) || time > now || now - time >= 7 * 24 * 60 * 60 * 1000) {
    throw new Error('paidAt must be the actual payment time within the last seven days.');
  }
  if (!Number.isFinite(order.value) || order.value <= 0 || order.currency !== 'MAD') {
    throw new Error('Provide the actual amount paid and currency MAD.');
  }
  const userData = {};
  for (const [field, key] of [['phoneSha256', 'ph'], ['emailSha256', 'em']]) {
    if (order[field] === undefined) continue;
    if (typeof order[field] !== 'string' || !hash.test(order[field])) {
      throw new Error(field + ' must contain a normalized SHA-256 hash, never raw contact information.');
    }
    userData[key] = [order[field].toLowerCase()];
  }
  if (!Object.keys(userData).length) throw new Error('Provide a consented phone or email hash for matching.');

  return {
    event_name: 'Purchase',
    event_id: sha256('chahd-kids:paid-order:' + order.orderId),
    event_time: Math.floor(time / 1000),
    action_source: 'chat',
    user_data: userData,
    custom_data: { value: order.value, currency: order.currency }
  };
}

async function sendPurchase(event) {
  const {
    META_PIXEL_ID: pixelId, META_GRAPH_API_VERSION: version, META_ACCESS_TOKEN: token,
    META_RECEIPT_DIR: directory, META_TEST_EVENT_CODE: testCode
  } = process.env;
  if (!/^\d{5,30}$/.test(pixelId || '') || !/^v\d+\.\d+$/.test(version || '') || !token || !directory) {
    throw new Error('Set META_PIXEL_ID, META_GRAPH_API_VERSION, META_ACCESS_TOKEN, and META_RECEIPT_DIR in the private order-processing environment.');
  }

  // Reserve the order before contacting Meta. Concurrent runs or ambiguous
  // network failures must not result in an automatic second submission.
  const receiptDir = resolve(directory);
  await mkdir(receiptDir, { recursive: true });
  const scope = sha256(pixelId + ':' + (testCode ? 'test:' + testCode : 'production'));
  const file = resolve(receiptDir, scope + '-' + event.event_id + '.jsonl');
  const receipt = await open(file, 'wx').catch(error => {
    if (error.code === 'EEXIST') throw new Error('This order already has a receipt. Check its status before retrying.');
    throw error;
  });
  try {
    await receipt.writeFile(JSON.stringify({ eventId: event.event_id, state: 'pending' }) + '\n');
    await receipt.sync();
    const result = await fetch('https://graph.facebook.com/' + version + '/' + pixelId + '/events', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: [event], ...(testCode ? { test_event_code: testCode } : {}) }),
      signal: AbortSignal.timeout(15000)
    });
    const response = await result.json();
    if (!result.ok || response.events_received !== 1) {
      throw new Error('Meta did not acknowledge the purchase (HTTP ' + result.status + ').');
    }
    await receipt.writeFile(JSON.stringify({ state: 'acknowledged' }) + '\n');
    console.log((testCode ? 'Test ' : '') + 'Purchase acknowledged. Event ID ' + event.event_id);
  } catch {
    throw new Error('The receipt remains pending. Check Meta Events Manager before clearing it or retrying.');
  } finally {
    await receipt.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const [file, flag, ...extra] = process.argv.slice(2);
    if (!file || (flag && flag !== '--send') || extra.length) throw new Error('Usage: npm run meta:purchase -- <private-order.json> [--send]');
    const event = purchaseEvent(JSON.parse(await readFile(file, 'utf8')));
    if (flag === '--send') await sendPurchase(event);
    else console.log('Validated paid order. Event ID ' + event.event_id + '. No request sent.');
  } catch (error) {
    // JSON parse errors may quote source input. Avoid printing those details.
    console.error(error instanceof SyntaxError ? 'Invalid private order JSON.' : error.message);
    process.exitCode = 1;
  }
}

