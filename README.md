# 🚀 CampaignHub

**CampaignHub** is a modern email campaign command center for managing contacts, groups, reusable templates, SMTP credentials, Cloudinary attachments, and send history from one clean workspace.

It runs as a **Next.js web app** and can also be packaged as an **Electron desktop app**.

🌐 **Live Demo:** https://campaignhub-zeta.vercel.app

---

## ✨ Features

- 📊 **Dashboard cockpit** with contacts, groups, templates, delivery stats, and recent activity
- 👥 **Contact management** with create, edit, delete, search, labels, pagination, CSV import, and CSV export
- 🧩 **Group management** with member assignment and group detail pages
- ✍️ **Rich email composer** powered by TipTap
- 📝 **Reusable templates** for faster campaign creation
- 📬 **SMTP sending** through Gmail App Passwords or env fallback credentials
- 📎 **Cloudinary attachment support** for uploaded campaign files
- 🕘 **Send history** with per-campaign delivery records
- ⚙️ **Settings center** for Gmail, Cloudinary, and app connection status
- 🔔 **Custom toast alerts** for errors, warnings, success messages, and missing action feedback
- ⏳ **Custom branded loading screen**
- 🎨 **Redesigned colorful UI** with fixed sidebar navigation and scrollable content area
- 🖥️ **Electron desktop build** support
- ☁️ **Vercel web deployment** support

---

## 🧱 Tech Stack

- ⚡ **Next.js 14**
- ⚛️ **React 18**
- 🎨 **Tailwind CSS**
- 🍃 **MongoDB Atlas + Mongoose**
- 📧 **Nodemailer**
- ☁️ **Cloudinary**
- 📝 **TipTap rich text editor**
- 🖥️ **Electron**
- 📦 **Electron Builder**
- ▲ **Vercel**

---

## 📁 Project Structure

```txt
src/
  app/                 Next.js pages and API routes
  components/          Reusable UI and feature components
  lib/                 Database, mailer, CSV, settings, and helpers
  models/              Mongoose models
  types/               TypeScript types
electron/              Desktop app entry, preload, splash, and assets
scripts/               Build and standalone preparation scripts
public/                Static assets, if added
```

---

## ✅ Requirements

Install these before running the project:

- 🟢 **Node.js 18+**
- 📦 **npm**
- 🍃 **MongoDB Atlas database**
- 📧 **Gmail App Password** if you want to send real emails
- ☁️ **Cloudinary account** if you want attachment uploads

---

## 🔐 Environment Variables

Create a `.env.local` file in the project root.

```env
# Required
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/mailservice?retryWrites=true&w=majority

# Optional SMTP fallback
SMTP_EMAIL=
SMTP_APP_PASSWORD=

# Optional Cloudinary fallback
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Local server port
PORT=3000
```

⚠️ **Important:** never commit `.env.local`. It contains private keys and passwords.

The app can also save Gmail and Cloudinary credentials from the **Settings** page, so only `MONGODB_URI` is required for the main database connection.

---

## 🍃 MongoDB Atlas Setup

1. Create a MongoDB Atlas cluster.
2. Create a database user in **Database Access**.
3. Copy your driver connection string.
4. Replace `<password>` with your real database user password.
5. Add the final URI to `.env.local` as `MONGODB_URI`.

Example:

```env
MONGODB_URI=mongodb+srv://my_user:my_password@cluster0.xxxxx.mongodb.net/mailservice?retryWrites=true&w=majority
```

### Vercel + MongoDB Note

Vercel uses dynamic serverless IP addresses. For the deployed web app to connect to MongoDB Atlas, go to:

```txt
MongoDB Atlas → Network Access → Add IP Address → Allow Access from Anywhere
```

This adds:

```txt
0.0.0.0/0
```

Use strong database credentials when allowing this.

---

## 🧪 Local Development

Install dependencies:

```bash
npm install
```

Start the web app:

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

---

## 🖥️ Run as Desktop App

Start Next.js and Electron together:

```bash
npm run electron:dev
```

Run Electron against a production build:

```bash
npm run electron:prod
```

Build desktop installers:

```bash
npm run dist
```

The installer output is created in:

```txt
dist/
```

---

## ☁️ Deploy to Vercel

Login to Vercel:

