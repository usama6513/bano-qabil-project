// Truecaller Direct API Login — sends OTP to phone number
// Endpoint: https://account-asia-south1.truecaller.com/v2/sendOnboardingOtp

const phoneNumber = process.argv[2] || '+923306866513';

// Parse phone number
let number = phoneNumber;
if (!number.startsWith('+')) {
  if (number.startsWith('0')) number = '+92' + number.slice(1);
  else number = '+' + number;
}
const clean = number.replace('+', '');

// Country code mapping
const countryMap = [
  { dial: '92', iso: 'PK', len: 10 },
  { dial: '91', iso: 'IN', len: 10 },
  { dial: '1', iso: 'US', len: 10 },
  { dial: '44', iso: 'GB', len: 10 },
  { dial: '971', iso: 'AE', len: 9 },
  { dial: '966', iso: 'SA', len: 9 },
];

let countryCode = 'PK';
let dialingCode = '92';
let significant = clean.slice(2); // default PK

for (const c of countryMap) {
  if (clean.startsWith(c.dial)) {
    countryCode = c.iso;
    dialingCode = c.dial;
    significant = clean.slice(c.dial.length);
    break;
  }
}

function randomStr(len) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < len; i++) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

const body = {
  countryCode,
  dialingCode,
  installationDetails: {
    app: {
      buildVersion: 5,
      majorVersion: 11,
      minorVersion: 7,
      store: 'GOOGLE_PLAY',
    },
    device: {
      deviceId: randomStr(16),
      language: 'en',
      manufacturer: 'Xiaomi',
      model: 'Redmi Note 10',
      osName: 'Android',
      osVersion: '10',
      mobileServices: ['GMS'],
    },
    language: 'en',
  },
  phoneNumber: significant,
  region: 'region-2',
  sequenceNo: 2,
};

console.log(`[Login] Sending OTP to ${number} (${countryCode}, significant: ${significant})...`);

try {
  const response = await fetch('https://account-asia-south1.truecaller.com/v2/sendOnboardingOtp', {
    method: 'POST',
    headers: {
      'content-type': 'application/json; charset=UTF-8',
      'accept-encoding': 'gzip',
      'user-agent': 'Truecaller/11.75.5 (Android;10)',
      'clientsecret': 'lvc22mp3l1sfv6ujg83rd17btt',
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });

  const data = await response.json();
  console.log('[Login] Response status:', response.status);
  console.log('[Login] Response:', JSON.stringify(data, null, 2));

  if (data.status === 2 || data.message === 'Sent') {
    console.log('\n=== OTP SENT SUCCESSFULLY ===');
    console.log(`Run verify with: node scripts/truecaller-verify.mjs "${number}" "${data.requestId}" <OTP>`);
  } else if (data.status === 9) {
    console.log('\n=== ALREADY REGISTERED ===');
    console.log('This number already has an installationId. Try a different number.');
  }
} catch (error) {
  console.error('[Login] Error:', error.message);
}
