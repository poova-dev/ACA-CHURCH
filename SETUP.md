# ACA Church PKT — Admin Panel & Firebase Setup Guide

This guide details the complete process for setting up Firebase Authentication, Firestore Database, Cloudinary image uploads, and deploying the ACA Church PKT Content Management System to Cloudflare Pages.

---

## 1. Firebase Project Setup

### Step 1.1: Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** and name it (e.g., `aca-church-pkt`).
3. Disable Google Analytics (or enable if desired) and click **Create project**.

### Step 1.2: Enable Firestore Database
1. In the Firebase console sidebar, navigate to **Build > Firestore Database**.
2. Click **Create database**.
3. Choose your database location (recommended: `asia-south1` Mumbai for fastest Tamil Nadu / India latency).
4. Select **Start in production mode** and click **Create**.

### Step 1.3: Enable Email/Password Authentication
1. Navigate to **Build > Authentication**.
2. Click **Get Started**, select **Email/Password** under Native Providers.
3. Toggle **Email/Password** to **Enabled** (leave Email Link disabled) and click **Save**.
4. Switch to the **Users** tab inside Authentication.
5. Click **Add user**, enter the church admin's email (e.g., `pastor@acachurchpkt.org`) and a strong password.
6. Copy the newly generated **User UID** (e.g., `k8x9N2mP7qZ...`). You will need this for the admin whitelist.

### Step 1.4: Register Web App & Get Firebase Config
1. In Project Overview, click the **Web (</>)** icon to add a web app.
2. App nickname: `ACA Church Web`.
3. Do not check Firebase Hosting. Click **Register app**.
4. Copy the `firebaseConfig` object:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "aca-church-pkt.firebaseapp.com",
     projectId: "aca-church-pkt",
     storageBucket: "aca-church-pkt.appspot.com",
     messagingSenderId: "...",
     appId: "..."
   };
   ```
5. Paste this config into:
   - `admin.html` (inside the `<script>` block in `window.FIREBASE_CONFIG`)
   - `js/firebase-public.js` (inside `window.PUBLIC_FIREBASE_CONFIG`)

---

## 2. Deploy Firestore Security Rules

### Step 2.1: Deploy via Firebase Console
1. Open the Firebase Console and navigate to **Build > Firestore Database > Rules**.
2. Copy the entire contents of [`firestore.rules`](./firestore.rules) from this repository.
3. Replace `'ADMIN_UID_PRIMARY_TODO'` and `'ADMIN_UID_SECONDARY_TODO'` with your actual Admin User UID copied in Step 1.3:
   ```javascript
   function isAdmin() {
     return request.auth != null && (
       request.auth.uid in [
         'k8x9N2mP7qZ1234567890abcdef' // Paste your Admin UID here
       ]
     );
   }
   ```
4. Click **Publish**.

*(Optional)* If you have the Firebase CLI installed, you can deploy with:
```bash
npx -y firebase-tools deploy --only firestore:rules
```

---

## 3. Cloudinary Image Upload Setup

Cloudinary handles secure unsigned photo uploads for the Pastor portrait, Church sanctuary images, and Gallery moments.

### Step 3.1: Create a Free Cloudinary Account
1. Sign up at [Cloudinary.com](https://cloudinary.com/).
2. On your Cloudinary Dashboard, find your **Cloud Name** (e.g., `dxyza123`).

### Step 3.2: Create an Unsigned Upload Preset
1. Click the **Settings (Gear Icon)** in the bottom left corner.
2. Navigate to **Upload > Upload presets**.
3. Click **Add upload preset**.
4. Name the preset: `aca_church_preset` (or any name you prefer).
5. Change **Signing Mode** from *Signed* to **Unsigned**.
6. *(Optional)* Under **Folder**, set `aca_church_uploads`.
7. Click **Save**.

### Step 3.3: Configure `admin.html`
In `admin.html`, update the Cloudinary configuration object:
```javascript
window.CLOUDINARY_CONFIG = {
  cloudName: "YOUR_CLOUD_NAME",            // e.g. "aca-pkt"
  uploadPreset: "YOUR_UNSIGNED_PRESET"     // e.g. "aca_church_preset"
};
```

---

## 4. Admin Whitelist Configuration in `admin.html`

In `admin.html`, locate the `ADMIN_WHITELIST` array near the top of the configuration script:
```javascript
window.ADMIN_WHITELIST = {
  // Option A: Whitelist by Firebase Authentication User UIDs (Most Secure)
  uids: [
    "PASTE_ADMIN_UID_HERE"
  ],
  // Option B: Whitelist by Email Addresses
  emails: [
    "admin@acachurchpkt.org",
    "pastor@acachurchpkt.org"
  ]
};
```
When an admin logs in, `admin.html` verifies their identity against this list. Non-whitelisted accounts will be rejected and automatically signed out.

---

## 5. First-Time Database Seeding (Optional)

When you log into `admin.html` for the first time:
1. Open `admin.html` in your browser.
2. Log in with your admin email and password.
3. The Admin Panel includes an intuitive **"Seed Default Site Content"** button on the Dashboard.
4. Clicking it will populate your Firestore collections (`site_content`, `vision_items`, `prayer_categories`, `gallery_images`) with the church's existing content, so your Firestore database is immediately ready.

---

## 6. Deployment to Cloudflare Pages

1. Push your Git repository to GitHub / GitLab.
2. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/) and go to **Workers & Pages**.
3. Click **Create application > Pages > Connect to Git**.
4. Select your `ACA` repository.
5. Build settings:
   - **Framework preset**: `None`
   - **Build command**: *(leave blank)*
   - **Build output directory**: `/` (root)
6. Click **Save and Deploy**.
7. Your admin panel will be accessible at: `https://your-domain.pages.dev/admin.html`
8. Your public site will be accessible at: `https://your-domain.pages.dev/index.html`

---

## 7. Security Best Practices

- **Never share Admin credentials**: Keep your Firebase admin email and password private.
- **Password Reset**: If an admin forgets their password, they can click "Forgot Password?" on the `admin.html` login page to receive a password reset link from Firebase.
- **Unsigned Cloudinary Preset**: The preset only allows media uploads (`images`) and cannot delete or modify existing assets.
- **Firestore Rules**: Public visitors can only read published content and submit new prayer petitions. They cannot read private prayer requests or alter website content.
