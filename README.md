# [Curriculum Vitae](https://smaliziola.github.io/cv/)

Static CV generated from the files in `src/data/` and the templates in `src/templates/`.
Each build produces an HTML page and a PDF version in `dist/`.

## Usage

```shell
npm ci                # install dependencies
npm run build         # generate dist/ (HTML + PDF)
npm start             # build, watch `src/` and serve dist/ with live reload
npm run lint          # ESLint
npm run format        # Prettier (js, json, css); `format:check` only verifies
npm run check-links   # verify that external links are still reachable
```

## Project structure

```
src/
  data/                 CV content
    profile.json          name, title, about, contact links, skills
    experience.json       professional experience (metadata, logos, skills)
    experience/<id>.md    description of each experience, in Markdown
    education.json        education
    courses.json          courses and certifications
    languages.json        spoken languages
    index.js              loads and validates the data (build fails on missing fields/logos)
  templates/
    index.html            page layout
    partials/             one partial per section (+ shared `section` and `timeline-item`)
  assets/                 styles, script, images and logos (copied to dist/)
  utils/                  PDF generation and Markdown helper
scripts/
  check-links.js          external link checker
```

Bootstrap, Font Awesome and Montserrat are installed from npm and copied to
`dist/vendor/` at build time, so the site does not depend on any CDN.

## Deployment

Every push to `main` triggers `.github/workflows/gh-pages.yml`, which lints, builds the
site and publishes `dist/` to the `gh-pages` branch.
