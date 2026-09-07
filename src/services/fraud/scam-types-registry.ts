/**
 * Scam Types Registry — Standalone catalog of ALL scam types
 * Similar to how complaint-paths.ts has country authorities,
 * this service catalogs every scam type with its requirements,
 * evidence needed, contacts, and step-by-step guidance.
 *
 * Users can browse this to understand what's needed BEFORE filing a complaint.
 */

import { getComplaintPathForType, type ComplaintPath } from './complaint-paths';

// ─── Scam Type Category ─────────────────────────────────────────────────────
export type ScamCategory =
  | 'Financial Fraud'
  | 'Credential Theft'
  | 'Social Engineering'
  | 'Employment Scam'
  | 'Digital Threat'
  | 'Impersonation'
  | 'Property Fraud'
  | 'Identity Crime'
  | 'Scam';

export interface ScamTypeEntry {
  id: string;
  scamType: string;
  scamTypeUrdu: string;
  scamTypeRomanUrdu?: string;
  category: ScamCategory;
  severity: 'critical' | 'high' | 'medium';
  description: string;
  descriptionUrdu: string;
  descriptionRomanUrdu: string;
  commonExamples: { en: string; ur: string; ro: string }[];
  warningSigns: { en: string; ur: string; ro: string }[];
  complaintPath: ComplaintPath;
}

