/**
 * Seed script — populates Firestore with sample content.
 *
 * Usage:
 *   1. Copy web/.env.example → web/.env and fill in your Firebase credentials.
 *   2. node web/scripts/seedFirestore.mjs
 *
 * The script uses the Firebase Admin SDK via the REST API so you only need
 * your VITE_FIREBASE_* env vars (no service account key required for seeding
 * through the public client SDK running in Node).
 *
 * NOTE: This uses the client SDK (not Admin SDK) so Firestore security rules
 * apply. Run it while logged in as an admin, or temporarily open rules during
 * setup and lock them down afterwards.
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));

// Load .env manually (no dotenv dependency needed)
const envPath = resolve(__dir, '../.env');
let envVars = {};
try {
  const raw = readFileSync(envPath, 'utf8');
  for (const line of raw.split('\n')) {
    const [k, ...v] = line.split('=');
    if (k && v.length) envVars[k.trim()] = v.join('=').trim();
  }
} catch {
  console.error('Could not read web/.env — copy .env.example and fill in values.');
  process.exit(1);
}

const cfg = {
  apiKey:     envVars.VITE_FIREBASE_API_KEY,
  projectId:  envVars.VITE_FIREBASE_PROJECT_ID,
};

if (!cfg.apiKey || !cfg.projectId) {
  console.error('Missing VITE_FIREBASE_API_KEY or VITE_FIREBASE_PROJECT_ID in .env');
  process.exit(1);
}

const BASE = `https://firestore.googleapis.com/v1/projects/${cfg.projectId}/databases/(default)/documents`;

const posts = [
  // Physio
  { discipline: 'Physio', title: 'Relieve Lower Back Pain', body: 'Simple daily stretches can dramatically reduce chronic lower back pain. Our physiotherapists recommend starting with cat-cow stretches every morning.' },
  { discipline: 'Physio', title: 'Posture Correction at Your Desk', body: 'Poor posture causes neck and shoulder tension. Adjust your chair height so your feet rest flat on the floor and your screen is at eye level.' },
  { discipline: 'Physio', title: 'Why Walking Matters', body: 'Just 30 minutes of brisk walking daily strengthens your cardiovascular system, improves joint mobility, and reduces injury risk.' },
  // Ophthalmology
  { discipline: 'Ophthalmology', title: '20-20-20 Rule for Screen Users', body: 'For every 20 minutes of screen time, look at something 20 feet away for 20 seconds. Reduces digital eye strain significantly.' },
  { discipline: 'Ophthalmology', title: 'Signs You Need an Eye Test', body: 'Frequent headaches, blurry vision at distance or close-up, and eye fatigue are all indicators that your vision may have changed.' },
  { discipline: 'Ophthalmology', title: 'Protecting Your Eyes in Summer', body: 'UV rays can damage your cornea and increase cataract risk. Always wear sunglasses rated UV400 when outdoors.' },
  // Cardiology
  { discipline: 'Cardiology', title: 'Know Your Blood Pressure Numbers', body: 'Normal BP is below 120/80 mmHg. High blood pressure often has no symptoms — get checked regularly to prevent silent damage.' },
  { discipline: 'Cardiology', title: 'Heart-Healthy Foods', body: 'Oily fish, nuts, berries, and leafy greens are excellent for cardiovascular health. Replace saturated fats with olive oil.' },
  { discipline: 'Cardiology', title: 'Warning Signs of a Heart Attack', body: 'Chest pressure, pain radiating to the arm or jaw, shortness of breath, and cold sweat — call emergency services immediately.' },
  // Dermatology
  { discipline: 'Dermatology', title: 'SPF Every Day', body: 'Sunscreen prevents premature ageing and skin cancer. Apply SPF 30+ every morning, even on cloudy days or when indoors near windows.' },
  { discipline: 'Dermatology', title: 'Understanding Acne Triggers', body: 'Hormonal changes, certain foods, stress, and some skincare products can trigger breakouts. A patch-test routine prevents reactions.' },
  { discipline: 'Dermatology', title: 'When a Mole Should Worry You', body: 'Use the ABCDE rule: Asymmetry, Border irregularity, Colour variation, Diameter over 6mm, Evolving shape or colour.' },
  // Dentistry
  { discipline: 'Dentistry', title: 'The Right Way to Brush', body: 'Use a soft-bristle brush at a 45° angle to the gum line. Brush for 2 minutes twice a day and don\'t forget your tongue.' },
  { discipline: 'Dentistry', title: 'Why Flossing Matters', body: 'Flossing removes plaque and food from between teeth where brushes can\'t reach, preventing gum disease and cavities.' },
  { discipline: 'Dentistry', title: 'Sugar and Tooth Decay', body: 'Bacteria feed on sugar and produce acid that erodes enamel. Limit sugary drinks and rinse with water after sweet snacks.' },
  // Nutrition
  { discipline: 'Nutrition', title: 'Eat the Rainbow', body: 'Different coloured vegetables contain different phytonutrients. Aim to include at least 5 colours on your plate every day.' },
  { discipline: 'Nutrition', title: 'Hydration and Health', body: 'Even mild dehydration reduces concentration and energy. Aim for 2 litres of water per day and more during hot weather or exercise.' },
  { discipline: 'Nutrition', title: 'Protein for Every Meal', body: 'Including a quality protein source at each meal stabilises blood sugar, keeps you full, and supports muscle maintenance.' },
];

async function addDoc(collection, data) {
  const fields = {};
  for (const [k, v] of Object.entries(data)) {
    fields[k] = { stringValue: String(v) };
  }
  fields.createdAt = { stringValue: new Date().toISOString() };

  const res = await fetch(`${BASE}/${collection}?key=${cfg.apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }
  return res.json();
}

console.log(`Seeding ${posts.length} posts to project "${cfg.projectId}"…\n`);

let ok = 0;
for (const post of posts) {
  try {
    await addDoc('content', post);
    console.log(`  ✓ [${post.discipline}] ${post.title}`);
    ok++;
  } catch (e) {
    console.error(`  ✗ [${post.discipline}] ${post.title}: ${e.message}`);
  }
}

console.log(`\nDone — ${ok}/${posts.length} posts seeded.`);
console.log('\nNext: add yourself to the "admin" collection in the Firebase console:');
console.log('  Collection: admin  |  Document ID: <your Firebase uid>  |  Field: uid (string)');
