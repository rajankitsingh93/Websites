# Ankit's Website

A public home for your web projects, with a private owner sign-in to add, edit, or remove links. Project data is shared through Supabase, so a change made from the admin panel appears for every visitor.

## Set up your owner-only project manager

1. Create a project at [supabase.com](https://supabase.com/).
2. In the Supabase SQL Editor, run the contents of [`schema.sql`](./schema.sql).
3. In Supabase **Authentication → Providers**, keep Email enabled. In **Authentication → Settings**, disable new user sign-ups so only the account you create can sign in.
4. Create your owner account under **Authentication → Users → Add user**. Copy its user UUID.
5. In the SQL Editor, run `insert into public.project_shelf_admins (user_id) values ('YOUR-AUTH-USER-UUID');`, replacing the placeholder with that UUID.
6. In **Project Settings → API**, copy the Project URL and the **anon/public** key. In the GitHub repository, open **Settings → Secrets and variables → Actions → Variables** and add:

   - `SUPABASE_URL` — the Project URL.
   - `SUPABASE_ANON_KEY` — the anon/public key.

   The anon key is meant to be public; the database policies restrict project changes to your admin account. **Never** use or publish a `service_role` key.

## Publish on GitHub Pages

1. In the GitHub repository, open **Settings → Pages** and select **GitHub Actions** as the build and deployment source. This one-time setting is required before the workflow can deploy.
2. Push to `main` (or re-run **Deploy website to GitHub Pages** from the **Actions** tab). If an earlier run failed before you selected GitHub Actions, it will not restart automatically; this new push starts a fresh deployment. The workflow publishes the site at `https://rajankitsingh93.github.io/Websites/` and reads the Supabase values from the repository Actions variables above.
3. In Supabase **Authentication → URL Configuration**, set the site URL to `https://rajankitsingh93.github.io/Websites/` and add that same URL to the allowed redirect URLs.
4. Visit the public URL. Anyone can browse projects; only your signed-in admin account can add, edit, or remove them using **Manage projects**.

For a local preview, open a terminal in this folder and run `python -m http.server 8000`, then visit `http://localhost:8000`. To use the manager locally, put the Supabase URL and anon key in `config.js`; leave those values out of commits if you prefer to keep the repository config empty.

If you change the public URL or Supabase project, update the matching GitHub Actions variables and Supabase URL configuration. Project links must use `http://` or `https://`.