// ─── All 28 Scam Types ──────────────────────────────────────────────────────
export const SCAM_TYPES_REGISTRY: ScamTypeEntry[] = [
  {
    id: 'bank_wallet_phishing',
    scamType: 'Bank/Wallet Phishing',
    scamTypeUrdu: 'بینک / ویلیٹ فشنگ',
    scamTypeRomanUrdu: 'Bank/Wallet Phishing (OTP, PIN, Password Chori)',
    category: 'Credential Theft',
    severity: 'critical',
    description: 'Fake messages impersonating banks or mobile wallets (HBL, UBL, Meezan, JazzCash, EasyPaisa) asking users to "verify" accounts. Links lead to fake login pages that steal credentials.',
    descriptionUrdu: 'بینکوں یا موبائل والٹس کی نقالت کرنے والے جھوٹے پیغامات جو صارفین سے اکاؤنٹ "تصدیق" کرنے کو کہتے ہیں۔',
    descriptionRomanUrdu: 'Bankon ya mobile wallets ki naqali karne walay jaali messages jo users se account "verify" karne ko kehte hain.',
    commonExamples: [
      { en: 'HBL: Your account will be blocked. Verify now: hbl-verify.link', ur: 'HBL: آپ کا اکاؤنٹ بلاک ہو جائے گا۔ ابھی تصدیق کریں: hbl-verify.link', ro: 'HBL: Aap ka account block ho jaye ga. Abhi tasdeeq karein: hbl-verify.link' },
      { en: 'JazzCash: Rs 15,000 credited. Confirm receipt: jazzcash-confirm.xyz', ur: 'جاز کیش: 15,000 روپے جمع ہوئے۔ وصولی کی تصدیق کریں', ro: 'JazzCash: Rs 15,000 jama huay. Wasooli ki tasdeeq karein' },
    ],
    warningSigns: [
      { en: 'Message asks for OTP, PIN, CVV or password', ur: 'پیغام OTP، PIN، CVV یا پاس ورڈ مانگتا ہے', ro: 'Message OTP, PIN, CVV ya password mangta hai' },
      { en: 'Urgent threat about account being blocked', ur: 'اکاؤنٹ بلاک ہونے کی فوری دھمکی', ro: 'Account block hone ki fori dhamki' },
      { en: 'Suspicious link that looks like bank URL', ur: 'بینک URL جیسا مشتبہ لنک', ro: 'Bank URL jaisa mashkook link' },
    ],
    complaintPath: getComplaintPathForType('Bank/Wallet Phishing')!,
  },
  {
    id: 'investment_scam',
    scamType: 'Investment Scam',
    scamTypeUrdu: 'سرمایہ کاری اسکیم',
    scamTypeRomanUrdu: 'Investment Scam (Guaranteed Return, Double Money)',
    category: 'Financial Fraud',
    severity: 'critical',
    description: 'Fake investment platforms promising guaranteed high returns. Victims deposit money, platform disappears within weeks.',
    descriptionUrdu: 'جھوٹے سرمایہ کاری پلیٹ فارم جو یقینی اعلیٰ منافع کا وعدہ کرتے ہیں۔',
    descriptionRomanUrdu: 'Jaali investment platforms jo yaqini aala munafa ka wada karte hain.',
    commonExamples: [
      { en: 'Earn $5000 daily with AI trading bot', ur: 'AI ٹریڈنگ بوٹ سے روزانہ $5000 کمائیں', ro: 'AI trading bot se rozana $5000 kamayein' },
      { en: 'Double your investment in 30 days guaranteed', ur: '30 دنوں میں آپ کی رقم دگنی — گارنٹی', ro: '30 dinon mein aap ki raqam dugni — guarantee' },
    ],
    warningSigns: [
      { en: 'Guaranteed returns with no risk', ur: 'بغیر خطرے کے یقینی منافع', ro: 'Baghair khatray ke yaqini munafa' },
      { en: 'Pressure to invest quickly', ur: 'جلدی سرمایہ کاری کا دباؤ', ro: 'Jaldi sarmayakari ka dabao' },
    ],
    complaintPath: getComplaintPathForType('Investment Scam')!,
  },
  {
    id: 'job_scam',
    scamType: 'Job Scam',
    scamTypeUrdu: 'جھوٹی نوکری اسکیم',
    scamTypeRomanUrdu: 'Job Scam (Fake Job Offer, Registration Fee)',
    category: 'Employment Scam',
    severity: 'high',
    description: 'Fake job offers requiring upfront payment for "training material" or "registration fee". Victims pay, scammers disappear.',
    descriptionUrdu: 'جھوٹی نوکری کی پیشکش جس میں "ٹریننگ مٹیریل" یا "رجسٹریشن فیس" کی ادائیگی درکار ہے۔',
    descriptionRomanUrdu: 'Jaali naukri ki peshkesh jis mein "training material" ya "registration fee" ki adaiyg darkar hai.',
    commonExamples: [
      { en: 'Data entry job — earn Rs 30,000/month from home', ur: 'ڈیٹا انٹری جاب — گھر سے ماہانہ 30,000 کمائیں', ro: 'Data entry job — ghar se mahana 30,000 kamayein' },
      { en: 'Pay Rs 500 registration fee for government job', ur: 'سرکاری نوکری کے لیے 500 روپے رجسٹریشن فیس دیں', ro: 'Sarkari naukri ke liye 500 rupay registration fee dein' },
    ],
    warningSigns: [
      { en: 'Employer asks for upfront payment', ur: 'آجر upfront ادائیگی مانگتا ہے', ro: 'Aajir upfront adaiyg mangta hai' },
      { en: 'No interview or proper hiring process', ur: 'کوئی انٹرویو یا مناسب بھرتی کا عمل نہیں', ro: 'Koi interview ya munasib bharti ka amal nahi' },
    ],
    complaintPath: getComplaintPathForType('Job Scam')!,
  },
  {
    id: 'prize_lottery_scam',
    scamType: 'Prize/Lottery Scam',
    scamTypeUrdu: 'انعام / لاتری اسکیم',
    scamTypeRomanUrdu: 'Prize/Lottery Scam (Congratulations You Won!)',
    category: 'Scam',
    severity: 'high',
    description: 'Messages claiming you won a prize or lottery. Victims must pay "processing fee" to collect. The prize never exists.',
    descriptionUrdu: 'پیغامات جو دعویٰ کرتے ہیں کہ آپ نے انعام جیتی ہے۔ "پروسیسنگ فیس" ادا کرنی ہوتی ہے۔ انعام کبھی موجود نہیں ہوتا۔',
    descriptionRomanUrdu: 'Messages jo dawa karte hain ke aap ne inaam jeeti hai. "Processing fee" ada karni hoti hai. Inaam kabhi maujood nahi hota.',
    commonExamples: [
      { en: 'Congratulations! You won Rs 500,000 in Samsung giveaway', ur: 'مبارک ہو! آپ نے Samsung giveaway میں 5 لاکھ روپے جیتے', ro: 'Mubarak ho! Aap ne Samsung giveaway mein 5 lakh rupay jeete' },
    ],
    warningSigns: [
      { en: 'You cannot win a lottery you never entered', ur: 'آپ وہ لاتری نہیں جیت سکتے جس میں حصہ نہیں لیا', ro: 'Aap woh lottery nahi jeet sakte jis mein hissa nahi liya' },
      { en: 'Prize requires upfront payment', ur: 'انعام کے لیے پہلے فیس ادا کرنی ہے', ro: 'Inaam ke liye pehlay fees ada karni hai' },
    ],
    complaintPath: getComplaintPathForType('Prize/Lottery Scam')!,
  },
  {
    id: 'gambling_scam',
    scamType: 'Gambling Scam',
    scamTypeUrdu: 'جوئے اسکیم',
    scamTypeRomanUrdu: 'Gambling Scam (Spin & Win, Betting, Casino)',
    category: 'Scam',
    severity: 'critical',
    description: 'Fake online casinos or betting platforms. Initial small wins build trust, then victims lose large amounts. Withdrawal blocked.',
    descriptionUrdu: 'جھوٹے آن لائن کیسنو یا بیٹنگ پلیٹ فارم۔ واپسی کی درخواستیں روک دی جاتی ہیں۔',
    descriptionRomanUrdu: 'Jaali online casino ya betting platforms. Wapsi ki darkhwastein rok di jati hain.',
    commonExamples: [
      { en: 'Sign up now & get free bonus — spin & win cash', ur: 'ابھی سائن اپ کریں اور مفت بونس — گھمائیں اور جیتیں', ro: 'Abhi sign up karein aur free bonus — ghurayein aur jeetein' },
    ],
    warningSigns: [
      { en: 'Online gambling is illegal in Pakistan', ur: 'پاکستان میں آن لائن جوئے غیر قانونی ہے', ro: 'Pakistan mein online juwa ghair qanooni hai' },
      { en: 'Cannot withdraw "winnings"', ur: '"جیت" واپس نہیں لے سکتے', ro: '"Jeet" wapis nahi le sakte' },
    ],
    complaintPath: getComplaintPathForType('Gambling Scam')!,
  },
  {
    id: 'sms_text_scam',
    scamType: 'SMS/Text Scam',
    scamTypeUrdu: 'ایس ایم ایس اسکیم',
    scamTypeRomanUrdu: 'SMS/Text Scam (Suspicious Links, Urgency)',
    category: 'Scam',
    severity: 'high',
    description: 'Unsolicited SMS with links claiming prize wins, package delivery, bank alerts. Links lead to malware or credential theft.',
    descriptionUrdu: 'غیر مطلوبہ ایس ایم ایس جس میں انعام، پیکج ڈلیوری، بینک الرٹ کے لنکس ہوتے ہیں۔',
    descriptionRomanUrdu: 'Ghair matlooba SMS jis mein inaam, package delivery, bank alert ke links hotay hain.',
    commonExamples: [
      { en: 'Your HBL account suspended. Verify: hbl-check.com', ur: 'آپ کا HBL اکاؤنٹ معطل۔ تصدیق کریں: hbl-check.com', ro: 'Aap ka HBL account muatal. Tasdeeq karein: hbl-check.com' },
    ],
    warningSigns: [
      { en: 'Unexpected SMS with suspicious links', ur: 'غیر متوقع ایس ایم ایس مشتبہ لنکس کے ساتھ', ro: 'Ghair mutawaqqa SMS mashkook links ke saath' },
      { en: 'Urgency to click link immediately', ur: 'فوری لنک پر کلک کرنے کا دباؤ', ro: 'Fori link par click karne ka dabao' },
    ],
    complaintPath: getComplaintPathForType('SMS/Text Scam')!,
  },
  {
    id: 'romance_scam',
    scamType: 'Romance Scam',
    scamTypeUrdu: 'محبت / دوستی اسکیم',
    scamTypeRomanUrdu: 'Romance Scam (Online Relationship Fraud)',
    category: 'Social Engineering',
    severity: 'high',
    description: 'Scammers create fake profiles on dating apps/social media. After building emotional connection, they request money.',
    descriptionUrdu: 'دھوکہ باز ڈیٹنگ ایپس/سوشل میڈیا پر جھوٹی پروفائلز بناتے ہیں۔ جذباتی تعلق کے بعد پیسے مانگتے ہیں۔',
    descriptionRomanUrdu: 'Dhokay baz dating apps/social media par jaali profiles banate hain. Jazbati talluq ke baad paise mangte hain.',
    commonExamples: [
      { en: 'I need $500 for emergency surgery — can you help?', ur: 'مجھے ایمرجنسی سرجری کے لیے $500 چاہئیں — کیا آپ مدد کریں گے؟', ro: 'Mujhe emergency surgery ke liye $500 chahiye — kya aap madad karen ge?' },
    ],
    warningSigns: [
      { en: 'Never met in person but asking for money', ur: 'کبھی ذاتی طور پر نہیں ملے لیکن پیسے مانگ رہے ہیں', ro: 'Kabhi zaati tor par nahi mile lekin paise mang rahe hain' },
      { en: 'Stories escalate quickly', ur: 'کہانیاں تیزی سے بڑھتی ہیں', ro: 'Kahaniyan tezi barhti hain' },
    ],
    complaintPath: getComplaintPathForType('Romance Scam')!,
  },
  {
    id: 'crypto_scam',
    scamType: 'Crypto Scam',
    scamTypeUrdu: 'کرپٹو اسکیم',
    scamTypeRomanUrdu: 'Crypto Scam (Fake Exchange, Wallet Drain)',
    category: 'Financial Fraud',
    severity: 'critical',
    description: 'Fake crypto exchanges, pump-and-dump schemes, or wallet draining links. Funds lost permanently.',
    descriptionUrdu: 'جھوٹے کرپٹو ایکسچینجز، پمپ اینڈ ڈمپ اسکیمز، یا ویلیٹ ڈرننگ لنکس۔',
    descriptionRomanUrdu: 'Jaali crypto exchanges, pump-and-dump schemes, ya wallet draining links.',
    commonExamples: [
      { en: 'Send 0.1 BTC, receive 1 BTC back', ur: '0.1 BTC بھیجیں، 1 BTC واپس پائیں', ro: '0.1 BTC bhejein, 1 BTC wapis payein' },
    ],
    warningSigns: [
      { en: 'Guaranteed crypto returns', ur: 'یقینی کرپٹو منافع', ro: 'Yaqini crypto munafa' },
      { en: 'Asking for wallet seed phrase', ur: 'والیٹ سیڈ فریز مانگنا', ro: 'Wallet seed phrase mangna' },
    ],
    complaintPath: getComplaintPathForType('Crypto Scam')!,
  },
  {
    id: 'social_media_scam',
    scamType: 'Social Media Scam',
    scamTypeUrdu: 'سوشل میڈیا اسکیم',
    scamTypeRomanUrdu: 'Social Media Scam (Fake Profiles, Impersonation)',
    category: 'Impersonation',
    severity: 'medium',
    description: 'Fake profiles impersonating celebrities or companies. Run fake giveaways or sell non-existent products.',
    descriptionUrdu: 'مشہور اشخاص یا کمپنیوں کی نقالت کرنے والی جھوٹی پروفائلز۔',
    descriptionRomanUrdu: 'Mashhoor ashkhas ya companies ki naqali karne wali jaali profiles.',
    commonExamples: [
      { en: 'Official HBL giveaway — like and share to win Rs 100,000', ur: 'سرکاری HBL گیو اے — جیتنے کے لیے لائک اور شیئر کریں', ro: 'Sarkari HBL giveaway — jeetne ke liye like aur share karein' },
    ],
    warningSigns: [
      { en: 'No blue verification tick', ur: 'نیلا تصدیقی ٹک نہیں', ro: 'Neela tasdeeqi tick nahi' },
      { en: 'Recently created page', ur: 'حالیہ میں بنایا گیا صفحہ', ro: 'Halima mein banaya gaya safha' },
    ],
    complaintPath: getComplaintPathForType('Social Media Scam')!,
  },
  {
    id: 'generic_scam',
    scamType: 'Generic Scam',
    scamTypeUrdu: 'عام اسکیم',
    scamTypeRomanUrdu: 'Generic Scam (Other/Unknown Scam Types)',
    category: 'Scam',
    severity: 'medium',
    description: 'Catch-all for scam patterns that do not fit specific categories. Still dangerous — report to NCCIA.',
    descriptionUrdu: 'ایسی اسکیمیں جو مخصوص زمرے میں نہیں آتیں۔ پھر بھی خطرناک — این سی سی آئی اے کو رپورٹ کریں۔',
    descriptionRomanUrdu: 'Aisi schemes jo makhsoos zummeray mein nahi aatin. Phir bhi khatarnaak — NCCIA ko report karein.',
    commonExamples: [],
    warningSigns: [
      { en: 'Something feels wrong or too good to be true', ur: 'کچھ غلط لگتا ہے یا بہت اچھا ہے', ro: 'Kuch ghalat lagta hai ya bohat acha hai' },
    ],
    complaintPath: getComplaintPathForType('Generic Scam')!,
  },
  {
    id: 'account_hacking',
    scamType: 'Account Hacking',
    scamTypeUrdu: 'اکاؤنٹ ہیکنگ',
    scamTypeRomanUrdu: 'Account Hacking (WhatsApp, Facebook, Email Hack)',
    category: 'Digital Threat',
    severity: 'critical',
    description: 'Account takeover via verification code theft, phishing links, or social engineering. WhatsApp, Facebook, Instagram, Email.',
    descriptionUrdu: 'تصدیقی کوڈ چوری، فشنگ لنکس یا سوشل انجینئرنگ کے ذریعے اکاؤنٹ ہتھیانا۔',
    descriptionRomanUrdu: 'Tasdeeqi code chori, phishing links ya social engineering ke zariye account hathiyana.',
    commonExamples: [
      { en: 'Send me the WhatsApp code — I sent it by mistake', ur: 'مجھے واٹس ایپ کوڈ بھیجو — غلطی سے بھیج دیا', ro: 'Mujhe WhatsApp code bhejo — ghalati se bhej diya' },
    ],
    warningSigns: [
      { en: 'Someone asks for verification code', ur: 'کوئی تصدیقی کوڈ مانگتا ہے', ro: 'Koi tasdeeqi code mangta hai' },
      { en: 'Account suddenly locked out', ur: 'اکاؤنٹ اچانک لاک ہو جائے', ro: 'Account achanak lock ho jaye' },
    ],
    complaintPath: getComplaintPathForType('Account Hacking')!,
  },
  {
    id: 'identity_theft',
    scamType: 'Identity Theft',
    scamTypeUrdu: 'شناختی چوری',
    scamTypeRomanUrdu: 'Identity Theft (CNIC, Tasveer Ka Ghalat Istemal)',
    category: 'Identity Crime',
    severity: 'high',
    description: 'Someone uses your CNIC, photos or personal info to open fake accounts, get SIMs, or commit fraud.',
    descriptionUrdu: 'کوئی آپ کا شناختی کارڈ، تصاویر یا ذاتی معلومات استعمال کر کے جعلی اکاؤنٹس کھولتا ہے۔',
    descriptionRomanUrdu: 'Koi aap ka CNIC, tasveerein ya zaati maloomat istemal kar ke jaali accounts kholta hai.',
    commonExamples: [
      { en: 'Send your CNIC photo for verification', ur: 'تصدیق کے لیے اپنا شناختی کارڈ بھیجیں', ro: 'Tasdeeq ke liye apna CNIC photo bhejein' },
    ],
    warningSigns: [
      { en: 'Unknown person asks for CNIC copy', ur: 'نامعلوم شخص CNIC کاپی مانگتا ہے', ro: 'Na-maloom shakhs CNIC copy mangta hai' },
      { en: 'SIMs issued in your name without knowledge', ur: 'آپ کے نام پر بغیر علم کے سمیں نکلیں', ro: 'Aap ke naam par baghair ilm ke SIMs niklein' },
    ],
    complaintPath: getComplaintPathForType('Identity Theft')!,
  },
  {
    id: 'online_shopping_scam',
    scamType: 'Online Shopping Scam',
    scamTypeUrdu: 'آن لائن خریداری اسکیم',
    scamTypeRomanUrdu: 'Online Shopping Scam (Fake Delivery, COD Fraud)',
    category: 'Scam',
    severity: 'high',
    description: 'Fake online stores or sellers. Payment made but product never delivered, or different/defective product sent.',
    descriptionUrdu: 'جعلی آن لائن اسٹورز یا بیچنے والے۔ ادائیگی کی گئی لیکن پروڈکٹ کبھی ڈلیور نہیں ہوئی۔',
    descriptionRomanUrdu: 'Jaali online stores ya sellers. Adaiyg ki gayi lekin product kabhi deliver nahi hui.',
    commonExamples: [
      { en: 'iPhone 15 for Rs 30,000 — pay on delivery', ur: 'آئی فون 15 صرف 30,000 میں — ڈلیوری پر ادائیگی', ro: 'iPhone 15 sirf 30,000 mein — delivery par adaiyg' },
    ],
    warningSigns: [
      { en: 'Price too low for branded product', ur: 'برانڈڈ پروڈکٹ کے لیے قیمت بہت کم', ro: 'Branded product ke liye qeemat bohat kam' },
      { en: 'No physical store address', ur: 'کوئی جسمانی دکان کا پتہ نہیں', ro: 'Koi jismani dukaan ka pata nahi' },
    ],
    complaintPath: getComplaintPathForType('Online Shopping Scam')!,
  },
  {
    id: 'online_harassment',
    scamType: 'Online Harassment',
    scamTypeUrdu: 'آن لائن ہراسانی',
    scamTypeRomanUrdu: 'Online Harassment / Cyberbullying',
    category: 'Digital Threat',
    severity: 'critical',
    description: 'Cyberbullying, online threats, stalking, abusive messages. Includes physical threats and persistent harassment.',
    descriptionUrdu: 'سائبر بلنگ، آن لائن دھمکیاں، اسٹالکنگ، گالی galoch پیغامات۔',
    descriptionRomanUrdu: 'Cyberbullying, online dhamkiyan, stalking, gaali galoch messages.',
    commonExamples: [
      { en: 'I know where you live — you will pay for this', ur: 'میں جانتا ہوں آپ کہاں رہتے ہیں — اس کی قیمت چکائیں گے', ro: 'Main janta hoon aap kahan rehte hain — is ki qimat chukayein ge' },
    ],
    warningSigns: [
      { en: 'Repeated abusive messages from same person', ur: 'ایک ہی شخص سے بار بار گالی galoch پیغامات', ro: 'Ek hi shakhs se baar baar gaali galoch messages' },
      { en: 'Threats of physical harm', ur: 'جسمانی نقصان کی دھمکیاں', ro: 'Jismani nuqsan ki dhamkiyan' },
    ],
    complaintPath: getComplaintPathForType('Online Harassment')!,
  },
  {
    id: 'sextortion',
    scamType: 'Sextortion',
    scamTypeUrdu: 'سیکس ٹورشن / بلیک میل',
    scamTypeRomanUrdu: 'Sextortion / Blackmail (Intimate Photos ki Dhamki)',
    category: 'Digital Threat',
    severity: 'critical',
    description: 'Blackmail using intimate photos or videos. Demands money or more content. Paying never stops the blackmail.',
    descriptionUrdu: 'ذاتی تصاویر یا ویڈیوز کی دھمکی سے بلیک میل۔ رقم یا مزید مواد مانگتا ہے۔',
    descriptionRomanUrdu: 'Zaati tasveeron ya videos ki dhamki se blackmail. Raqam ya mazeed content mangta hai.',
    commonExamples: [
      { en: 'Pay Rs 50,000 or I will share your photos with family', ur: '50,000 دیں ورنہ آپ کی تصاویر خاندان کو بھیج دوں گا', ro: '50,000 dein warna aap ki tasveerein khandan ko bhej doon ga' },
    ],
    warningSigns: [
      { en: 'Threatens to share intimate content', ur: 'ذاتی مواد شیئر کرنے کی دھمکی', ro: 'Zaati content share karne ki dhamki' },
      { en: 'Demands money to keep silent', ur: 'خاموش رہنے کے لیے پیسے مانگتا ہے', ro: 'Khamosh rehne ke liye paise mangta hai' },
    ],
    complaintPath: getComplaintPathForType('Sextortion')!,
  },
  {
    id: 'fake_loan_app',
    scamType: 'Fake Loan App',
    scamTypeUrdu: 'جعلی لون ایپ',
    scamTypeRomanUrdu: 'Fake Loan App (Qarz ki Aar mein Harassment)',
    category: 'Financial Fraud',
    severity: 'critical',
    description: 'Illegal loan apps that access contacts, then harass borrowers and their families with morphed photos and threats.',
    descriptionUrdu: 'غیر قانونی لون ایپس جو رابطوں تک رسائی حاصل کرتی ہیں، پھر قرض لینے والوں اور ان کے خاندانوں کو ہراساں کرتی ہیں۔',
    descriptionRomanUrdu: 'Ghair qanooni loan apps jo raabton tak rasai hasil karti hain, phir qarz lene walon aur un ke khandanon ko harass karti hain.',
    commonExamples: [
      { en: 'Instant loan — Rs 500,000 in 5 minutes, no documents', ur: 'فوری لون — 5 منٹ میں 5 لاکھ روپے، کوئی دستاویز نہیں', ro: 'Fori loan — 5 minute mein 5 lakh rupay, koi document nahi' },
    ],
    warningSigns: [
      { en: 'App asks for contacts, camera, storage permissions', ur: 'ایپ رابطے، کیمرا، اسٹوریج کی اجازت مانگتی ہے', ro: 'App raabtay, camera, storage ki ijazat mangti hai' },
      { en: 'Harassment by recovery agents', ur: 'ریکوری ایجنٹس کی طرف سے ہراسانی', ro: 'Recovery agents ki taraf se harassment' },
    ],
    complaintPath: getComplaintPathForType('Fake Loan App')!,
  },
  {
    id: 'tech_support_scam',
    scamType: 'Tech Support Scam',
    scamTypeUrdu: 'ٹیک سپورٹ اسکیم',
    scamTypeRomanUrdu: 'Tech Support Scam (AnyDesk/TeamViewer Fraud)',
    category: 'Impersonation',
    severity: 'critical',
    description: 'Fake calls claiming to be from Microsoft/Google/Apple asking to install remote access software. Scammers drain bank accounts.',
    descriptionUrdu: 'مائیکروسافٹ/گوگل/ایپل ہونے کا دعویٰ کرنے والی جعلی کالز جو ریموٹ ایکسیس سافٹ ویئر انسٹال کرنے کو کہتی ہیں۔',
    descriptionRomanUrdu: 'Microsoft/Google/Apple hone ka dawa karne wali jaali calls jo remote access software install karne ko kehti hain.',
    commonExamples: [
      { en: 'Your computer has a virus — install AnyDesk so we can fix it', ur: 'آپ کے کمپیوٹر میں وائرس ہے — AnyDesk انسٹال کریں', ro: 'Aap ke computer mein virus hai — AnyDesk install karein' },
    ],
    warningSigns: [
      { en: 'Microsoft/Google never call users directly', ur: 'مائیکروسافٹ/گوگل کبھی صارفین کو براہ راست کال نہیں کرتے', ro: 'Microsoft/Google kabhi users ko braah-e-raast call nahi karte' },
      { en: 'Asks to install AnyDesk/TeamViewer', ur: 'AnyDesk/TeamViewer انسٹال کرنے کو کہتا ہے', ro: 'AnyDesk/TeamViewer install karne ko kehta hai' },
    ],
    complaintPath: getComplaintPathForType('Tech Support Scam')!,
  },
  {
    id: 'qr_code_fraud',
    scamType: 'QR Code Fraud',
    scamTypeUrdu: 'کیو آر کوڈ فراڈ',
    scamTypeRomanUrdu: 'QR Code Fraud (QR Scan Karke Paisay Nikalna)',
    category: 'Financial Fraud',
    severity: 'high',
    description: 'Victims tricked into scanning QR codes that send money instead of receiving. QR codes are only for SENDING payments.',
    descriptionUrdu: 'متاثرین کو کیو آر کوڈ اسکین کرنے کا دھوکہ دیا جاتا ہے جو رقم بھیجتے ہیں بجائے وصول کرنے کے۔',
    descriptionRomanUrdu: 'Mutasireen ko QR code scan karne ka dhoka diya jata hai jo raqam bhejte hain bajaye wasool karne ke.',
    commonExamples: [
      { en: 'Scan this QR code to receive Rs 5,000 cashback', ur: '5,000 روپے کیش بیک وصول کرنے کے لیے یہ کیو آر کوڈ اسکین کریں', ro: '5,000 rupay cashback wasool karne ke liye yeh QR code scan karein' },
    ],
    warningSigns: [
      { en: 'QR code to RECEIVE money is always fraud', ur: 'رقم وصول کرنے کے لیے کیو آر کوڈ ہمیشہ فراڈ ہے', ro: 'Raqam wasool karne ke liye QR code hamesha fraud hai' },
    ],
    complaintPath: getComplaintPathForType('QR Code Fraud')!,
  },
  {
    id: 'charity_donation_scam',
    scamType: 'Charity/Donation Scam',
    scamTypeUrdu: 'خیرات / عطیہ اسکیم',
    scamTypeRomanUrdu: 'Charity/Donation Scam (Jhooti Madad, Nakli NGO)',
    category: 'Scam',
    severity: 'medium',
    description: 'Fake charities exploiting disasters, Ramadan, or emergencies. Money collected but never reaches victims.',
    descriptionUrdu: 'آفات، رمضان یا ہنگامی صورتحال کا فائدہ اٹھانے والی جعلی خیراتی ادارے۔',
    descriptionRomanUrdu: 'Afaat, Ramadan ya hangami surat-e-haal ka faida uthane wali jaali khairati idaray.',
    commonExamples: [
      { en: 'Donate for flood victims — send Zakat to this account', ur: 'سیلاب متاثرین کے لیے عطیہ دیں — اس اکاؤنٹ میں زکوٰۃ بھیجیں', ro: 'Sailaab mutasireen ke liye atiya dein — is account mein Zakat bhejein' },
    ],
    warningSigns: [
      { en: 'Charity not registered with SECP', ur: 'خیراتی ادارہ ایس ای سی پی میں رجسٹرڈ نہیں', ro: 'Khairati idara SECP mein registered nahi' },
      { en: 'Payment to personal account instead of organization', ur: 'تنظیم کے بجائے ذاتی اکاؤنٹ میں ادائیگی', ro: 'Tanzeem ke bajaye zaati account mein adaiyg' },
    ],
    complaintPath: getComplaintPathForType('Charity/Donation Scam')!,
  },
  {
    id: 'fake_visa_immigration',
    scamType: 'Fake Visa/Immigration Fraud',
    scamTypeUrdu: 'جعلی ویزا / امیگریشن فراڈ',
    scamTypeRomanUrdu: 'Fake Visa / Immigration Fraud (Jhootay Visa Agents)',
    category: 'Property Fraud',
    severity: 'high',
    description: 'Fake visa agents promising guaranteed visas for work/study abroad. Large fees collected, victim gets nothing or fake documents.',
    descriptionUrdu: 'بیرن ملک کام/تعلیم کے لیے یقینی ویزے کا وعدہ کرنے والے جعلی ایجنٹ۔',
    descriptionRomanUrdu: 'Beroon mulk kaam/taleem ke liye yaqini visa ka wada karne walay jaali agents.',
    commonExamples: [
      { en: 'Canada work visa 100% guaranteed — pay Rs 500,000', ur: 'کینیڈا ورک ویزا 100% گارنٹی — 5 لاکھ روپے دیں', ro: 'Canada work visa 100% guarantee — 5 lakh rupay dein' },
    ],
    warningSigns: [
      { en: 'Agent not registered with Bureau of Emigration', ur: 'ایجنٹ بیورو آف امیگریشن میں رجسٹرڈ نہیں', ro: 'Agent Bureau of Emigration mein registered nahi' },
      { en: 'Guaranteed visa with no process', ur: 'بغیر عمل کے یقینی ویزا', ro: 'Baghair amal ke yaqini visa' },
    ],
    complaintPath: getComplaintPathForType('Fake Visa/Immigration Fraud')!,
  },
  {
    id: 'rental_housing_scam',
    scamType: 'Rental/Housing Scam',
    scamTypeUrdu: 'کرایہ / مکانات اسکیم',
    scamTypeRomanUrdu: 'Rental/Housing Scam (Jhootay Ghar Malikan)',
    category: 'Property Fraud',
    severity: 'high',
    description: 'Fake rental listings. Scammers demand advance payment for properties they do not own, then disappear.',
    descriptionUrdu: 'جعلی کرایے کی لسٹنگ۔ فراڈیے ایڈوانس ادائیگی لے کر غائب ہو جاتے ہیں۔',
    descriptionRomanUrdu: 'Jaali kirayay ki listing. Fraudi advance payment le kar ghaib ho jate hain.',
    commonExamples: [
      { en: '2 bed flat — pay Rs 50,000 advance to book', ur: '2 کمرے کا فلیٹ — بک کرنے کے لیے 50,000 ایڈوانس دیں', ro: '2 kamray ka flat — book karne ke liye 50,000 advance dein' },
    ],
    warningSigns: [
      { en: 'Landlord refuses to show property in person', ur: 'مالک ذاتی طور پر جائیداد دکھانے سے انکار کرتا ہے', ro: 'Malik zaati tor par jaidad dikhane se inkaar karta hai' },
      { en: 'Price significantly below market rate', ur: 'قیمت مارکیٹ ریٹ سے نمایاں طور پر کم', ro: 'Qeemat market rate se numaya tor par kam' },
    ],
    complaintPath: getComplaintPathForType('Rental/Housing Scam')!,
  },
  {
    id: 'sim_swap_fraud',
    scamType: 'SIM Swap Fraud',
    scamTypeUrdu: 'سم سوئپ فراڈ',
    scamTypeRomanUrdu: 'SIM Swap Fraud (SIM Badal Kar Account Hack)',
    category: 'Digital Threat',
    severity: 'critical',
    description: 'Attacker gets your SIM swapped to their device, then uses OTPs to drain bank accounts and hack social media.',
    descriptionUrdu: 'حملہ آور آپ کا SIM اپنے ڈیوائس پر تبدیل کرواتا ہے، پھر OTPs استعمال کر کے بینک اکاؤنٹس خالی کرتا ہے۔',
    descriptionRomanUrdu: 'Hamla aawar aap ka SIM apne device par tabdeel karwata hai, phir OTPs istemal kar ke bank accounts khaali karta hai.',
    commonExamples: [
      { en: 'Your SIM suddenly stops working — all calls go to new SIM', ur: 'آپ کا SIM اچانک کام کرنا بند — تمام کالز نئے SIM پر', ro: 'Aap ka SIM achanak kaam karna band — tamam calls nayi SIM par' },
    ],
    warningSigns: [
      { en: 'SIM stops working unexpectedly', ur: 'SIM غیر متوقع طور پر کام کرنا بند ہو جائے', ro: 'SIM ghair mutawaqqe tor par kaam karna band ho jaye' },
      { en: 'No service on phone suddenly', ur: 'اچانک فون پر کوئی سروس نہیں', ro: 'Achanak phone par koi service nahi' },
    ],
    complaintPath: getComplaintPathForType('SIM Swap Fraud')!,
  },
  {
    id: 'freelancing_escrow_scam',
    scamType: 'Freelancing/Escrow Scam',
    scamTypeUrdu: 'فری لانسنگ / ایسکرو اسکیم',
    scamTypeRomanUrdu: 'Freelancing/Escrow Scam (Kaam Karo, Paisay Nahi)',
    category: 'Employment Scam',
    severity: 'high',
    description: 'Fake clients on freelancing platforms who ask for "security deposit" or take work without paying.',
    descriptionUrdu: 'فری لانسنگ پلیٹ فارمز پر جعلی کلائنٹ جو "سیکیورٹی ڈپازٹ" مانگتے ہیں یا کام لے کر پیسے نہیں دیتے۔',
    descriptionRomanUrdu: 'Freelancing platforms par jaali clients jo "security deposit" mangte hain ya kaam le kar paise nahi dete.',
    commonExamples: [
      { en: 'Pay $100 registration fee to start working on project', ur: 'پروجیکٹ پر کام شروع کرنے کے لیے $100 رجسٹریشن فیس دیں', ro: 'Project par kaam shuru karne ke liye $100 registration fee dein' },
    ],
    warningSigns: [
      { en: 'Client asks you to pay to receive payment', ur: 'کلائنٹ ادائیگی وصول کرنے کے لیے پیسے مانگتا ہے', ro: 'Client adaiyg wasool karne ke liye paise mangta hai' },
      { en: 'Wants to move off-platform immediately', ur: 'فوری طور پر پلیٹ فارم سے باہر جانا چاہتا ہے', ro: 'Fori tor par platform se bahar jana chahta hai' },
    ],
    complaintPath: getComplaintPathForType('Freelancing/Escrow Scam')!,
  },
  {
    id: 'ponzi_pyramid_scheme',
    scamType: 'Ponzi/Pyramid Scheme',
    scamTypeUrdu: 'پونزی / پرامڈ اسکیم',
    scamTypeRomanUrdu: 'Ponzi/Pyramid Scheme (QNet, OneCoin, Member Get Member)',
    category: 'Financial Fraud',
    severity: 'critical',
    description: 'Schemes that pay old investors with new investors\' money. Income depends on recruiting others. Collapses suddenly.',
    descriptionUrdu: 'ایسی اسکیمیں جو پرانے سرمایہ کاروں کو نئے سرمایہ کاروں کے پیسے سے ادا کرتی ہیں۔ آمدنی دوسروں کو شامل کرنے پر منحصر ہے۔',
    descriptionRomanUrdu: 'Aisi schemes jo purane sarmayakaron ko naye sarmayakaron ke paise se ada karti hain. Aamdani dusron ko shamil karne par munhasir hai.',
    commonExamples: [
      { en: 'Recruit 10 members and earn Rs 100,000 monthly', ur: '10 ممبرز شامل کریں اور ماہانہ 1 لاکھ کمائیں', ro: '10 members shamil karein aur mahana 1 lakh kamayein' },
    ],
    warningSigns: [
      { en: 'Income depends on recruiting others', ur: 'آمدنی دوسروں کو شامل کرنے پر منحصر ہے', ro: 'Aamdani dusron ko shamil karne par munhasir hai' },
      { en: 'Promises 20%+ monthly returns', ur: 'ماہانہ 20%+ منافع کا وعدہ', ro: 'Mahana 20%+ munafa ka wada' },
    ],
    complaintPath: getComplaintPathForType('Ponzi/Pyramid Scheme')!,
  },
  {
    id: 'fake_educational_institution',
    scamType: 'Fake Educational Institution',
    scamTypeUrdu: 'جعلی تعلیمی ادارہ',
    scamTypeRomanUrdu: 'Fake University / Admission Scam (Nakli University)',
    category: 'Employment Scam',
    severity: 'high',
    description: 'Fake universities or colleges that accept admission fees but are not recognized by HEC. Degrees are worthless.',
    descriptionUrdu: 'جعلی یونیورسٹیاں یا کالج جو داخلہ فیس لیتے ہیں لیکن HEC سے تسلیم شدہ نہیں۔ ڈگریاں بیکار ہیں۔',
    descriptionRomanUrdu: 'Jaali universities ya colleges jo dakhla fees lete hain lekin HEC se tasleem shuda nahi. Degrees bekaar hain.',
    commonExamples: [
      { en: 'Admission open — no entry test needed, degree in 2 years', ur: 'داخلے کھلے ہیں — کوئی انٹری ٹیسٹ نہیں، 2 سال میں ڈگری', ro: 'Dakhlay khulay hain — koi entry test nahi, 2 saal mein degree' },
    ],
    warningSigns: [
      { en: 'Not listed on HEC recognized institutions', ur: 'HEC کی تسلیم شدہ اداروں کی فہرست میں نہیں', ro: 'HEC ki tasleem shuda idaron ki fehrist mein nahi' },
      { en: 'No entrance test or merit process', ur: 'کوئی انٹری ٹیسٹ یا میرٹ کا عمل نہیں', ro: 'Koi entry test ya merit ka amal nahi' },
    ],
    complaintPath: getComplaintPathForType('Fake Educational Institution')!,
  },
  {
    id: 'atm_card_skimming',
    scamType: 'ATM/Card Skimming',
    scamTypeUrdu: 'اے ٹی ایم / کارڈ اسکمنگ',
    scamTypeRomanUrdu: 'ATM/Card Skimming (ATM se Paisay Chori)',
    category: 'Financial Fraud',
    severity: 'critical',
    description: 'Devices attached to ATMs that clone card data. Combined with hidden PIN cameras, scammers withdraw money from cloned cards.',
    descriptionUrdu: 'اے ٹی ایم پر لگائے گئے آلات جو کارڈ ڈیٹا کاپی کرتے ہیں۔ چھپے کیمروں کے ساتھ ملا کر، فراڈیے کلون کارڈز سے رقم نکالتے ہیں۔',
    descriptionRomanUrdu: 'ATM par lagaye gaye aajzat jo card data copy karte hain. Chhupe cameras ke saath mila kar, fraudi cloned cards se raqam nikalte hain.',
    commonExamples: [
      { en: 'Card stuck in ATM — later unauthorized withdrawals found', ur: 'کارڈ اے ٹی ایم میں پھنس گئی — بعد میں غیر مجاز واپسی ملی', ro: 'Card ATM mein phans gayi — baad mein ghair mujaz wapsi mili' },
    ],
    warningSigns: [
      { en: 'ATM card slot looks unusual or loose', ur: 'اے ٹی ایم کارڈ سلاٹ غیر معمولی یا ڈھیلا لگتا ہے', ro: 'ATM card slot ghair mamooli ya dheela lagta hai' },
      { en: 'Unauthorized transactions in bank statement', ur: 'بینک اسٹیٹمنٹ میں غیر مجاز لین دین', ro: 'Bank statement mein ghair mujaz len-den' },
    ],
    complaintPath: getComplaintPathForType('ATM/Card Skimming')!,
  },
  {
    id: 'fake_government_document',
    scamType: 'Fake Government Document',
    scamTypeUrdu: 'جعلی سرکاری دستاویز',
    scamTypeRomanUrdu: 'Fake Document (Nakli Passport, License, Domicile)',
    category: 'Identity Crime',
    severity: 'high',
    description: 'Agents promising fast-track passports, domiciles, or driving licenses without proper process. Documents are fake — using them is a crime.',
    descriptionUrdu: 'ایجنٹ جو بغیر مناسب عمل کے فاسٹ ٹریک پاسپورٹ، ڈومیسائل، یا ڈرائیونگ لائسنس کا وعدہ کرتے ہیں۔',
    descriptionRomanUrdu: 'Agents jo baghair munasib amal ke fast-track passport, domicile, ya driving license ka wada karte hain.',
    commonExamples: [
      { en: 'Get passport in 3 days — no visit needed', ur: '3 دن میں پاسپورٹ — کوئی دورہ نہیں', ro: '3 din mein passport — koi daura nahi' },
    ],
    warningSigns: [
      { en: 'Agent promises documents without official process', ur: 'ایجنٹ سرکاری عمل کے بغیر دستاویزات کا وعدہ کرتا ہے', ro: 'Agent sarkari amal ke baghair documents ka wada karta hai' },
      { en: 'Payment to personal account', ur: 'ذاتی اکاؤنٹ میں ادائیگی', ro: 'Zaati account mein adaiyg' },
    ],
    complaintPath: getComplaintPathForType('Fake Government Document')!,
  },
  {
    id: 'insurance_fraud',
    scamType: 'Insurance Fraud',
    scamTypeUrdu: 'انشورنس فراڈ',
    scamTypeRomanUrdu: 'Insurance Fraud (Jhooti Policy, Fake Agent)',
    category: 'Financial Fraud',
    severity: 'high',
    description: 'Fake insurance agents selling policies that provide no coverage. Premiums paid to personal accounts. Claims rejected.',
    descriptionUrdu: 'جعلی انشورنس ایجنٹ جو ایسی پالسیاں بیچتے ہیں جو کوئی کوریج فراہم نہیں کرتیں۔ پریمیم ذاتی اکاؤنٹس میں ادا کیے جاتے ہیں۔',
    descriptionRomanUrdu: 'Jaali insurance agents jo aisi policies bechte hain jo koi coverage faraham nahi kartin. Premium zaati accounts mein ada kiye jate hain.',
    commonExamples: [
      { en: 'Life insurance with guaranteed 20% return', ur: 'گارنٹی 20% منافع کے ساتھ لائف انشورنس', ro: 'Guarantee 20% munafa ke saath life insurance' },
    ],
    warningSigns: [
      { en: 'Agent not verifiable through insurance company', ur: 'ایجنٹ انشورنس کمپنی کے ذریعے تصدیق نہیں ہو سکتا', ro: 'Agent insurance company ke zariye tasdeeq nahi ho sakta' },
      { en: 'Premium paid to personal bank account', ur: 'پریمیم ذاتی بینک اکاؤنٹ میں ادا کیا گیا', ro: 'Premium zaati bank account mein ada kiya gaya' },
    ],
    complaintPath: getComplaintPathForType('Insurance Fraud')!,
  },
  {
    id: 'utility_bill_scam',
    scamType: 'Utility Bill Scam',
    scamTypeUrdu: '\u0628\u062c\u0644\u06cc / \u06af\u06cc\u0633 / \u067e\u0627\u0646\u06cc \u06a9\u0627 \u0628\u0644 \u0627\u0633\u06a9\u06cc\u0645',
    scamTypeRomanUrdu: 'Utility Bill Scam (WAPDA, Gas ke Naam par Fraud)',
    category: 'Scam',
    severity: 'high',
    description: 'Fake calls/messages claiming to be from WAPDA, SSGC, K-Electric or water boards demanding instant payment or threatening disconnection.',
    descriptionUrdu: '\u0648\u0627\u067e\u0688\u0627\u060c \u0633\u0648\u0626\u06cc \u06af\u06cc\u0633\u060c \u06a9\u06d2 \u0627\u0644\u06cc\u06a9\u0679\u0631\u06a9 \u06cc\u0627 \u0648\u0627\u0679\u0631 \u0628\u0648\u0631\u0688 \u06c1\u0648\u0646\u06d2 \u06a9\u0627 \u062f\u0639\u0648\u06cc\u06cc \u06a9\u0631\u0646\u06d2 \u0648\u0627\u0644\u06cc \u062c\u0639\u0644\u06cc \u06a9\u0627\u0644\u0632 \u062c\u0648 \u0641\u0648\u0631\u06cc \u0627\u062f\u0627\u0626\u06cc\u06af\u06cc \u06cc\u0627 \u0645\u0646\u0642\u0637\u0639 \u06a9\u06cc \u062f\u06be\u0645\u06a9\u06cc \u062f\u06cc\u062a\u06cc \u06c1\u06cc\u06ba\u06d4',
    descriptionRomanUrdu: 'WAPDA, Sui Gas, K-Electric ya water board hone ka dawa karne wali jaali calls jo fori adaiyg ya disconnection ki dhamki deti hain.',
    commonExamples: [
      { en: 'Your electricity meter will be sealed today - pay Rs 15,000 immediately', ur: 'Aap ka bijli ka meter aaj seal ho jaye ga - fori 15,000 rupay dein', ro: 'Aap ka bijli ka meter aaj seal ho jaye ga - fori 15,000 rupay dein' },
    ],
    warningSigns: [
      { en: 'Utility company NEVER calls demanding instant payment', ur: 'Utility company kabhi fori adaiyg ke liye call nahi karti', ro: 'Utility company kabhi fori adaiyg ke liye call nahi karti' },
      { en: 'Asks for payment via EasyPaisa/JazzCash', ur: 'EasyPaisa/JazzCash se adaiyg mangta hai', ro: 'EasyPaisa/JazzCash se adaiyg mangta hai' },
    ],
    complaintPath: getComplaintPathForType('Utility Bill Scam')!,
  },
  {
    id: 'fake_matrimonial_scam',
    scamType: 'Fake Matrimonial Scam',
    scamTypeUrdu: '\u062c\u0639\u0644\u06cc \u0631\u0634\u062a\u06c1 \u0627\u0633\u06a9\u06cc\u0645',
    scamTypeRomanUrdu: 'Fake Matrimonial / Rishta Scam (Shaadi ke Naam par Fraud)',
    category: 'Social Engineering',
    severity: 'high',
    description: 'Fake matrimonial profiles on rishta/shaadi platforms. After building trust, they fabricate emergencies and request money.',
    descriptionUrdu: 'Rishta/shaadi platforms par jaali profiles. Etemad banane ke baad hangami surat-e-haal bana kar raqam mangte hain.',
    descriptionRomanUrdu: 'Rishta/shaadi platforms par jaali profiles. Etemad banane ke baad hangami surat-e-haal bana kar raqam mangte hain.',
    commonExamples: [
      { en: 'Groom needs Rs 200,000 for visa processing before marriage', ur: 'Dulha ko shaadi se pehlay visa processing ke liye 2 lakh rupay chahiye', ro: 'Dulha ko shaadi se pehlay visa processing ke liye 2 lakh rupay chahiye' },
    ],
    warningSigns: [
      { en: 'Asking for money before meeting in person', ur: 'Zaati tor par milne se pehlay raqam mangna', ro: 'Zaati tor par milne se pehlay raqam mangna' },
      { en: 'Emergency stories that require urgent money', ur: 'Hangami kahaniyan jinhein fori paison ki zaroorat hai', ro: 'Hangami kahaniyan jinhein fori paison ki zaroorat hai' },
    ],
    complaintPath: getComplaintPathForType('Fake Matrimonial Scam')!,
  },
  {
    id: 'extortion_call',
    scamType: 'Extortion Call',
    scamTypeUrdu: '\u0628\u06be\u062a\u06c1 \u062e\u0648\u0631\u06cc / \u0641\u0648\u0646 \u0628\u0644\u06cc\u06a9 \u0645\u06cc\u0644',
    scamTypeRomanUrdu: 'Extortion Call / Phone Blackmail (Dhamki dekar Paisa Nikalna)',
    category: 'Digital Threat',
    severity: 'critical',
    description: 'Threatening calls demanding money - fake police cases, family honor threats, or promising to share private information.',
    descriptionUrdu: 'Raqam mangne wali dhamki aamez calls - jaali police muqadmat, khandani izzat ki dhamkiyan.',
    descriptionRomanUrdu: 'Raqam mangne wali dhamki aamez calls - jaali police muqadmat, khandani izzat ki dhamkiyan.',
    commonExamples: [
      { en: 'Pay Rs 100,000 or we will file a fake case against your family', ur: '1 lakh rupay dein warna hum aap ke khandan ke khilaf jaali muqaddam darj karwayein ge', ro: '1 lakh rupay dein warna hum aap ke khandan ke khilaf jaali muqaddam darj karwayein ge' },
    ],
    warningSigns: [
      { en: 'Caller demands money to avoid legal action', ur: 'Caller qanooni karwai se bachne ke liye raqam mangta hai', ro: 'Caller qanooni karwai se bachne ke liye raqam mangta hai' },
      { en: 'Threatens to inform family about false allegations', ur: 'Ghalat ilzamat ke baaray mein khandan ko batane ki dhamki', ro: 'Ghalat ilzamat ke baaray mein khandan ko batane ki dhamki' },
    ],
    complaintPath: getComplaintPathForType('Extortion Call')!,
  },
  {
    id: 'fake_health_medicine_scam',
    scamType: 'Fake Health/Medicine Scam',
    scamTypeUrdu: '\u062c\u0639\u0644\u06cc \u0635\u062d\u062a / \u062f\u0648\u0627 \u0627\u0633\u06a9\u06cc\u0645',
    scamTypeRomanUrdu: 'Fake Health/Medicine Scam (Nakli Dawai, Weight Loss Fraud)',
    category: 'Scam',
    severity: 'medium',
    description: 'Fake weight loss products, herbal remedies, cure diabetes forever scams, and quack doctors selling unregistered medicines online.',
    descriptionUrdu: 'Jaali wazan kam karne ki products, desi adwiyat, diabetes hamesha ke liye khatam schemein.',
    descriptionRomanUrdu: 'Jaali wazan kam karne ki products, desi adwiyat, diabetes hamesha ke liye khatam schemein.',
    commonExamples: [
      { en: 'Lose 20kg in just 7 days - 100% herbal, no side effects', ur: 'Sirf 7 din mein 20 kilo wazan kam karein - 100% desi', ro: 'Sirf 7 din mein 20 kilo wazan kam karein - 100% desi' },
    ],
    warningSigns: [
      { en: 'Guaranteed cure for chronic diseases', ur: 'Purani bimariyon ke liye guarantee ilaaj', ro: 'Purani bimariyon ke liye guarantee ilaaj' },
      { en: 'No DRAP registration number on product', ur: 'Product par DRAP registration number nahi', ro: 'Product par DRAP registration number nahi' },
    ],
    complaintPath: getComplaintPathForType('Fake Health/Medicine Scam')!,
  },
  {
    id: 'work_from_home_task_scam',
    scamType: 'Work From Home Task Scam',
    scamTypeUrdu: '\u06af\u06be\u0631 \u0633\u06d2 \u06a9\u0627\u0645 \u0679\u0627\u0633\u06a9 \u0627\u0633\u06a9\u06cc\u0645',
    scamTypeRomanUrdu: 'Work From Home Task Scam (Video Liking, YouTube Earning Fraud)',
    category: 'Employment Scam',
    severity: 'high',
    description: 'Fake platforms offering money for liking YouTube videos, filling forms, or simple tasks. They show fake earnings but demand upgrade fee to withdraw.',
    descriptionUrdu: 'YouTube videos like karne, forms bharne ke liye paise ki peshkesh karne walay jaali platforms.',
    descriptionRomanUrdu: 'YouTube videos like karne, forms bharne ke liye paise ki peshkesh karne walay jaali platforms.',
    commonExamples: [
      { en: 'Earn Rs 5,000 daily by liking YouTube videos - pay Rs 500 to register', ur: 'YouTube videos like kar ke rozana 5,000 kamayein - register hone ke liye 500 dein', ro: 'YouTube videos like kar ke rozana 5,000 kamayein - register hone ke liye 500 dein' },
    ],
    warningSigns: [
      { en: 'Must pay money to withdraw your earnings', ur: 'Apni kamai wapis lene ke liye paise dene hon', ro: 'Apni kamai wapis lene ke liye paise dene hon' },
      { en: 'Earnings seem too easy for simple tasks', ur: 'Asaan tasks ke liye kamai bohat asaan lagti hai', ro: 'Asaan tasks ke liye kamai bohat asaan lagti hai' },
    ],
    complaintPath: getComplaintPathForType('Work From Home Task Scam')!,
  },
  {
    id: 'fake_courier_delivery_scam',
    scamType: 'Fake Courier/Delivery Scam',
    scamTypeUrdu: '\u062c\u0639\u0644\u06cc \u06a9\u0648\u0631\u06cc\u0626\u0631 / \u0688\u06cc\u0644\u06cc\u0648\u0631\u06cc \u0627\u0633\u06a9\u06cc\u0645',
    scamTypeRomanUrdu: 'Fake Courier/Delivery Scam (Parcel Customs, OLX Delivery Fraud)',
    category: 'Scam',
    severity: 'high',
    description: 'Fake courier messages claiming parcel stuck at customs, demanding duty payment via payment links. OLX sellers sending fake payment links instead of cash on delivery.',
    descriptionUrdu: 'Jaali courier messages jo dawa karte hain ke parcel customs mein phans gaya hai, duty payment links ke zariye mangte hain.',
    descriptionRomanUrdu: 'Jaali courier messages jo dawa karte hain ke parcel customs mein phans gaya hai, duty payment links ke zariye mangte hain.',
    commonExamples: [
      { en: 'Your parcel from Dubai is stuck at Karachi customs - pay Rs 8,500 duty', ur: 'Dubai se aap ka parcel Karachi customs mein phans gaya - 8,500 duty dein', ro: 'Dubai se aap ka parcel Karachi customs mein phans gaya - 8,500 duty dein' },
    ],
    warningSigns: [
      { en: 'Courier company asks for payment via SMS link', ur: 'Courier company SMS link ke zariye payment mangti hai', ro: 'Courier company SMS link ke zariye payment mangti hai' },
      { en: 'OLX seller insists on advance payment', ur: 'OLX seller advance payment par zor deta hai', ro: 'OLX seller advance payment par zor deta hai' },
    ],
    complaintPath: getComplaintPathForType('Fake Courier/Delivery Scam')!,
  },
  {
    id: 'hajj_umrah_travel_scam',
    scamType: 'Hajj/Umrah Travel Scam',
    scamTypeUrdu: '\u062d\u062c / \u0639\u0645\u0631\u06c1 \u0679\u0631\u06cc\u0648\u0644 \u0627\u0633\u06a9\u06cc\u0645',
    scamTypeRomanUrdu: 'Hajj/Umrah Travel Scam (Fake Travel Agencies, Fake Packages)',
    category: 'Property Fraud',
    severity: 'high',
    description: 'Fake travel agencies offering cheap Hajj/Umrah packages. They take advance payments but never book visas or tickets.',
    descriptionUrdu: 'Jaali travel agencies jo saste Hajj/Umrah packages offer karti hain. Advance payments leti hain lekin visa ya tickets kabhi book nahi karwatin.',
    descriptionRomanUrdu: 'Jaali travel agencies jo saste Hajj/Umrah packages offer karti hain. Advance payments leti hain lekin visa ya tickets kabhi book nahi karwatin.',
    commonExamples: [
      { en: 'Umrah package at Rs 150,000 - 50% discount, limited seats', ur: 'Umrah package sirf 150,000 - 50% discount, limited seats', ro: 'Umrah package sirf 150,000 - 50% discount, limited seats' },
    ],
    warningSigns: [
      { en: 'Agency not registered with Ministry of Religious Affairs', ur: 'Agency Ministry of Religious Affairs mein registered nahi', ro: 'Agency Ministry of Religious Affairs mein registered nahi' },
      { en: 'Asks for full payment upfront', ur: 'Poori raqam pehlay mangta hai', ro: 'Poori raqam pehlay mangta hai' },
    ],
    complaintPath: getComplaintPathForType('Hajj/Umrah Travel Scam')!,
  },
  {
    id: 'digital_payment_fraud',
    scamType: 'Digital Payment Fraud',
    scamTypeUrdu: '\u0688\u06cc\u062c\u06cc\u0679\u0644 \u0627\u062f\u0627\u0626\u06cc\u06af\u06cc \u0641\u0631\u0627\u0688',
    scamTypeRomanUrdu: 'Digital Payment Fraud (EasyPaisa, JazzCash, Bank Transfer Scam)',
    category: 'Financial Fraud',
    severity: 'high',
    description: 'Fake payment links, fake payment screenshots, OTP theft, and wrong number transfer scams via EasyPaisa, JazzCash, and bank transfers.',
    descriptionUrdu: 'Jaali payment links, jaali payment screenshots, OTP chori, aur EasyPaisa/JazzCash/bank transfers ke zariye wrong number transfer fraud.',
    descriptionRomanUrdu: 'Jaali payment links, jaali payment screenshots, OTP chori, aur EasyPaisa/JazzCash/bank transfers ke zariye wrong number transfer fraud.',
    commonExamples: [
      { en: 'Send me Rs 5,000 to this EasyPaisa link to receive your prize', ur: 'Apna inaam lene ke liye is EasyPaisa link par 5,000 bhejein', ro: 'Apna inaam lene ke liye is EasyPaisa link par 5,000 bhejein' },
    ],
    warningSigns: [
      { en: 'Asks for OTP to verify your payment', ur: 'Payment verify karne ke liye OTP mangta hai', ro: 'Payment verify karne ke liye OTP mangta hai' },
      { en: 'Payment screenshot received but amount not in your account', ur: 'Payment screenshot mila lekin account mein raqam nahi', ro: 'Payment screenshot mila lekin account mein raqam nahi' },
    ],
    complaintPath: getComplaintPathForType('Digital Payment Fraud')!,
  },
  {
    id: 'fake_solar_panel_scam',
    scamType: 'Fake Solar Panel Scam',
    scamTypeUrdu: '\u062c\u0639\u0644\u06cc \u0633\u0648\u0644\u0631 \u067e\u06cc\u0646\u0644 \u0627\u0633\u06a9\u06cc\u0645',
    scamTypeRomanUrdu: 'Fake Solar Panel Scam (Fake Solar Companies, Substandard Equipment)',
    category: 'Scam',
    severity: 'high',
    description: 'Fake solar panel companies selling substandard or counterfeit equipment. They take advance payments but install non-functional or fake branded panels.',
    descriptionUrdu: 'Jaali solar panel companies jo substandard ya counterfeit saman bechti hain. Advance payments leti hain lekin non-functional ya jaali branded panels lagati hain.',
    descriptionRomanUrdu: 'Jaali solar panel companies jo substandard ya counterfeit saman bechti hain. Advance payments leti hain lekin non-functional ya jaali branded panels lagati hain.',
    commonExamples: [
      { en: 'Solar panels at 50% discount - install now, pay later', ur: 'Solar panels 50% discount par - abhi install karein, baad mein pay karein', ro: 'Solar panels 50% discount par - abhi install karein, baad mein pay karein' },
    ],
    warningSigns: [
      { en: 'Company not registered with AEDB', ur: 'Company AEDB mein registered nahi', ro: 'Company AEDB mein registered nahi' },
      { en: 'Panels have no brand or warranty card', ur: 'Panels par koi brand ya warranty card nahi', ro: 'Panels par koi brand ya warranty card nahi' },
    ],
    complaintPath: getComplaintPathForType('Fake Solar Panel Scam')!,
  },
  {
    id: 'vehicle_sale_scam',
    scamType: 'Vehicle Sale Scam',
    scamTypeUrdu: '\u06af\u0627\u0691\u06cc / \u0633\u0648\u0627\u0631\u06cc \u06a9\u06cc \u0641\u0631\u0648\u062e\u062a \u06a9\u0627 \u0627\u0633\u06a9\u06cc\u0645',
    scamTypeRomanUrdu: 'Vehicle Sale Scam (OLX Car/Bike Listing Fraud, Advance Payment)',
    category: 'Property Fraud',
    severity: 'high',
    description: 'Fake vehicle listings on OLX and other platforms at below-market prices. Scammers demand advance/booking payment but never deliver the vehicle.',
    descriptionUrdu: 'OLX aur doosre platforms par market se kam qeemat par jaali vehicle listings. Scammers advance/booking payment mangte hain lekin gaari kabhi deliver nahi karte.',
    descriptionRomanUrdu: 'OLX aur doosre platforms par market se kam qeemat par jaali vehicle listings. Scammers advance/booking payment mangte hain lekin gaari kabhi deliver nahi karte.',
    commonExamples: [
      { en: 'Toyota Corolla 2022 at Rs 25 lakh - urgent sale, below market price', ur: 'Toyota Corolla 2022 sirf 25 lakh - urgent sale, market se kam qeemat', ro: 'Toyota Corolla 2022 sirf 25 lakh - urgent sale, market se kam qeemat' },
    ],
    warningSigns: [
      { en: 'Price is significantly below market value', ur: 'Qeemat market value se bohat kam hai', ro: 'Qeemat market value se bohat kam hai' },
      { en: 'Seller asks for advance before showing vehicle', ur: 'Seller gaari dikhane se pehlay advance mangta hai', ro: 'Seller gaari dikhane se pehlay advance mangta hai' },
    ],
    complaintPath: getComplaintPathForType('Vehicle Sale Scam')!,
  },
  {
    id: 'event_trending_scam',
    scamType: 'Event/Trending Scam',
    scamTypeUrdu: '\u062a\u0642\u0631\u06cc\u0628 / \u0679\u0631\u06cc\u0646\u0688\u0646\u06af \u0627\u0633\u06a9\u06cc\u0645',
    scamTypeRomanUrdu: 'Event/Trending Scam (PM Laptop, 14 August, Eid Bonus, Relief Package Fraud)',
    category: 'Social Engineering',
    severity: 'high',
    description: 'Scammers exploit trending events like PM Laptop Scheme, 14 August, Eid, relief packages to create fake URLs and messages. They impersonate government announcements to steal personal data or money.',
    descriptionUrdu: 'فراڈیے ٹرینڈنگ واقعات جیسے PM لیپ ٹاپ اسکیم، 14 اگست، عید، ریلیف پیکج کا فائدہ اٹھا کر جعلی URL اور پیغامات بناتے ہیں۔',
    descriptionRomanUrdu: 'Fraudi trending waqiyat jese PM Laptop Scheme, 14 August, Eid, relief package ka faida utha kar jaali URL aur paigham banate hain.',
    commonExamples: [
      { en: 'PM has announced free laptops - register now at pmln-laptop.org', ur: 'PM ne muft laptop ka aelaan kiya - abhi register karein pmln-laptop.org par', ro: 'PM ne muft laptop ka aelaan kiya - abhi register karein pmln-laptop.org par' },
      { en: '14 August special: Government giving Rs 25,000 bonus - click here to claim', ur: '14 August khaas: Hakoomat 25,000 rupay bonus de rahi hai - claim karne ke liye click karein', ro: '14 August khaas: Hakoomat 25,000 rupay bonus de rahi hai - claim karne ke liye click karein' },
      { en: 'Eid Mubarak! Ehsaas Program special gift Rs 15,000 - register on this link', ur: 'Eid Mubarak! Ehsaas Program khaas tohfa 15,000 rupay - is link par register karein', ro: 'Eid Mubarak! Ehsaas Program khaas tohfa 15,000 rupay - is link par register karein' },
    ],
    warningSigns: [
      { en: 'URL is NOT an official .gov.pk domain', ur: 'URL سرکاری .gov.pk ڈومین نہیں ہے', ro: 'URL sarkari .gov.pk domain nahi hai' },
      { en: 'Asks for registration fee or personal details to claim benefit', ur: 'فائدہ حاصل کرنے کے لیے رجسٹریشن فیس یا ذاتی تفصیلات مانگتا ہے', ro: 'Faida hasil karne ke liye registration fee ya zaati tafseelaat mangta hai' },
      { en: 'Creates urgency with limited seats or expiry deadline', ur: 'محدود نشستوں یا ختم ہونے کی آخری تاریخ کی ہنگامی بناتا ہے', ro: 'Mehdood nashton ya khatam hone ki aakhri tareekh ki hangami banata hai' },
    ],
    complaintPath: getComplaintPathForType('Event/Trending Scam')!,
  },
  {
    id: 'ai_voice_deepfake_scam',
    scamType: 'AI Voice/Deepfake Scam',
    scamTypeUrdu: 'AI \u0648\u0627\u0626\u0633 / \u0688\u06cc\u067e \u0641\u06cc\u06a9 \u0627\u0633\u06a9\u06cc\u0645',
    scamTypeRomanUrdu: 'AI Voice/Deepfake Scam (Clone Awaaz se Paise Mangna)',
    category: 'Digital Threat',
    severity: 'critical',
    description: 'Scammers use AI to clone a family member\'s voice from social media and call you demanding urgent money. The voice sounds real but it is fake.',
    descriptionUrdu: 'Fraudi social media se khandan ke rukn ki awaaz AI se clone kar ke call karte hain aur fori paise mangte hain.',
    descriptionRomanUrdu: 'Fraudi social media se khandan ke rukn ki awaaz AI se clone kar ke call karte hain aur fori paise mangte hain.',
    commonExamples: [
      { en: 'Mom calling in tears saying she needs Rs 50,000 urgently for a medical emergency - but she is actually at home fine', ur: 'Ammi rone ki awaaz mein call kar rahi hain ke 50,000 fori chahiye - lekin woh ghar mein bilkul theek hain', ro: 'Ammi rone ki awaaz mein call kar rahi hain ke 50,000 fori chahiye - lekin woh ghar mein bilkul theek hain' },
    ],
    warningSigns: [
      { en: 'Caller demands urgent money transfer without giving details', ur: 'Caller fori paise transfer mangta hai bina tafseelaat diye', ro: 'Caller fori paise transfer mangta hai bina tafseelaat diye' },
      { en: 'Voice sounds slightly off or robotic', ur: 'Awaaz thori ajeeb ya robotic lagti hai', ro: 'Awaaz thori ajeeb ya robotic lagti hai' },
    ],
    complaintPath: getComplaintPathForType('AI Voice/Deepfake Scam')!,
  },
  {
    id: 'fake_online_store_scam',
    scamType: 'Fake Online Store Scam',
    scamTypeUrdu: '\u062c\u0639\u0644\u06cc \u0622\u0646 \u0644\u0627\u0626\u0646 \u0627\u0633\u0679\u0648\u0631 \u0627\u0633\u06a9\u06cc\u0645',
    scamTypeRomanUrdu: 'Fake Online Store Scam (Instagram/WhatsApp Shops)',
    category: 'Scam',
    severity: 'high',
    description: 'Fake shops on Instagram, WhatsApp and Facebook selling products at 50-70% below market price. They take advance payment via bank transfer and disappear.',
    descriptionUrdu: 'Instagram, WhatsApp aur Facebook par jaali shops jo market se 50-70% kam qeemat par products bechti hain.',
    descriptionRomanUrdu: 'Instagram, WhatsApp aur Facebook par jaali shops jo market se 50-70% kam qeemat par products bechti hain.',
    commonExamples: [
      { en: 'iPhone 15 Pro at Rs 80,000 on Instagram - pay via EasyPaisa, delivery in 3 days', ur: 'Instagram par iPhone 15 Pro sirf 80,000 - EasyPaisa se pay karein, 3 din mein delivery', ro: 'Instagram par iPhone 15 Pro sirf 80,000 - EasyPaisa se pay karein, 3 din mein delivery' },
    ],
    warningSigns: [
      { en: 'Only accepts advance bank transfer, no cash on delivery', ur: 'Sirf advance bank transfer qabool karta hai, COD nahi', ro: 'Sirf advance bank transfer qabool karta hai, COD nahi' },
      { en: 'No physical address or verifiable business registration', ur: 'Koi jismani pata ya tasdeeq shuda business registration nahi', ro: 'Koi jismani pata ya tasdeeq shuda business registration nahi' },
    ],
    complaintPath: getComplaintPathForType('Fake Online Store Scam')!,
  },
  {
    id: 'overseas_employment_visa_scam',
    scamType: 'Overseas Employment/Visa Consultancy Scam',
    scamTypeUrdu: '\u0628\u06cc\u0631\u0648\u0646 \u0645\u0644\u06a9 \u0645\u0644\u0627\u0632\u0645\u062a / \u0648\u06cc\u0632\u0627 \u06a9\u0646\u0633\u0644\u0679\u0646\u0633\u06cc \u0627\u0633\u06a9\u06cc\u0645',
    scamTypeRomanUrdu: 'Overseas Employment/Visa Consultancy Scam (Dubai, Saudi Job Fraud)',
    category: 'Employment Scam',
    severity: 'high',
    description: 'Fake overseas employment agencies promising guaranteed Dubai/Saudi/UK/Canada jobs for a processing fee. The visa is always fake and the agency disappears.',
    descriptionUrdu: 'Jaali bairoon mulk rozgar agencies jo processing fee ke awaz mein guaranteed Dubai/Saudi/UK/Canada jobs ka wada karti hain.',
    descriptionRomanUrdu: 'Jaali bairoon mulk rozgar agencies jo processing fee ke awaz mein guaranteed Dubai/Saudi/UK/Canada jobs ka wada karti hain.',
    commonExamples: [
      { en: 'Dubai company hiring - visa guaranteed, pay Rs 3 lakh processing fee now', ur: 'Dubai company hiring - visa guaranteed, 3 lakh processing fee abhi dein', ro: 'Dubai company hiring - visa guaranteed, 3 lakh processing fee abhi dein' },
    ],
    warningSigns: [
      { en: 'Agency not registered with Bureau of Emigration (BEOE)', ur: 'Agency BEOE mein registered nahi', ro: 'Agency BEOE mein registered nahi' },
      { en: 'Promises 100% visa guarantee', ur: '100% visa guarantee ka wada', ro: '100% visa guarantee ka wada' },
    ],
    complaintPath: getComplaintPathForType('Overseas Employment/Visa Consultancy Scam')!,
  },
  {
    id: 'fake_scholarship_scam',
    scamType: 'Fake Scholarship Scam',
    scamTypeUrdu: '\u062c\u0639\u0644\u06cc \u0627\u0633\u06a9\u0648\u0644\u0631\u0634\u067e \u0627\u0633\u06a9\u06cc\u0645',
    scamTypeRomanUrdu: 'Fake Scholarship Scam (HEC, Fulbright, Embassy Impersonation)',
    category: 'Scam',
    severity: 'high',
    description: 'Fake scholarship emails/links impersonating HEC, Fulbright, Chevening or foreign embassies. They ask for processing fees or bank details to "send money".',
    descriptionUrdu: 'HEC, Fulbright, Chevening ya foreign embassies ki naqal karne wali jaali scholarship emails/links.',
    descriptionRomanUrdu: 'HEC, Fulbright, Chevening ya foreign embassies ki naqal karne wali jaali scholarship emails/links.',
    commonExamples: [
      { en: 'HEC announces new fully funded scholarship - pay Rs 5,000 processing fee to apply', ur: 'HEC nayi fully funded scholarship ka aelaan - apply karne ke liye 5,000 processing fee dein', ro: 'HEC nayi fully funded scholarship ka aelaan - apply karne ke liye 5,000 processing fee dein' },
    ],
    warningSigns: [
      { en: 'Asks for processing fee or application fee', ur: 'Processing fee ya application fee mangta hai', ro: 'Processing fee ya application fee mangta hai' },
      { en: 'Email comes from Gmail/Yahoo instead of .gov or .edu domain', ur: 'Email Gmail/Yahoo se hai .gov ya .edu domain ki bajaye', ro: 'Email Gmail/Yahoo se hai .gov ya .edu domain ki bajaye' },
    ],
    complaintPath: getComplaintPathForType('Fake Scholarship Scam')!,
  },
  {
    id: 'fake_banking_app_scam',
    scamType: 'Fake Banking App Scam',
    scamTypeUrdu: '\u062c\u0639\u0644\u06cc \u0628\u06cc\u0646\u06a9\u0646\u06af \u0627\u06cc\u067e \u0627\u0633\u06a9\u06cc\u0645',
    scamTypeRomanUrdu: 'Fake Banking App Scam (Clone Apps, APK Downloads via Links)',
    category: 'Credential Theft',
    severity: 'critical',
    description: 'Fake banking apps distributed via WhatsApp links or QR codes that look exactly like real banking apps but steal your login credentials and OTP.',
    descriptionUrdu: 'WhatsApp links ya QR codes ke zariye distribute ki jane wali jaali banking apps jo asli banking apps jesi dikhti hain lekin login credentials aur OTP chura leti hain.',
    descriptionRomanUrdu: 'WhatsApp links ya QR codes ke zariye distribute ki jane wali jaali banking apps jo asli banking apps jesi dikhti hain lekin login credentials aur OTP chura leti hain.',
    commonExamples: [
      { en: 'Download new HBL app update from this link to avoid account suspension', ur: 'Account suspension se bachne ke liye is link se naya HBL app update download karein', ro: 'Account suspension se bachne ke liye is link se naya HBL app update download karein' },
    ],
    warningSigns: [
      { en: 'App downloaded from WhatsApp link instead of Play Store', ur: 'App Play Store ki bajaye WhatsApp link se download ki gayi', ro: 'App Play Store ki bajaye WhatsApp link se download ki gayi' },
      { en: 'App requests excessive permissions (SMS, contacts, camera)', ur: 'App zaroorat se zyada ijazatein mangti hai (SMS, contacts, camera)', ro: 'App zaroorat se zyada ijazatein mangti hai (SMS, contacts, camera)' },
    ],
    complaintPath: getComplaintPathForType('Fake Banking App Scam')!,
  },
];

