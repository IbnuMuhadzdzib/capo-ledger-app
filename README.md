<div align="center">

# 🎩 CAPO LEDGER

**A noir-styled desktop financial archive for freelancers & creative professionals.**  
*Track your income. Command your allocations. Rule your finances.*

[![Platform](https://img.shields.io/badge/platform-Windows-blue?style=flat-square&logo=windows)](https://github.com)
[![Built with Electron](https://img.shields.io/badge/Built%20with-Electron-47848F?style=flat-square&logo=electron)](https://electronjs.org)
[![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com)
[![React](https://img.shields.io/badge/UI-React%2019-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![License: Private](https://img.shields.io/badge/License-Private-red?style=flat-square)](.)

---

> *"Every capo needs their own ledger."*

</div>

---

## ✨ What is Capo Ledger?

**Capo Ledger** is a premium desktop application designed for independent professionals, freelancers, and creative groups who want to take **full control of their income and expenses** — with style.

It combines the elegance of a **1940s noir aesthetic** with modern cloud-sync capabilities, giving you a personal financial archive that feels as powerful as it looks. Built using **Electron + React + Supabase**, your data is securely stored in the cloud and accessible from any machine.

---

## 🕵️ Features

### 💰 Income Management
- Log income entries with source, amount, date period, and optional notes
- **Split Income / Team Project** mode — record the **gross project value**, your **team size**, and your **personal share** with automatic percentage calculation
- Smart badge system: entries marked `[SPLIT]` for quick visual identification
- Edit and delete existing income entries from a clean passbook-style list

### 📊 Allocation Tracking
- Assign budgets to descriptive labels (e.g. *Savings, Rent, Investment*)
- **Live balance preview** — see your remaining balance update in real-time as you type an allocation amount
- Overspend warning displays in red with a pulsing animation when you'd go negative
- Period-locked allocations keep monthly budgets independent and clean

### 🗂 Annual Ledger & Charts
- **Annual Ledger** — interactive area chart showing month-by-month income and allocation trends for any year
- **Stakeout Calendar** — GitHub-style contribution heatmap visualizing daily financial activity across the full year
- **Most Wanted** — animated rogue's gallery of your top spending categories, styled as noir WANTED posters
- **Associates** — ranked list of your top income sources, styled as mob-style profile cards

### 📖 Activity Log
- Real-time combined feed showing recent incomes and allocations with timestamps
- Paginated for clean navigation in any period

### 📈 Pure Income Stats
- **My Share · This Month** — your actual personal received amount (not gross)
- **My Share · All Time** — lifetime cumulative earnings you personally received
- **Gross This Month / All Time** — full project values for your team projects (only shown when split income exists)

### 🔐 Authentication & Multi-User
- Login screen with full **Supabase Auth** (email & password)
- **Row Level Security (RLS)** — each user only sees their own data, enforced at the database level
- Complete data isolation between different accounts

### 🎨 Noir Aesthetic
- Dark `#0c0c0c` base with **gold (#c9a13b)** accents throughout
- Custom typography: *Special Elite* (display), *Quincy* (serif), *JetBrains Mono* (data)
- Framer Motion animations on hover effects, list entries, and form transitions
- Fully transparent Electron window with precise hit-testing for interactive areas
- Animated mafia boss teller character with contextual voice line reactions

---

## 🖥 Screenshots

> *Application running in desktop mode*

| Passbook & Income Log | Allocation Panel | Annual Ledger |
|---|---|---|
| *(income list with Noir badges)* | *(allocation table with balance stats)* | *(chart + yearly stats)* |

| Most Wanted | Stakeout Calendar | Login Screen |
|---|---|---|
| *(wanted poster grid)* | *(heatmap calendar)* | *(noir login)* |

---

## 🚀 Installation

### Option A — Download Installer (Recommended)

1. Go to the **[Releases](../../releases)** page
2. Download the latest `capo-ledger-X.X.X-setup.exe`
3. Run the installer — it installs silently and creates a desktop shortcut
4. On first launch, log in with your Supabase account credentials

> **Note:** Requires a Supabase project to be configured. See [Setup](#️-supabase-setup) below.

---

### Option B — Build From Source

**Prerequisites:** Node.js ≥ 18, Git

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/capo-ledger.git
cd capo-ledger

# Install dependencies
npm install

# Create environment variables
cp .env.example .env
# Fill in your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

# Run in development mode
npm run dev

# Build Windows installer
npm run build:win
```

---

## ⚙️ Supabase Setup

Capo Ledger requires a **Supabase project** for cloud storage and authentication.

### 1. Create a project at [supabase.com](https://supabase.com)

### 2. Run this SQL in the **SQL Editor**:

```sql
-- Income table
CREATE TABLE incomes (
  id TEXT PRIMARY KEY,
  period_month INTEGER NOT NULL,
  period_year INTEGER NOT NULL,
  amount REAL NOT NULL,
  source TEXT NOT NULL,
  note TEXT,
  is_split BOOLEAN DEFAULT FALSE,
  gross_amount REAL,
  team_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id UUID REFERENCES auth.users(id)
);

-- Allocation table
CREATE TABLE allocations (
  id TEXT PRIMARY KEY,
  period_month INTEGER NOT NULL,
  period_year INTEGER NOT NULL,
  label TEXT NOT NULL,
  amount REAL NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE allocations ENABLE ROW LEVEL SECURITY;

-- Policies: each user owns their data
CREATE POLICY "Users can manage their own incomes"
  ON incomes FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own allocations"
  ON allocations FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

### 3. Add your credentials to `.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Create users via **Authentication → Users → Add User** in your Supabase dashboard.

---

## 📦 Publishing a Release on GitHub

```bash
# 1. Build the installer
npm run build:win
# Installer appears at: dist/capo-ledger-1.0.0-setup.exe

# 2. Go to your GitHub repository
# 3. Click "Releases" → "Draft a new release"
# 4. Create a new tag (e.g. v1.0.0)
# 5. Upload the .exe file from the 'dist' folder
# 6. Click "Publish release"
```

Your team can then download the installer directly from the **Releases** page on GitHub without needing Git or Node.js.

---

## 🏗 Tech Stack

| Layer | Technology |
|---|---|
| Desktop Shell | [Electron 39](https://electronjs.org) |
| Build Tool | [electron-vite](https://electron-vite.org) |
| UI Framework | [React 19](https://react.dev) |
| Language | [TypeScript 5](https://typescriptlang.org) |
| State Management | [Zustand 5](https://zustand-demo.pmnd.rs) |
| Database | [Supabase (Postgres)](https://supabase.com) |
| Animations | [Framer Motion](https://framer.motion) |
| Icons | [Lucide React](https://lucide.dev) |
| Styling | Vanilla CSS with CSS Custom Properties |

---

## 🗂 Project Structure

```
capo-ledger/
├── src/
│   ├── main/           # Electron main process (window management, IPC)
│   ├── preload/        # Context bridge to renderer
│   └── renderer/src/
│       ├── components/ # All UI components
│       ├── store/      # Zustand stores (income, allocation, auth, app)
│       ├── lib/        # Supabase client, chart aggregation queries
│       └── types/      # TypeScript interfaces
├── resources/          # App icon
└── electron-builder.yml
```

---

## 🤝 Team Usage

Capo Ledger supports **multiple accounts** with isolated data per user:

1. **Admin** creates accounts in the Supabase Authentication dashboard
2. Share credentials with each team member
3. Each user logs in with their own account
4. Data is **100% isolated** — user A can never see user B's records
5. Distribute the `.exe` installer to team members via the GitHub Releases page

---

<div align="center">

*Built with 🥃 and a healthy respect for the craft.*

</div>
