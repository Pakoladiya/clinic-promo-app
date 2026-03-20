# Firebase Setup Guide

## 1. Create a Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** → give it a name (e.g. `clinic-promo`)
3. Disable Google Analytics (optional) → **Create project**

---

## 2. Enable Authentication

1. Left sidebar → **Authentication** → **Get started**
2. **Sign-in method** tab → enable **Email/Password** → Save

---

## 3. Create Firestore database

1. Left sidebar → **Firestore Database** → **Create database**
2. Choose **Start in production mode** → select your region → **Enable**
3. Go to the **Rules** tab and paste the contents of `firestore.rules` from this repo → **Publish**

---

## 4. Enable Storage

1. Left sidebar → **Storage** → **Get started**
2. Accept defaults → your region → **Done**
3. Go to **Rules** tab and replace with:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /logos/{uid}.{ext} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

4. Click **Publish**

---

## 5. Get your web config

1. Left sidebar → ⚙️ **Project settings** (gear icon)
2. Scroll to **Your apps** → click the **</>** (web) icon → register app
3. Copy the `firebaseConfig` object — you need all 6 values

---

## 6. Set environment variables

Copy `web/.env.example` → `web/.env` and fill in:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

---

## 7. Create your admin user

1. Firebase Console → **Authentication** → **Add user**
2. Enter your email and a password → **Add user**
3. Copy the **User UID** shown in the users table
4. Go to **Firestore** → **Start collection** → collection ID: `admin`
5. Document ID: paste your UID → add field `uid` (string) = your UID → **Save**

---

## 8. Seed sample content

```bash
# From the repo root
node web/scripts/seedFirestore.mjs
```

> The script reads `web/.env` and calls the Firestore REST API.
> Temporarily open Firestore rules to allow writes, or use a Service Account key.

---

## 9. Install & run

```bash
cd web
npm install      # installs firebase SDK
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and log in with your admin email.

---

## 10. Deploy to Vercel

Same as before — see `DEPLOY.md`. Add the 6 `VITE_FIREBASE_*` env vars in Vercel instead of the Supabase ones.
