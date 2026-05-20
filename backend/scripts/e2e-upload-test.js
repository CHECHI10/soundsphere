const fs = require('fs');
const path = require('path');
const fetch = global.fetch || require('node-fetch');
const FormData = require('form-data');

const API = 'http://localhost:5000/api';

async function registerArtist() {
  // Try to register; if user exists, fall back to login
  const payload = { username: 'e2e-artist', email: 'e2e-artist@example.com', password: 'password123', role: 'artist' };

  let res = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  let text = await res.text();
  console.log('Register status:', res.status);
  console.log(text);

  if (res.status === 409) {
    // user exists, login
    res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: payload.email, password: payload.password }),
    });

    text = await res.text();
    console.log('Login status:', res.status);
    console.log(text);
  }

  // Node global fetch exposes Headers.get; attempt to read set-cookie(s)
  const setCookieHeader = res.headers.get('set-cookie');
  let cookieHeader = '';

  if (setCookieHeader) {
    cookieHeader = setCookieHeader.split(',').map((c) => c.split(';')[0]).join('; ');
  }

  return cookieHeader;
}

async function uploadSample(cookie) {
  const samplePath = path.join(__dirname, 'sample.mp3');
  fs.writeFileSync(samplePath, 'dummy audio content');

  const form = new FormData();
  form.append('title', 'E2E Test Track');
  form.append('duration', '5');
  form.append('music', fs.createReadStream(samplePath));

  const res = await fetch(`${API}/music/upload`, {
    method: 'POST',
    body: form,
    headers: { Cookie: cookie, ...form.getHeaders() },
  });

  const text = await res.text();
  console.log('Upload status:', res.status);
  console.log(text);
}

async function run() {
  try {
    const cookie = await registerArtist();
    if (!cookie) {
      console.error('No cookie set from register; aborting');
      return;
    }

    await uploadSample(cookie);
  } catch (err) {
    console.error('E2E failed', err);
  }
}

run();
