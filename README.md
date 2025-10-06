# Popcorn Journal

A low-commitment journaling app where you write just a sentence or two each day. Over time, these small entries add up to a meaningful record of your life.

## Features

- **Daily Entry**: Write 1-3 sentences about your day
- **Feelings**: Track how you felt (Good, Medium, Bad, Uncertain)
- **Tags**: Add tags to spot trends (Work, Friends, Exercise, etc.)
- **Calendar View**: See your entries over time
- **Profile Management**: Update email and password

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **Deployment**: Netlify

## Setup Instructions

### 1. Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In your Supabase dashboard, go to the SQL Editor
3. Copy and paste the contents of `supabase-schema.sql` and run it
4. Go to Settings > API to get your project URL and anon key

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### 5. Deploy to Netlify

1. Push your code to GitHub
2. Connect your GitHub repository to Netlify
3. Set the build command to `npm run build`
4. Set the publish directory to `.next`
5. Add your environment variables in Netlify's environment settings
6. Deploy!

## User Flow

1. **Sign Up/Login**: Create an account or sign in
2. **Onboarding**: Learn about the app and set preferences
3. **Daily Entry**: Write about your day, select feelings, add tags
4. **History**: View past entries in calendar format
5. **Profile**: Update email and password

## Database Schema

- **profiles**: User information and preferences
- **entries**: Daily journal entries with content, feelings, and tags

## Design

The app follows a minimalist design with:
- Clean, mobile-first interface
- Limited color palette (black, gray, white, teal)
- Simple navigation
- Focus on ease of use

## Future Features (Out of Scope)

- Push/email reminders
- Custom user-defined tags
- CSV export
- Multiple entries per day
- Photo uploads
- Trends and analytics