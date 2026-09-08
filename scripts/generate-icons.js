const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputPath = 'C:/Users/Administrator/.gemini/antigravity-ide/brain/a6f57772-096f-49e0-b1a4-a06371f5774a/.user_uploaded/media_1788900144910.jpg';
const publicDir = path.join(process.cwd(), 'public');
const iconsDir = path.join(publicDir, 'icons');
const downloadsDir = path.join(publicDir, 'downloads');

if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });
if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir, { recursive: true });

async function buildIcons() {
  console.log('Building all icon resolutions...');
  const sizes = [48, 72, 96, 128, 144, 152, 192, 256, 384, 512, 1024];
  for (const s of sizes) {
    await sharp(inputPath).resize(s, s).png().toFile(path.join(iconsDir, `icon-${s}.png`));
  }
  
  await sharp(inputPath).resize(512, 512).png().toFile(path.join(iconsDir, 'icon.png'));
  await sharp(inputPath).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));
  await sharp(inputPath).resize(512, 512).png().toFile(path.join(publicDir, 'logo.png'));
  await sharp(inputPath).resize(32, 32).png().toFile(path.join(publicDir, 'favicon-32x32.png'));
  await sharp(inputPath).resize(16, 16).png().toFile(path.join(publicDir, 'favicon-16x16.png'));
  await sharp(inputPath).resize(64, 64).png().toFile(path.join(publicDir, 'favicon.ico'));
  await sharp(inputPath).resize(256, 256).png().toFile(path.join(downloadsDir, 'app.ico'));

  const png512Base64 = (await sharp(inputPath).resize(512, 512).png().toBuffer()).toString('base64');
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <image width="512" height="512" href="data:image/png;base64,${png512Base64}" />
</svg>`;
  fs.writeFileSync(path.join(iconsDir, 'icon.svg'), svgContent, 'utf8');

  console.log('All icons generated successfully!');
}

buildIcons().catch(err => {
  console.error(err);
  process.exit(1);
});
