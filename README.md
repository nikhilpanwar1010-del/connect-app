# Our Little Space 💕 | Private Romantic Chat Sanctuary

> A romantic, warm, polished, and private 1-to-1 chat web app designed as a personal gift for someone special. Fast, free to host, mobile-first, and end-to-end encrypted with PostgreSQL Row Level Security (RLS).

---

## 🌟 What is Our Little Space?

**Our Little Space** is a private, real-time sanctuary for couples and loved ones. Send an invite link to your partner; when they tap it, they are greeted by a **jaw-dropping full-screen proposal sequence** (glowing heart rain, line-by-line typewriter love note, and a playful question with an evasive "No" button and giant glowing "YES" celebration), before entering your private chat room.

- 🌸 **Vibrant Romantic Design**: Modern glassmorphism, soft pinks (`#FF4D8D`, `#FFB3CF`, `#FFF0F6`), and warm gradients with Dancing Script romantic typography.
- 💌 **Proposal Experience**: Built-in interactive proposal with 60fps canvas heart rain, celebration confetti, music chimes, haptics, and runaway button!
- ⚡ **Realtime Messaging**: Instant delivery, double-tick message status (sent, delivered, seen), typing indicator ("typing..."), and online presence.
- 🎙️ **Rich Media**: Voice notes with custom audio waveforms, client-side photo compression, stickers, emojis, message replies, and emoji reactions.
- 💖 **"Thinking of You" Heart Storm**: One tap triggers a magical floating heart storm across both screens with sweet musical chimes.
- 📸 **Shared Memories Gallery**: A timeline of your photos, captions, and dates with full-screen lightbox.
- 💑 **"Days Together" Counter**: Always know how many days, hours, and moments you've been together.
- 📜 **Daily Love Notes**: Daily romantic quotes and sweet love cards that you can cycle through.
- 🌙 **Midnight Rose Dark Mode**: Switch between vibrant pink and midnight rose dark mode.
- 📱 **Installable PWA**: Works like a native iOS/Android app with "Add to Home Screen", custom pink icons, and safe-area notch support.
- 🔒 **100% Free & Open Source**: Built with React, Vite, Tailwind CSS, TypeScript, Framer Motion, and Supabase free tier (no credit card required).

---

## 💖 The Proposal Experience (The First Thing She Sees)

When your partner opens your invite link (`/join/your-code`) for the first time, the app plays an immersive romantic sequence:

1. **60fps Heart Rain Canvas**: Hundreds of glowing pink hearts, petals, and sparkles gently float and sway across the screen.
2. **Typewriter Love Message**: Lines typed out character by character on a glass card.
3. **The Big Question**: "Will you be mine? 💖"
   - **"YES 💗"**: Big, glowing pink button that pulses with love.
   - **"No 🥺"**: A playful runaway button! Every time she tries to tap or hover, it darts away to a random position and shrinks, while the YES button grows bigger with cute messages like *"Are you sure? 🥺"*, *"Think again 💔"*, and *"Pretty please with sprinkles? 🌹"*.
4. **Celebration on "YES"**: Full-screen confetti explosions, screen-wide pink glow, celebration audio fanfare, phone haptic vibration (`navigator.vibrate`), and records her answer!
5. **"Let's start our story 💌"**: Takes her smoothly into your private chat room.
6. **Replay Anytime**: Available under the settings menu so you can relive the moment together whenever you want.

### ✏️ How to Customize Your Proposal (In 60 Seconds)

