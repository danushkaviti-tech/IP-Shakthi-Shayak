const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const zipPath = path.join(__dirname, '..', 'public', 'downloads', 'IP-SAKTI-Windows-App.zip');
const downloadsDir = path.join(__dirname, '..', 'public', 'downloads');

if (fs.existsSync(zipPath)) {
  fs.unlinkSync(zipPath);
}

const output = fs.createWriteStream(zipPath);
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', function() {
  console.log(`ZIP created successfully: ${archive.pointer()} total bytes`);
});

archive.on('error', function(err) {
  throw err;
});

archive.pipe(output);

archive.file(path.join(downloadsDir, 'Launch-IP-SAKTI.bat'), { name: 'Launch-IP-SAKTI.bat' });
archive.file(path.join(downloadsDir, 'Install-Desktop-Shortcut.vbs'), { name: 'Install-Desktop-Shortcut.vbs' });
archive.file(path.join(downloadsDir, 'app.ico'), { name: 'app.ico' });
archive.file(path.join(downloadsDir, 'README.txt'), { name: 'README.txt' });

archive.finalize();
