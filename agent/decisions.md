# Decisions

### 2026-10-13 — User authentication model
Decision: Google OAuth for all users, with support for guest users who do not want to create accounts (UUID-based access).
Why (user's words): "Google OAuth for all users with support for some users that don't want to create accounts"
Reversible? Hard (auth boundary + data model + route middleware).

### 2026-10-13 — Audio file retention
Decision: Delete audio files from storage immediately after AI processing.
Why (user's words): "Since we're using the free Supabase tier, we don't have a lot of leeway for storage, so the audio files should be deleted after processing"
Reversible? Hard (storage lifecycle + data retention).

### 2026-10-13 — Logbook export approach
Decision: Client-side generation in the browser.
Why (user's words): "The client-side appraoch"
Reversible? Medium (library dependencies + export architecture).

### 2026-10-13 — Log deletion lifecycle
Decision: Soft delete to a trash state with automatic permanent deletion after 7 days.
Why (user's words): "Can we implement something like a trash concept with a final delete timer, maybe 7 days"
Reversible? Hard (schema modification + query filtering + deletion lifecycle).

### 2026-10-13 — Delete UI feedback
Decision: Show a temporary "Moved to Trash" label/toast when an entry is deleted.
Why (user's words): "A temporary \"Moved to Trash\" label"
Reversible? Easy (frontend UI state).

### 2026-10-13 — Guest to Google account linking
Decision: Merge previous guest data (logs, vocabulary, preferences) into the Google account when a guest user signs in with Google OAuth.
Why (user's words): "If the student ends up using the Google OAuth, their previous guest data should be merged with their new account data"
Reversible? Hard (user identity linking + database foreign key updates).

### 2026-10-13 — Writing style & Export tone (Natural & largely informal)
Decision: The logbook tone and export layout must be practical and largely informal, reflecting how students naturally write in their physical logbooks (a realistic mix of casual and work-practical phrasing, avoiding stiff bureaucratic formality).
Why (user's words): "The PDF layout doesn't need to necessarily official or formal. The actual words that will be written down in the logbook later on are a mix of formal and informal grammar, but largely informal. Make sure this echoes across the scope of the project"
Reversible? Medium (system prompt tuning + export layout design).

### 2026-10-13 — Hosting & Deployment Platform
Decision: Vercel for Next.js frontend, Render for FastAPI backend, and Supabase for database & auth.
Why (user's words): "Frontend - Vercel, Backend - Render"
Reversible? Hard (hosting provider + deployment configuration + environment secrets).
