# [Curriculum Vitae](https://smaliziola.github.io/cv/)

Static CV generated from `src/metadata/metadata.js` and `src/templates/index.html`.
Each build produces an HTML page and a PDF version in `dist/`.

## Usage

```shell
npm ci            # install dependencies
npm run build     # generate dist/ (HTML + PDF)
npm start         # build, watch `src/` and serve dist/ with live reload
```

## Editing the content

- Text, experiences, education, courses: `src/metadata/metadata.js`
- Layout: `src/templates/index.html`
- Styles and images: `src/assets/`

## Deployment

Every push to `main` triggers `.github/workflows/gh-pages.yml`, which builds the
site and publishes `dist/` to the `gh-pages` branch.