Open [`src/config/proposal.ts`](file:///c:/Users/nikhi/OneDrive/Desktop/connect/src/config/proposal.ts) to edit your partner's name, message lines, question, anniversary date, and quotes:

```typescript
export const proposalConfig = {
  recipientName: "Sophia 💕",
  senderName: "Liam",

  introLines: [
    "Hey Sophia 💕",
    "I made something just for you...",
    "Every moment with you is my favorite memory in the world ✨"
  ],

  questionText: "Will you be mine? 💖",
  yesButtonText: "YES 💗",
  noButtonText: "No 🥺",

  anniversaryDate: "2024-02-14", // Used for the "Days Together" counter
  // ...
};
```

---

## 🚀 Quickstart: Run Locally in 2 Minutes

You can run and test the complete app immediately—even before setting up Supabase! It includes a built-in instant preview mode with `BroadcastChannel` multi-tab sync so you can test two chat windows side by side.

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Dev Server
```bash
npm run dev
```

Open `http://localhost:3000` in your browser. Open a second window or an incognito tab to chat with yourself in real time!

---

## 🛠️ Step-by-Step Beginner Guide: Free Supabase Setup (Under 10 Minutes)

You get free database, authentication, realtime websocket subscriptions, and storage on Supabase's free tier. **No credit card required.**

### Step 1: Create a Free Supabase Account
1. Go to [https://supabase.com](https://supabase.com) and click **Sign Up** (or log in with GitHub).
2. Click **New Project**.
3. Choose a name (e.g. `our-little-space`), set a database password (remember this), and pick the region closest to you.
4. Click **Create new project** (takes ~1 minute to finish provisioning).

### Step 2: Paste the SQL Schema
1. In your Supabase dashboard, click **SQL Editor** on the left menu (icon `>_`).
2. Click **New Query**.
3. Open the file [`supabase/schema.sql`](file:///c:/Users/nikhi/OneDrive/Desktop/connect/supabase/schema.sql) in this repository, copy all the contents, and paste them into the Supabase SQL Editor.
4. Click **Run** (or `Ctrl + Enter`).
   > *This automatically creates the `profiles`, `rooms`, `room_members`, `messages`, `reactions`, `memories`, and `proposals` tables, sets up Row Level Security (RLS) policies, and creates the storage buckets for media!*

### Step 3: Copy Your API Keys to `.env`
1. In your Supabase dashboard, go to **Project Settings** (gear icon at bottom left) ➔ **API**.
2. Copy your **Project URL** (e.g. `https://xyzcompany.supabase.co`).
3. Copy your **anon / public** API key.
4. In your project folder, create or open `.env` and fill in:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### Step 4: Enable Realtime
1. In your Supabase dashboard, go to **Database** ➔ **Publications**.
2. Click on `supabase_realtime` and ensure `messages`, `room_members`, `reactions`, `memories`, and `profiles` are toggled ON (the SQL script already sets this up!).

---

## 🌐 Deploy to Vercel in 3 Minutes (Free)

Deploying makes your app available as a public URL that you and your partner can use from anywhere.

### Option A: Deploy via GitHub (Recommended)
1. Push your code to your GitHub repository:
   ```bash
   git add .
   git commit -m "Our Little Space - Romantic Chat Web App"
   git branch -M main
   git remote add origin https://github.com/your-username/our-little-space.git
   git push -u origin main
   ```
2. Go to [https://vercel.com](https://vercel.com) and log in with your GitHub account.
3. Click **Add New...** ➔ **Project**.
4. Select your `our-little-space` repository and click **Import**.
5. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL`: (your Supabase URL)
   - `VITE_SUPABASE_ANON_KEY`: (your Supabase anon key)
6. Click **Deploy**.
7. In ~60 seconds, your site is live at `https://your-project.vercel.app`!

### Option B: Deploy with Vercel CLI
```bash
npm install -g vercel
vercel
```
Follow the simple terminal prompts and provide your environment variables.

---

## 📲 Install as an App on Mobile (PWA)

Your web app has built-in Progressive Web App (PWA) support with a custom service worker, manifest, and pink app icon:

- **On iPhone (Safari)**: Tap the **Share** button (box with upward arrow) ➔ scroll down and tap **"Add to Home Screen"**. It creates a native app icon on her home screen without any browser address bar!
- **On Android (Chrome)**: Tap the three dots (menu) ➔ tap **"Add to Home screen"** or **"Install app"**.

---

## 🎨 Customizing Themes & Colors

### 5 Built-in Wallpaper Themes
Click the palette icon (`🎨`) in the chat header to choose between:
1. **Pink Blossom**: Warm, energetic romantic gradient (Default).
2. **Sunset Blush**: Soft peach and rose tones.
3. **Midnight Rose**: Dark romantic aesthetic with glowing neon-pink accents.
4. **Lavender Dream**: Lilac, soft violet, and blush.
5. **Peaches & Cream**: Sweet coral and warm vanilla.

### Modifying the Palette
All colors are configured in [`tailwind.config.js`](file:///c:/Users/nikhi/OneDrive/Desktop/connect/tailwind.config.js):
- `romantic.hot`: `#FF4D8D`
- `romantic.rose`: `#FFB3CF`
- `romantic.blush`: `#FFF0F6`
- `romantic.berry`: `#C2185B`
- `romantic.darkBg`: `#120710`

---

## 📁 Project Structure

```
├── public/
│   ├── icon.svg             # Pink romantic squircle PWA app icon
│   ├── og-image.svg         # Open Graph preview card for WhatsApp / iMessage
│   ├── manifest.webmanifest # PWA Web App Manifest
│   └── sw.js                # Service worker for offline asset caching
├── src/
│   ├── components/
│   │   ├── chat/            # ChatArea, MessageBubble, ChatInput, ChatHeader, EmojiPicker
│   │   ├── modals/          # InviteModal (QR Code), MemoriesModal, LoveNotesModal, ThemeCustomizer
│   │   ├── landing/         # LandingPage with zero-friction onboarding
│   │   └── proposal/        # ProposalScreen & 60fps HeartRainCanvas
│   ├── config/
│   │   └── proposal.ts      # Names, typewriter text, proposal question, anniversary date
│   ├── context/
│   │   ├── AuthContext.tsx  # Supabase Auth + Guest fallback session manager
│   │   └── ChatContext.tsx  # Messages, rooms, reactions, typing, and broadcast channel
│   ├── lib/
│   │   ├── audio.ts         # Web Audio API romantic synth & celebration fanfare
│   │   ├── imageCompression.ts # Fast HTML5 Canvas image resizer/compressor
│   │   └── supabase.ts      # Supabase client setup & configuration check
│   ├── types/
│   │   └── database.ts      # TypeScript interfaces for Database & Chat
│   ├── App.tsx              # Main controller & route orchestrator
│   └── main.tsx             # React entrypoint
├── supabase/
│   └── schema.sql           # Complete SQL schema, RLS policies, buckets, and realtime
├── package.json
├── tailwind.config.js
└── vite.config.ts
```

---

## 📄 License

This project is licensed under the [MIT License](file:///c:/Users/nikhi/OneDrive/Desktop/connect/LICENSE) - free to use, modify, and cherish forever! 💕
