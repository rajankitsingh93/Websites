# Ankit's Website

A public home for your web projects, with a private owner sign-in to add, edit, or remove links. Project data is shared through Supabase, so a change made from the admin panel appears for every visitor.

## Set up the shared project collection

1. Create a project at [supabase.com](https://supabase.com/).
2. In the Supabase SQL Editor, run the contents of [`schema.sql`](./schema.sql).
3. In Supabase **Authentication → Providers**, keep Email enabled. In **Authentication → Settings**, disable new user sign-ups so only the account you create can sign in.
4. Create your owner account under **Authentication → Users → Add user**. Copy its user UUID.
5. In the SQL Editor, run `insert into public.project_shelf_admins (user_id) values ('YOUR-AUTH-USER-UUID');`, replacing the placeholder with that UUID.
6. In **Project Settings → API**, copy the Project URL and the **anon/public** key. Put them into `config.js`:

   ```js
   window.PROJECT_SHELF_CONFIG = {
     supabaseUrl: "https://your-project.supabase.co",
     supabaseAnonKey: "your-public-anon-key"
   };
   ```

   The anon key is meant to be public; the database policies restrict project changes to the admin account. **Never** put a `service_role` key in the website.

## Run and publish

- For a local preview, open a terminal in this folder and run `python -m http.server 8000`, then visit `http://localhost:8000`. Keep the terminal open while testing.
- Publish this folder as a static site with Netlify, GitHub Pages, or another static host. For Netlify, choose this folder as the site folder and leave the build command empty. Add your `config.js` values before publishing.
- Once deployed, anyone can browse the public URL. Use **Manage projects** and your owner email/password to update the shared collection.

If you change the public URL or Supabase project, verify the site still uses HTTPS and the matching Supabase project URL. Project links must use `http://` or `https://`.
