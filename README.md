# Weekly Chronicle

Weekly Chronicle is a digital editorial workspace designed to collect, organize, and publish weekly updates from team members into beautifully formatted, readable newsletters.

## Features Let's Create!

- **Google SSO**: Secure single sign-on authentication powered by Google and Supabase.
- **Role-Based Access**: Distinct flows for standard members and administrators.
- **Member Update Flow**:
  - Simple form submission for weekly progress.
  - Optional image uploads (stored securely via Supabase Storage).
  - Built-in "Impact Score" self-assessment.
- **Admin Dashboard**:
  - Drag-and-drop UI to sort and arrange approved weekly updates.
  - Approve, reject, or edit pending updates.
- **Newsletter Publishing**:
  - Clean newsletter reading experience with interactive UI elements.
  - Export capabilities: Share via integrated email notifications (`nodemailer`).
  - Render full updates into a single downloadable high-quality image (`html-to-image`).
- **Archive Explorer**:
  - Browse past published newsletters.
  - Filter content by People, Month, and Year.

## Tech Stack

- **Framework**: Next.js 15 (App Router, React 19)
- **Database / Auth / Storage**: Supabase
- **Styling**: Tailwind CSS v4
- **Drag & Drop**: @dnd-kit
- **Email Delivery**: Nodemailer
- **Image Generation**: html-to-image

---

## 🚀 Getting Started

### 1. Prerequisites

Make sure you have Node installed (version 20+ recommended).
Ensure you have a Supabase project created for your Database and Auth needs.

### 2. Environment Variables

Create a `.env.local` file in the root of your project and populate it with the following:

```env
# App URL (Local or Production)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase Keys
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Email Sending Credentials
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-email-app-password
```

### 3. Run the Development Server

Install standard dependencies:
```bash
npm install
```

Start the local server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 4. Build for Production

To create an optimized production build:
```bash
npm run build
npm run start
```
