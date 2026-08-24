# Manju Group Website

This is the codebase for the Manju Group Website.

## Admin Dashboard Access

The Admin panel at `/admin` requires signing in with the same account used for `/account`
(Supabase auth). Only the account whose email matches the `OWNER_EMAIL` environment variable
is granted the `admin` role and can access admin-only data and actions.
