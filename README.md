# Manju Group Website

This is the codebase for the Manju Group Website.

## Admin Dashboard Access

The Admin panel at `/admin` requires signing in with the same account used for `/account`
(Supabase auth). Every account that successfully signs in is granted the `admin` role and
can access admin-only data and actions, including all customer orders and contact details —
there is currently no restriction to a specific set of staff accounts.