// ─── Categories ─────────────────────────────────────────────────────────────
export const SCAM_CATEGORIES: { name: ScamCategory; icon: string; color: string; descriptionEn: string; descriptionUrdu: string; descriptionRomanUrdu: string }[] = [
  { name: 'Financial Fraud', icon: '💰', color: 'from-red-500 to-rose-500', descriptionEn: 'Bank, investment, loan and money-related frauds', descriptionUrdu: 'بینک، سرمایہ کاری، لون اور پیسوں سے متعلق فراڈ', descriptionRomanUrdu: 'Bank, investment, loan aur paison se mutaliq fraud' },
  { name: 'Credential Theft', icon: '🔑', color: 'from-amber-500 to-orange-500', descriptionEn: 'OTP, password, PIN and account credential theft', descriptionUrdu: 'OTP، پاس ورڈ، PIN اور اکاؤنٹ کی اسناد کی چوری', descriptionRomanUrdu: 'OTP, password, PIN aur account ki asnaad ki chori' },
  { name: 'Social Engineering', icon: '🎭', color: 'from-violet-500 to-purple-500', descriptionEn: 'Manipulation-based scams using emotions', descriptionUrdu: 'جذبات استعمال کر کے ہیرا پھیری پر مبنی اسکیمیں', descriptionRomanUrdu: 'Jazbaat istemal kar ke hera pheri par mabni schemein' },
  { name: 'Employment Scam', icon: '💼', color: 'from-blue-500 to-cyan-500', descriptionEn: 'Fake jobs, freelancing and education frauds', descriptionUrdu: 'جعلی نوکریاں، فری لانسنگ اور تعلیمی فراڈ', descriptionRomanUrdu: 'Jaali naukriyan, freelancing aur taleemi fraud' },
  { name: 'Digital Threat', icon: '📱', color: 'from-red-600 to-pink-500', descriptionEn: 'Hacking, harassment, sextortion and SIM swap', descriptionUrdu: 'ہیکنگ، ہراسانی، سیکس ٹورشن اور سم سوئپ', descriptionRomanUrdu: 'Hacking, harassment, sextortion aur SIM swap' },
  { name: 'Impersonation', icon: '👤', color: 'from-emerald-500 to-teal-500', descriptionEn: 'Fake brands, tech support and social media impersonation', descriptionUrdu: 'جعلی برانڈز، ٹیک سپورٹ اور سوشل میڈیا نقالت', descriptionRomanUrdu: 'Jaali brands, tech support aur social media naqali' },
  { name: 'Property Fraud', icon: '🏠', color: 'from-indigo-500 to-blue-500', descriptionEn: 'Rental, visa and property-related scams', descriptionUrdu: 'کرایہ، ویزا اور جائیداد سے متعلق اسکیمیں', descriptionRomanUrdu: 'Kiraya, visa aur jaidad se mutaliq schemein' },
  { name: 'Identity Crime', icon: '🪪', color: 'from-fuchsia-500 to-pink-500', descriptionEn: 'CNIC theft, fake documents and identity fraud', descriptionUrdu: 'شناختی کارڈ چوری، جعلی دستاویزات اور شناختی فراڈ', descriptionRomanUrdu: 'CNIC chori, jaali documents aur shanakhti fraud' },
  { name: 'Scam', icon: '🎯', color: 'from-yellow-500 to-amber-500', descriptionEn: 'Prize, lottery, gambling and general scams', descriptionUrdu: 'انعام، لاتری، جوئے اور عام اسکیمیں', descriptionRomanUrdu: 'Inaam, lottery, juwa aur aam schemein' },
];

