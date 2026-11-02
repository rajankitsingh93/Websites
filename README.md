# Ankit's Website

A public gallery of web projects. Visitors can browse, search, and filter the links; there is no sign-in or project manager.

## Add a project

Ask your coding assistant to add the URL to the `projects` array near the top of [`app.js`](./app.js), with a project name, a short description, and a category. Each project follows this shape:

```js
{
  name: "My project",
  url: "https://example.com/",
  description: "A short introduction to what the project does.",
  category: "Web app"
}
```

Commit and push the change to `main`. If GitHub Pages is enabled for this repository with GitHub Actions, the site deploys from the updated code. No database or admin account is needed.

## Preview locally

Open a terminal in this folder and run `python -m http.server 8000`, then visit `http://localhost:8000`.

The Google Search Console verification tag is in the page `<head>` in [`index.html`](./index.html). Verification works once the site is deployed at its public URL.
