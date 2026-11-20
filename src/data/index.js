const fs = require('fs-extra');
const path = require('path');

const dataDir = __dirname;
const assetsDir = path.join(__dirname, '..', 'assets');

const readJson = (file) => fs.readJsonSync(path.join(dataDir, file));

function requireFields(kind, item, fields) {
  const missing = fields.filter((field) => !item[field]);
  if (missing.length > 0) {
    const label = item.id || item.company || item.school || item.name || '?';
    throw new Error(`${kind} "${label}" is missing required field(s): ${missing.join(', ')}`);
  }
}

function requireAsset(kind, item) {
  if (!fs.existsSync(path.join(assetsDir, item.logo))) {
    throw new Error(`${kind} "${item.id || item.school}" references a missing logo: ${item.logo}`);
  }
}

function loadExperience() {
  return readJson('experience.json').map((position) => {
    requireFields('Experience', position, ['id', 'company', 'role', 'period', 'logo', 'link']);
    requireAsset('Experience', position);
    const descriptionFile = path.join(dataDir, 'experience', `${position.id}.md`);
    return {
      ...position,
      contents: fs.readFileSync(descriptionFile, 'utf-8'),
    };
  });
}

function loadEducation() {
  return readJson('education.json').map((education) => {
    requireFields('Education', education, ['school', 'degree', 'period', 'logo', 'link']);
    requireAsset('Education', education);
    return education;
  });
}

function loadCourses() {
  return readJson('courses.json').map((course) => {
    requireFields('Course', course, ['name', 'url']);
    return course;
  });
}

const profile = readJson('profile.json');
requireFields('Profile', profile, ['name', 'title']);

module.exports = {
  ...profile,
  positions: loadExperience(),
  educations: loadEducation(),
  courses: loadCourses(),
  languages: readJson('languages.json'),
};
