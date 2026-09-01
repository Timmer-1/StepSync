# StepSync

A fitness tracking app for people who lose momentum training alone. Set goals, log sessions against them, and follow other users so progress is visible instead of private.

**Live:** [stepsync-sigma.vercel.app](https://stepsync-sigma.vercel.app)

<!-- Add a screenshot or short GIF of the dashboard here. It does more for a first-time visitor than anything below. -->

## What it does

- **Goal setting.** Define a target, then track sessions against it rather than logging workouts into a void.
- **Session logging.** Record workouts with the details that matter for the goal you set.
- **Dashboard.** Goal progress and workout analytics in one view.
- **Calendar.** Sessions laid out by date so gaps are obvious.
- **Social layer.** Follow other users and see their progress.

## Stack

TypeScript, Next.js, React, Tailwind CSS, Supabase (Postgres + Auth), deployed on Vercel.

## Data model

Four core tables, normalized rather than denormalized into a single log:

| Table | Holds |
| --- | --- |
| `users` | Profile and auth identity |
| `workouts` | Canonical exercise definitions |
| `sessions` | A logged instance of a workout by a user, with date and metrics |
| `goals` | A user's target, joined against sessions to compute progress |
| `follows` | Directed user-to-user relationships for the social feed |

Dashboard and calendar views resolve from relational queries across these tables instead of separate fetches per widget.

## Running locally

```bash
git clone https://github.com/TimTans/StepSync.git
cd StepSync
npm install
```

Create `.env.local` in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Both come from your Supabase project under Settings, API.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Status

Built May 2025. Not actively maintained.
