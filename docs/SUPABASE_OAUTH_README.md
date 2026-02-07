# Currently OAUTH is disabled

# Supabase Google OAuth Flow in Collaboration-App

This document explains the Google OAuth authentication flow in the collaboration-app using Supabase, based on our integration and configuration.

---

## Setup

- Supabase project is configured with:
  - **Google OAuth enabled** in Supabase dashboard
  - **Google OAuth client ID and secret** added in Supabase dashboard (from Google Cloud Console)
  - **Publishable key** used in frontend
  - **Redirect URLs**: All URLs where users can be sent after login (e.g., https://your-app.com, https://your-app.com/dashboard) are whitelisted in Supabase → Authentication → Settings → Redirect URLs

## Flow

1. **User Initiates Login**
   - User clicks “Sign in with Google” in the app UI.

2. **Frontend Calls Supabase**
   - The app uses Supabase client’s `signInWithOAuth({ provider: 'google' })` method.
   - Supabase generates an OAuth request and redirects the browser to Google’s OAuth endpoint.

3. **Google Handles Authentication**
   - User logs in and consents to permissions.
   - Google redirects the browser to Supabase’s callback URL:  
     `https://xxx.supabase.co/auth/v1/callback`
   - The redirect includes an authorization code.

4. **Supabase Processes Callback**
   - Supabase exchanges the code for tokens with Google using the client ID and secret you configured.
   - Supabase creates a session for the user.

5. **Supabase Redirects Back to App**
   - Supabase redirects the browser to one of your app’s whitelisted Redirect URLs.
   - The redirect includes session info (access token, user details).

6. **App Receives Session**
   - The app reads the session from Supabase client.
   - User is now authenticated and can access protected resources.

## Who Calls What

- **App → Supabase**: Initiates OAuth flow.
- **Supabase → Google**: Handles OAuth request using client ID/secret.
- **Google → Supabase**: Redirects with auth code.
- **Supabase → App**: Redirects with session.

## Redirects

- Browser is redirected:
  - From app → Supabase → Google → Supabase callback → App

## Security

- Only whitelisted Redirect URLs are allowed in Supabase dashboard.
- Google OAuth client ID and secret are securely stored in Supabase.
- Tokens are managed by Supabase; app uses session info for authenticated requests.

---

**Note:**
- If you don’t see “Site URL” in Supabase dashboard, focus on “Redirect URLs.”
- Always add all URLs where users can be sent after login.
- The Google OAuth client details are added by you in Supabase dashboard, not in the app code.

---

This README summarizes the complete Google OAuth flow and configuration for Supabase in the collaboration-app.