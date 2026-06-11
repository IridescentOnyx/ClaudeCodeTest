# Setup Guide — Cleaning Scheduler

Follow these steps once to connect the app to Google Calendar.

---

## Step 1 — Enable GitHub Pages

1. Go to your GitHub repo → **Settings** → **Pages** (left sidebar)
2. Under "Branch", select **main** and folder **/ (root)**, then click **Save**
3. Wait ~1 minute, then your site URL will appear:
   `https://iridescentonyx.github.io/ClaudeCodeTest/`
4. The scheduler lives at:
   `https://iridescentonyx.github.io/ClaudeCodeTest/cleaning-scheduler/`

---

## Step 2 — Create a Google Cloud Project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Click the project dropdown (top left) → **New Project**
3. Name it `Cleaning Scheduler` → **Create**

---

## Step 3 — Enable the Google Calendar API

1. In the left menu go to **APIs & Services** → **Library**
2. Search for **Google Calendar API** → click it → **Enable**

---

## Step 4 — Configure the OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **External** → **Create**
3. Fill in:
   - App name: `Cleaning Scheduler`
   - User support email: your email
   - Developer contact: your email
4. Click **Save and Continue** through the remaining steps (no scopes or test users needed yet)
5. Back on the consent screen page, click **Publish App** → **Confirm**

---

## Step 5 — Create an OAuth Client ID

1. Go to **APIs & Services** → **Credentials** → **+ Create Credentials** → **OAuth client ID**
2. Application type: **Web application**
3. Name: `Cleaning Scheduler`
4. Under **Authorized JavaScript origins**, click **+ Add URI** and paste:
   - `https://iridescentonyx.github.io` ← your GitHub Pages domain (no trailing slash, no path)
   - Also add `http://localhost:8000` if you want to test locally
5. Click **Create**
6. A dialog shows your **Client ID** — copy it (looks like `1234567890-abc.apps.googleusercontent.com`)

---

## Step 6 — Paste the Client ID into the App

1. Open `cleaning-scheduler/index.html` in a code editor
2. Near the top of the `<script>` block, find this line:
   ```js
   const CLIENT_ID = 'YOUR_CLIENT_ID_HERE';
   ```
3. Replace `YOUR_CLIENT_ID_HERE` with your actual Client ID (keep the quotes)
4. Save the file, commit, and push

---

## Step 7 — Open the App

Visit `https://iridescentonyx.github.io/ClaudeCodeTest/cleaning-scheduler/` and click **Connect Google Calendar**.

Sign in with the Google account whose calendar your mom uses for her schedule. Appointments created in the app will appear on her phone automatically via the Google Calendar app.

---

## Testing Locally (optional)

If you want to preview without pushing to GitHub first:

```bash
cd /path/to/ClaudeCodeTest
python3 -m http.server 8000
```

Then open `http://localhost:8000/cleaning-scheduler/` in a browser.
Make sure `http://localhost:8000` is listed as an authorized JavaScript origin in your Google Cloud credentials (Step 5).

---

## Optional: Automatic SMS Inbox (Twilio + Cloudflare)

This makes client text messages appear in the app automatically — no copy-pasting. Requires a dedicated business phone number (~$1.15/month via Twilio). Cloudflare is free.

### Step A — Get a Twilio phone number

1. Create a free account at [twilio.com](https://twilio.com)
2. From the Twilio Console, go to **Phone Numbers** → **Manage** → **Buy a number**
3. Pick any local number and click **Buy** (~$1.15/month)
4. Share this number with clients as your mom's business contact

### Step B — Deploy the Cloudflare Worker

1. Create a free account at [cloudflare.com](https://cloudflare.com)
2. In the Cloudflare dashboard go to **Workers & Pages** → **Create** → **Create Worker**
3. Name it `cleaning-scheduler-inbox` and click **Deploy**
4. Click **Edit code**, delete the default code, and paste the contents of `cleaning-scheduler/worker.js` from this repo
5. Click **Deploy**

### Step C — Create the KV storage

1. In the Cloudflare dashboard go to **Workers & Pages** → **KV** → **Create a namespace**
2. Name it `INBOX` and click **Add**
3. Go back to your Worker → **Settings** → **Bindings** → **Add** → **KV Namespace**
4. Set Variable name: `INBOX`, select the `INBOX` namespace you just created → **Save**

### Step D — Add the secret

1. In your Worker → **Settings** → **Variables** → **Add variable**
2. Name: `SECRET`, Value: any random string you choose (e.g. `mycleaningapp2026`)
3. Click **Encrypt** then **Save**

### Step E — Connect Twilio to the Worker

1. Copy your Worker URL from the Cloudflare dashboard (looks like `https://cleaning-scheduler-inbox.your-name.workers.dev`)
2. In Twilio Console, go to **Phone Numbers** → click your number → **Configure**
3. Under **Messaging** → **A message comes in**, set:
   - Type: **Webhook**
   - URL: your Worker URL (no query params needed — Twilio posts directly)
   - Method: **HTTP POST**
4. Click **Save**

### Step F — Paste the Worker URL and secret into the app

1. Open `cleaning-scheduler/index.html`
2. Find these two lines near the top of the `<script>` block:
   ```js
   const WORKER_URL    = '';
   const WORKER_SECRET = '';
   ```
3. Paste your Worker URL and the secret value you chose between the quotes
4. Commit and push

### That's it!

Once deployed, texts sent to the Twilio number will appear automatically in the Inquiries panel within 30 seconds. The app reads each message, uses the same date/time detection to pre-fill the inquiry fields, and deletes the message from the Worker after pulling it. If the app is closed, messages queue in the Worker for up to 30 days and appear the next time the app is opened.
