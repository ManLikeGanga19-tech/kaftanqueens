"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mpesaCallback = exports.mpesaStatus = exports.stkPush = void 0;
const https_1 = require("firebase-functions/v2/https");
const params_1 = require("firebase-functions/params");
// ── Secrets (stored in Firebase Secret Manager, never in code) ────────────────
const CONSUMER_KEY = (0, params_1.defineSecret)('DARAJA_CONSUMER_KEY');
const CONSUMER_SECRET = (0, params_1.defineSecret)('DARAJA_CONSUMER_SECRET');
const SHORTCODE = (0, params_1.defineSecret)('DARAJA_SHORTCODE');
const PASSKEY = (0, params_1.defineSecret)('DARAJA_PASSKEY');
const DARAJA_ENV = (0, params_1.defineSecret)('DARAJA_ENV');
// ── Helpers ───────────────────────────────────────────────────────────────────
function getBaseUrl(env) {
    return env === 'production'
        ? 'https://api.safaricom.co.ke'
        : 'https://sandbox.safaricom.co.ke';
}
function formatPhone(raw) {
    const d = raw.replace(/\D/g, '');
    if (d.startsWith('0'))
        return '254' + d.slice(1);
    if (d.startsWith('+254'))
        return d.slice(1);
    return d; // already 254...
}
function getTimestamp() {
    return new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
}
function buildPassword(shortcode, passkey, timestamp) {
    return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
}
async function getAccessToken(consumerKey, consumerSecret, base) {
    const creds = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const res = await fetch(`${base}/oauth/v1/generate?grant_type=client_credentials`, {
        headers: { Authorization: `Basic ${creds}` },
    });
    if (!res.ok)
        throw new Error(`Daraja OAuth failed: ${res.status}`);
    const { access_token } = (await res.json());
    return access_token;
}
// ── Idempotency store (in-memory per function instance) ───────────────────────
// Good enough for sandbox. For high-volume production, move this to Firestore.
const cache = new Map();
// ── stkPush (callable) ────────────────────────────────────────────────────────
// Called from the frontend via httpsCallable(functions, 'stkPush').
// Returns { checkoutRequestId, customerMessage }.
exports.stkPush = (0, https_1.onCall)({ secrets: [CONSUMER_KEY, CONSUMER_SECRET, SHORTCODE, PASSKEY, DARAJA_ENV] }, async (request) => {
    const { phone, amount, orderId } = request.data;
    if (!phone || !amount || !orderId) {
        throw new https_1.HttpsError('invalid-argument', 'phone, amount, and orderId are required');
    }
    // Idempotency: same orderId → return cached result without a second push
    const hit = cache.get(orderId);
    if (hit && hit.expiresAt > Date.now()) {
        return { checkoutRequestId: hit.checkoutRequestId, customerMessage: 'STK push already sent — check your phone.', fromCache: true };
    }
    const env = DARAJA_ENV.value() || 'sandbox';
    const base = getBaseUrl(env);
    const shortcode = SHORTCODE.value();
    const passkey = PASSKEY.value();
    const token = await getAccessToken(CONSUMER_KEY.value(), CONSUMER_SECRET.value(), base);
    const timestamp = getTimestamp();
    const password = buildPassword(shortcode, passkey, timestamp);
    // The callback URL is the mpesaCallback function in the same project
    const callbackUrl = `https://us-central1-kaftanqueens-2495c.cloudfunctions.net/mpesaCallback`;
    const payload = {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.ceil(amount),
        PartyA: formatPhone(phone),
        PartyB: shortcode,
        PhoneNumber: formatPhone(phone),
        CallBackURL: callbackUrl,
        AccountReference: orderId,
        TransactionDesc: 'Kaftan Queens Order',
    };
    const mpesaRes = await fetch(`${base}/mpesa/stkpush/v1/processrequest`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    const data = (await mpesaRes.json());
    if (!mpesaRes.ok || data.ResponseCode !== '0') {
        throw new https_1.HttpsError('internal', data.errorMessage ?? 'STK push failed');
    }
    cache.set(orderId, {
        checkoutRequestId: data.CheckoutRequestID,
        expiresAt: Date.now() + 10 * 60 * 1000,
    });
    return {
        checkoutRequestId: data.CheckoutRequestID,
        customerMessage: data.CustomerMessage,
    };
});
// ── mpesaStatus (callable) ────────────────────────────────────────────────────
// Frontend polls this every 3 s to confirm payment without waiting for callback.
exports.mpesaStatus = (0, https_1.onCall)({ secrets: [CONSUMER_KEY, CONSUMER_SECRET, SHORTCODE, PASSKEY, DARAJA_ENV] }, async (request) => {
    const { checkoutRequestId } = request.data;
    if (!checkoutRequestId) {
        throw new https_1.HttpsError('invalid-argument', 'checkoutRequestId is required');
    }
    const env = DARAJA_ENV.value() || 'sandbox';
    const base = getBaseUrl(env);
    const shortcode = SHORTCODE.value();
    const passkey = PASSKEY.value();
    const token = await getAccessToken(CONSUMER_KEY.value(), CONSUMER_SECRET.value(), base);
    const timestamp = getTimestamp();
    const password = buildPassword(shortcode, passkey, timestamp);
    const mpesaRes = await fetch(`${base}/mpesa/stkpushquery/v1/query`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            BusinessShortCode: shortcode,
            Password: password,
            Timestamp: timestamp,
            CheckoutRequestID: checkoutRequestId,
        }),
    });
    return mpesaRes.json();
});
// ── mpesaCallback (onRequest) ─────────────────────────────────────────────────
// Safaricom POSTs here when the user completes or dismisses the STK prompt.
// Must always respond 200 — Safaricom retries on any other status.
exports.mpesaCallback = (0, https_1.onRequest)(async (req, res) => {
    try {
        const stkCallback = req.body?.Body?.stkCallback;
        if (stkCallback) {
            const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = stkCallback;
            const meta = {};
            if (ResultCode === 0 && CallbackMetadata?.Item) {
                for (const item of CallbackMetadata.Item)
                    meta[item.Name] = item.Value;
            }
            console.log('[mpesaCallback]', { CheckoutRequestID, ResultCode, ResultDesc, meta });
            // Firestore order status update can be added here for production
        }
    }
    catch (err) {
        console.error('[mpesaCallback parse error]', err);
    }
    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
});
//# sourceMappingURL=index.js.map