```bash
vercel login
```

Link the project:

```bash
vercel link
```

Add the production MongoDB variable:

```bash
vercel env add MONGODB_URI production
```

Deploy:

```bash
vercel deploy --prod
```

Current production URL:

```txt
https://campaignhub-zeta.vercel.app
```

---

## 🧰 Useful Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Next.js development server |
| `npm run build` | Build production Next.js output |
| `npm run start` | Start production Next.js server |
| `npm run lint` | Run ESLint |
| `npm run electron:dev` | Run web app + Electron desktop shell |
| `npm run electron:prod` | Run Electron with production build |
| `npm run dist` | Build desktop installer package |

---

## 🧭 Main Pages

| Page | Path | Description |
| --- | --- | --- |
| 📊 Dashboard | `/` | Campaign stats and recent activity |
| 👥 Contacts | `/contacts` | Manage address book, labels, import, and export |
| 🧩 Groups | `/groups` | Create groups and manage members |
| ✍️ Compose | `/compose` | Build and send rich email campaigns |
| 📝 Templates | `/templates` | Save reusable email content |
| 🕘 History | `/history` | Review previous sends |
| ⚙️ Settings | `/settings` | Configure SMTP, Cloudinary, and connection status |

---

## 🔌 API Routes

| Route | Purpose |
| --- | --- |
| `/api/dashboard` | Dashboard stats and recent logs |
| `/api/contacts` | Contact CRUD |
| `/api/contacts/import` | CSV contact import |
| `/api/contacts/export` | CSV contact export |
| `/api/groups` | Group CRUD |
| `/api/groups/[id]/members` | Group membership updates |
| `/api/templates` | Template CRUD |
| `/api/send` | Send campaign email |
| `/api/logs` | Send history |
| `/api/settings` | App connection status and settings |
| `/api/settings/test` | SMTP test |
| `/api/settings/cloudinary-test` | Cloudinary test |

---

## 🛠️ Troubleshooting

### ❌ MongoDB connection error on Vercel

If the deployed app shows:

```txt
Could not connect to any servers in your MongoDB Atlas cluster
```

Fix:

1. Open MongoDB Atlas.
2. Go to **Network Access**.
3. Add `0.0.0.0/0`.
4. Wait 1-2 minutes.
5. Refresh the Vercel site.

### ❌ Emails are not sending

Check:

- Gmail address is correct.
- Gmail App Password is used, not the normal Gmail password.
- SMTP settings are saved in **Settings**.
- The recipient email address is valid.

### ❌ Attachments are not uploading

Check:

- Cloudinary cloud name is correct.
- API key and API secret are correct.
- Cloudinary settings are saved in **Settings**.

### ❌ Page keeps loading

Check:

- MongoDB URI is correct.
- Atlas cluster is running.
- Atlas Network Access allows your environment.
- Restart local dev server after editing `.env.local`.

---

## 📜 Product Log

See [CHANGELOG.md](./CHANGELOG.md) for the full project update history.

Latest highlights:

- 🎨 Full UI redesign with colorful dashboard and fixed sidebar
- 🧭 Sidebar separated from main scroll area
- ⏳ Custom branded loading state
- 🔔 Global warning/error/success popup system
- 📥 CSV import and 📤 CSV export for contacts
- 📝 Template manager added
- ☁️ Vercel deployment added
- 🍃 MongoDB serverless timeout handling improved

---

## 🔒 Security Notes

- Keep `.env.local` private.
- Do not share MongoDB passwords, Gmail App Passwords, or Cloudinary secrets.
- Use strong MongoDB credentials.
- Rotate leaked credentials immediately.
- For production, consider stricter database access controls or static IP networking.

---

## 🚀 Roadmap Ideas

- 📈 Campaign analytics charts
- 🧪 A/B subject testing
- 🏷️ Advanced contact segmentation
- 📅 Scheduled campaigns
- 🧾 Bounce and unsubscribe tracking
- 👤 User accounts and roles
- 🔐 OAuth-based Gmail connection
- 🌍 Custom domain deployment

---

## 👨‍💻 Author

Built as **CampaignHub**, an email growth console for managing campaigns from web and desktop.

---

## 📄 License

This project is private by default. Add a license file if you plan to publish it publicly.
