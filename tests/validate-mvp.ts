/**
 * ARIA Platform MVP Validation Test
 * Runs comprehensive end-to-end tests against the running Next.js instance.
 * Note: Assumes server is running at http://localhost:3000
 */

const BASE_URL = 'http://localhost:3000';
let passCount = 0;
let failCount = 0;

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(`✅ PASS: ${name}`);
    passCount++;
  } catch (err: any) {
    console.log(`❌ FAIL: ${name}`);
    console.error(`   ${err.message}`);
    failCount++;
  }
}

async function runTests() {
  console.log(`Starting Validation Tests against ${BASE_URL}...\n`);

  // 1. Health check
  await test('Health check endpoint', async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    if (res.status !== 200 && res.status !== 503) {
      throw new Error(`Unexpected status ${res.status}`);
    }
  });

  // 2. Rate limiting for OTP
  await test('Rate limiting OTP send', async () => {
    const email = `test-rl-${Date.now()}@example.com`;
    // Send 3 times (success)
    for (let i = 0; i < 3; i++) {
      const res = await fetch(`${BASE_URL}/api/auth/email-otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error(`Send ${i + 1} failed: ${res.status}`);
    }
    // 4th time should fail with 429
    const res4 = await fetch(`${BASE_URL}/api/auth/email-otp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (res4.status !== 429) throw new Error(`Expected 429 Rate Limited, got ${res4.status}`);
  });

  // 3. CSRF protection (Simulating malicious mutating request)
  await test('CSRF rejection for bad origin', async () => {
    const res = await fetch(`${BASE_URL}/api/proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://malicious-site.com',
        'Host': 'localhost:3000',
      },
      body: JSON.stringify({ tooName: 'openai', endpoint: 'x' }),
    });
    // The middleware CSRF protection should block this with 403
    if (res.status !== 403) throw new Error(`Expected 403, got ${res.status}`);
  });

  // 4. Missing Cookies -> 401 on protected route
  await test('Unauthenticated API request', async () => {
    const res = await fetch(`${BASE_URL}/api/logs`);
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });

  // 5. Auth / JWT Session validation 
  // Normally requires interactive DB mocking, but we verify rejection first
  
  // 6. Google / GitHub redirect formats
  await test('OAuth Redirect Formats', async () => {
    const resGoogle = await fetch(`${BASE_URL}/api/auth/google`, { redirect: 'manual' });
    const resGithub = await fetch(`${BASE_URL}/api/auth/github`, { redirect: 'manual' });
    
    if (resGoogle.status !== 302 && resGoogle.status !== 400) {
       throw new Error(`Google OAuth bad response: ${resGoogle.status}`);
    }
    if (resGithub.status !== 302 && resGithub.status !== 400) {
       throw new Error(`GitHub OAuth bad response: ${resGithub.status}`);
    }
  });

  console.log(`\nTests Completed`);
  console.log(`Pass: ${passCount}`);
  console.log(`Fail: ${failCount}`);

  if (failCount > 0) process.exit(1);
}

runTests().catch(console.error);