// ─── Helper Functions ───────────────────────────────────────────────────────
export function getScamTypeById(id: string): ScamTypeEntry | undefined {
  return SCAM_TYPES_REGISTRY.find((s) => s.id === id);
}

export function getScamTypesByCategory(category: ScamCategory): ScamTypeEntry[] {
  return SCAM_TYPES_REGISTRY.filter((s) => s.category === category);
}

export function getScamTypesBySeverity(severity: 'critical' | 'high' | 'medium'): ScamTypeEntry[] {
  return SCAM_TYPES_REGISTRY.filter((s) => s.severity === severity);
}

export function searchScamTypes(query: string): ScamTypeEntry[] {
  const q = query.toLowerCase().trim();
  if (!q) return SCAM_TYPES_REGISTRY;
  return SCAM_TYPES_REGISTRY.filter((s) => {
    return (
      s.scamType.toLowerCase().includes(q) ||
      s.scamTypeUrdu.includes(q) ||
      (s.scamTypeRomanUrdu || '').toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.descriptionRomanUrdu.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q)
    );
  });
}

export function getAllCategories(): ScamCategory[] {
  return [...new Set(SCAM_TYPES_REGISTRY.map((s) => s.category))];
}

export function getRegistryStats() {
  return {
    totalTypes: SCAM_TYPES_REGISTRY.length,
    critical: SCAM_TYPES_REGISTRY.filter((s) => s.severity === 'critical').length,
    high: SCAM_TYPES_REGISTRY.filter((s) => s.severity === 'high').length,
    medium: SCAM_TYPES_REGISTRY.filter((s) => s.severity === 'medium').length,
    categories: getAllCategories().length,
  };
}
