# Manju Group Website

This is the codebase for the Manju Group Website.

## Admin Dashboard Access

The Admin panel at `/admin` is gated by a shared passcode (see the `ADMIN_PASSCODE`
environment variable — set it in `.env` for local development and in your deployment
platform's environment variables for production; it is never committed to the repo).
Entering the correct passcode issues a short-lived signed token that authorizes all
`admin.*` API calls; there is no per-account login required for admin access.
