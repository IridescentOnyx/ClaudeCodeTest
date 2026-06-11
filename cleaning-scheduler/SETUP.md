# Setup Guide — Cleaning Scheduler

Follow these steps once to connect the app to Google Calendar.

---

## Step 1 — Enable GitHub Pages

1. Go to your GitHub repo → **Settings** → **Pages** (left sidebar)
2. Under "Branch", select **main** and folder **/ (root)**, then click **Save**
3. Wait ~1 minute, then your site URL will appear:
   `https://iridescenton.github.io/ClaudeCodeTest/`
4. The scheduler lives at:
   `https://iridescenton.github.io/ClaudeCodeTest/cleaning-scheduler/`

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
   - `https://iridescenton.github.io` ← your GitHub Pages domain (no trailing slash, no path)
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

Visit `https://iridescenton.github.io/ClaudeCodeTest/cleaning-scheduler/` and click **Connect Google Calendar**.

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
