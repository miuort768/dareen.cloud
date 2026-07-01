const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const FILES = [
  'design-system-light.png',
  'design-system-dark.png',
  'landing-light.png',
  'landing-dark.png',
  'login-light.png',
  'login-dark.png',
];

const DIR = path.join(__dirname, 'screenshots');

function uploadToFileIo(filePath) {
  return new Promise((resolve, reject) => {
    const boundary = `----${Date.now()}`;
    const imgData = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);

    const head = Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${fileName}"\r\nContent-Type: application/octet-stream\r\n\r\n`,
      'utf-8'
    );
    const tail = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf-8');
    const body = Buffer.concat([head, imgData, tail]);

    const options = {
      hostname: 'file.io',
      path: '/',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.success) {
            resolve(json.link);
          } else {
            reject(new Error(JSON.stringify(json)));
          }
        } catch (e) {
          reject(new Error(`Parse error (${res.statusCode}): ${data.substring(0, 200)}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function uploadToOxi(filePath) {
  const fileName = path.basename(filePath);
  const imgData = fs.readFileSync(filePath);
  const boundary = `----${Date.now()}`;

  const head = Buffer.from(
    `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${fileName}"\r\nContent-Type: application/octet-stream\r\n\r\n`,
    'utf-8'
  );
  const tail = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf-8');
  const body = Buffer.concat([head, imgData, tail]);

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: '0x0.st',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length,
      },
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data.trim()));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

(async () => {
  console.log('Uploading via 0x0.st...\n');
  for (const file of FILES) {
    const filePath = path.join(DIR, file);
    try {
      const url = await uploadToOxi(filePath);
      console.log(`${file}: ${url}`);
    } catch (e) {
      console.error(`${file}: FAILED - ${e.message}`);
    }
  }
})();
