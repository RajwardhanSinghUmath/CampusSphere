# 🎓 CampusSphere

> The modern, full-stack campus super-app connecting students, clubs, and administrators.

Built as part of Software Engineering Laboratory (NIT).

---

## 🌟 Highlights & Features

- **Authentication & Roles**: Secure student and admin authentication with JWT tokens & Supabase Auth.
- **Events Hub**: RSVP to campus hackathons, workshops, and fests with attendee limits and roster management.
- **Student Clubs**: Explore campus organizations, join communities, and discover club-hosted activities.
- **Campus Announcements**: Urgent pinned alerts and notifications broadcasted directly to students.
- **Lost & Found Tracker**: Searchable registry for lost and found items with status tracking.
- **Academic Resources**: Community-shared repository for notes, lecture links, PDFs, and study materials categorized by subject.
- **Responsive Modern UI**: Built with Tailwind CSS, custom responsive sidebar navigation, mobile drawer, and Lucide icons.

---

## 🛠️ Tech Stack (100% Free Tier Deployment)

- **Frontend**: [React 18](https://react.dev/), [Vite](https://vitejs.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/)
  - Deploys for free on **[Vercel](https://vercel.com/)**
- **Backend**: [FastAPI](https://fastapi.tiangolo.com/), [Pydantic v2](https://docs.pydantic.dev/), [Uvicorn](https://www.uvicorn.org/)
  - Deploys for free on **[Render](https://render.com/)**
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL + Row-Level Security)
  - 500MB free database + generous free auth tier

---

## 📁 Repository Structure

```
SELab/
├── campussphere-backend/       # FastAPI REST API
│   ├── app/
│   │   ├── main.py             # App entry, CORS, routers inclusion
│   │   ├── config.py           # Settings from environment variables
│   │   ├── database.py         # Lazy Supabase client connections
│   │   ├── schemas/            # Pydantic v2 data models
│   │   │   ├── auth.py
│   │   │   ├── events.py
│   │   │   ├── clubs.py
│   │   │   ├── announcements.py
│   │   │   ├── lost_found.py
│   │   │   └── resources.py
│   │   └── routers/            # 6 complete API routers
│   ├── requirements.txt        # Backend dependencies
│   ├── render.yaml             # Render infrastructure-as-code
│   └── supabase_schema.sql     # Database tables, RLS policies, indexes
│
├── campussphere-frontend/      # React + Vite application
│   ├── src/
│   │   ├── components/         # Layout, UI components (Card, Button, Badge, etc.)
│   │   ├── contexts/           # AuthContext (login, register, token handling)
│   │   ├── lib/                # Axios API instance, Supabase client, utils
│   │   ├── pages/              # 17 interactive pages
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── EventsPage.tsx / EventDetailPage.tsx / CreateEventPage.tsx
│   │   │   ├── ClubsPage.tsx / ClubDetailPage.tsx / CreateClubPage.tsx
│   │   │   ├── AnnouncementsPage.tsx / AnnouncementDetailPage.tsx / CreateAnnouncementPage.tsx
│   │   │   ├── LostFoundPage.tsx / LostFoundDetailPage.tsx / CreateLostFoundPage.tsx
│   │   │   ├── ResourcesPage.tsx / CreateResourcePage.tsx
│   │   │   └── LoginPage.tsx / RegisterPage.tsx
│   │   ├── types/              # TypeScript interface declarations
│   │   └── App.tsx             # Protected routes & app router
│   ├── package.json
│   ├── vercel.json             # Vercel SPA routing rewrites
│   └── tailwind.config.js
│
├── SETUP_GUIDE.md              # Complete step-by-step setup and deployment guide
└── project-plan.md             # Project architecture & schema documentation
```

---

## ⚡ Quick Start

For detailed step-by-step instructions, see **[SETUP_GUIDE.md](./SETUP_GUIDE.md)**.

### Run Backend
```bash
cd campussphere-backend
pip install -r requirements.txt
cp .env.example .env     # Add your Supabase credentials
uvicorn app.main:app --reload --port 8000
```

### Run Frontend
```bash
cd campussphere-frontend
npm install
cp .env.example .env     # Add your Supabase & API URL
npm run dev
```
Open [http://localhost:5173](http://localhost:5173).
