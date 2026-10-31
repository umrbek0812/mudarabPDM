/**
 * Prepares the project for:
 *  1) 1-Click Offline HTML opening (double-clicking OCHISH_1_CLICK.html or public/index.html without Node.js)
 *  2) 1-Click GitHub Pages Online Deployment
 */
const fs = require('fs');
const path = require('path');

const pubEngineDir = path.join(__dirname, 'public', 'engine');
fs.mkdirSync(pubEngineDir, { recursive: true });
fs.copyFileSync(path.join(__dirname, 'src', 'engine', 'scenarios.js'), path.join(pubEngineDir, 'scenarios.js'));
fs.copyFileSync(path.join(__dirname, 'src', 'engine', 'pdmEngine.js'), path.join(pubEngineDir, 'pdmEngine.js'));

const htmlFiles = fs.readdirSync(path.join(__dirname, 'public')).filter(f => f.endsWith('.html'));
htmlFiles.forEach(f => {
  const filePath = path.join(__dirname, 'public', f);
  let content = fs.readFileSync(filePath, 'utf8');
  content = content
    .replace(/href="\/css\//g, 'href="./css/')
    .replace(/src="\/engine\//g, 'src="./engine/')
    .replace(/src="\/js\//g, 'src="./js/')
    .replace(/href="\/(dashboard|financing|pools|treasury|waterfall|waterflow|scenarios)\.html"/g, 'href="./$1.html"');
  fs.writeFileSync(filePath, content, 'utf8');
});

const appStatePath = path.join(__dirname, 'public', 'js', 'appState.js');
let appJs = fs.readFileSync(appStatePath, 'utf8');
appJs = appJs.replace(/href:\s*'\/(dashboard|financing|pools|treasury|waterfall|waterflow|scenarios)\.html'/g, "href: './$1.html'");
fs.writeFileSync(appStatePath, appJs, 'utf8');

// Copy dashboard.html to public/index.html for GitHub Pages root
fs.copyFileSync(path.join(__dirname, 'public', 'dashboard.html'), path.join(__dirname, 'public', 'index.html'));

// Create 1-Click Launcher HTML in the root directory
const rootLauncherHtml = `<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="refresh" content="0; url=./public/dashboard.html" />
  <title>Al-Mizan Islom Banki — Mudaraba PDM Simulyatori (1-Click Launcher)</title>
  <script>
    window.location.replace("./public/dashboard.html");
  </script>
</head>
<body style="font-family: sans-serif; padding: 2rem; text-align: center;">
  <h2>Al-Mizan Islom Banki — Mudaraba PDM Simulyatori ochilmoqda...</h2>
  <p>Agar avtomatik ochilmasa, quyidagi tugmani bosing:</p>
  <p><a href="./public/dashboard.html" style="display:inline-block; padding:12px 24px; background:#059669; color:#fff; text-decoration:none; border-radius:8px; font-weight:bold;">▶ Ilovani Ochish (Dashboard)</a></p>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, 'index.html'), rootLauncherHtml, 'utf8');
fs.writeFileSync(path.join(__dirname, 'OCHISH_1_CLICK.html'), rootLauncherHtml, 'utf8');

console.log('Static 1-click files (index.html, OCHISH_1_CLICK.html, public/index.html, public/engine/*) generated successfully!');
