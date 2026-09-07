// Truecaller Direct API — verify OTP and get installationId
// Usage: node scripts/truecaller-verify.mjs +923306866513 <requestId> <OTP>

const phoneNumber = process.argv[2] || '+923306866513';
const requestId = process.argv[3];
const otp = process.argv[4];

if (!requestId || !otp) {
  console.log('Usage: node scripts/truecaller-verify.mjs <phone> <requestId> <OTP>');
  console.log('Example: node scripts/truecaller-verify.mjs +923306866513 "28d2287f-d1e3-475f-af37-9e57c6b4da13" 123456');
  process.exit(1);
}

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
let significant = clean.slice(2);

for (const c of countryMap) {
  if (clean.startsWith(c.dial)) {
    countryCode = c.iso;
    dialingCode = c.dial;
    significant = clean.slice(c.dial.length);
    break;
  }
}

console.log(`[Verify] Verifying OTP for ${number}...`);
console.log(`[Verify] Request ID: ${requestId}`);
console.log(`[Verify] OTP: ${otp}`);

try {
  const { verifyOtp } = await import('truecallerjs');
  const result = await verifyOtp(phoneNumber, { requestId }, otp);
  
  console.log('\n[Verify] Response:', JSON.stringify(result, null, 2));
  
  if (result.identificationId || result.installationId) {
    const id = result.identificationId || result.installationId;
    console.log('\n=== SUCCESS ===');
    console.log(`Installation ID: ${id}`);
    console.log(`\nAdd this to your .env file:`);
    console.log(`TRUECALLER_DIRECT_ID="${id}"`);
  } else {
    console.log('\n=== VERIFICATION FAILED ===');
    console.log('Check the OTP and try again.');
  }
} catch (error) {
  console.error('[Verify] Error:', error.message);
  if (error.response?.data) {
    console.error('[Verify] Response:', JSON.stringify(error.response.data, null, 2));
  }
}
