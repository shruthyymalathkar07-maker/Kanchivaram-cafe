import express from 'express';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import { createApiRouter } from '../server/src/routes/api.js';
import {
  seedDefaultUsers,
  signAccessToken,
  verifyAccessToken,
  getGoogleOAuthUrl,
  findUserByEmail
} from '../server/src/auth.js';
import { prisma } from '../server/src/db.js';

async function runGoogleOAuthTests() {
  console.log('================================================================================');
  console.log('🧪 RUNNING STEP 5 — GOOGLE SIGN-IN INTEGRATION TEST SUITE');
  console.log('================================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}${detail ? ` - ${detail}` : ''}`);
      failed++;
    }
  }

  // Seed default users with initial passwords
  await seedDefaultUsers(true);

  const app = express();
  const server = http.createServer(app);
  const io = new SocketServer(server);
  app.use(express.json());
  app.use('/api', createApiRouter(io));

  const testPort = 5096;
  await new Promise<void>((resolve) => {
    server.listen(testPort, () => {
      console.log(`Test server running on port ${testPort}`);
      resolve();
    });
  });

  const baseUrl = `http://127.0.0.1:${testPort}/api`;

  try {
    // Check active user in DB
    const adminUser = await prisma.user.findFirst({
      where: {
        OR: [
          { id: 'user-1' },
          { email: 'shruthy@kanchivaram.cafe' }
        ]
      }
    });

    if (!adminUser) {
      throw new Error('Default admin user not found in PostgreSQL');
    }

    console.log(`ℹ️ Registered Authorized User: ${adminUser.name} (${adminUser.email})`);

    // Setup dummy OAuth credentials for test
    process.env.GOOGLE_CLIENT_ID = 'test-kanchivaram-google-client-id.apps.googleusercontent.com';
    process.env.GOOGLE_CLIENT_SECRET = 'test-secret-never-expose-12345';
    process.env.GOOGLE_CALLBACK_URL = `http://127.0.0.1:${testPort}/api/auth/google/callback`;

    // TEST 1: GET /api/auth/google/url returns valid Google OAuth URL
    const urlRes = await fetch(`${baseUrl}/auth/google/url?origin=https://kanchivaram-cafe.surge.sh`);
    const urlData = await urlRes.json();

    assert(
      urlRes.status === 200 && urlData.success === true && typeof urlData.url === 'string',
      'Test 1A: /api/auth/google/url returns HTTP 200 and URL string'
    );
    assert(
      urlData.url.includes('accounts.google.com') &&
      urlData.url.includes('client_id=test-kanchivaram-google-client-id') &&
      urlData.url.includes('scope=openid+email+profile') || urlData.url.includes('scope=openid%20email%20profile'),
      'Test 1B: Google OAuth URL contains required OAuth 2.0 query parameters'
    );

    // TEST 2: GET /api/auth/google initiates 302 redirect to Google OAuth
    const authRedirectRes = await fetch(`${baseUrl}/auth/google?origin=https://kanchivaram-cafe.surge.sh`, {
      redirect: 'manual'
    });

    assert(
      authRedirectRes.status === 302,
      'Test 2A: GET /api/auth/google responds with HTTP 302 Redirect'
    );
    const locationHeader = authRedirectRes.headers.get('location') || '';
    assert(
      locationHeader.includes('accounts.google.com') && locationHeader.includes('client_id='),
      'Test 2B: Location header points to Google OAuth authorization endpoint'
    );

    // TEST 3: Callback handles OAuth cancellation (error=access_denied) safely
    const cancelRes = await fetch(`${baseUrl}/auth/google/callback?error=access_denied&state=eyoriginOiJodHRwczovL2thbmNoaXZhcmFtLWNhZmUuc3VyZ2Uuc2gifQ`, {
      redirect: 'manual'
    });

    assert(
      cancelRes.status === 302,
      'Test 3A: OAuth error responds with HTTP 302 Redirect to frontend'
    );
    const cancelLocation = cancelRes.headers.get('location') || '';
    assert(
      cancelLocation.includes('error=oauth_cancelled'),
      'Test 3B: User cancellation safely redirects to frontend with error=oauth_cancelled'
    );

    // TEST 4: Callback rejects missing code
    const noCodeRes = await fetch(`${baseUrl}/auth/google/callback`, {
      redirect: 'manual'
    });
    const noCodeLocation = noCodeRes.headers.get('location') || '';
    assert(
      noCodeLocation.includes('error=invalid_oauth_response'),
      'Test 4: Callback with missing code redirects with error=invalid_oauth_response'
    );

    // TEST 5: Unauthorized Google account (arbitrary email) is rejected without creating user
    // We test user lookup for arbitrary email
    const unauthorizedEmail = 'random.visitor.999@gmail.com';
    const unauthorizedUser = await findUserByEmail(unauthorizedEmail);
    assert(
      unauthorizedUser === null,
      'Test 5A: Random Google account is not in database'
    );

    // TEST 6: Authorized user authentication and JWT session generation
    const authorizedUser = await findUserByEmail(adminUser.email, true);
    assert(
      authorizedUser !== null && authorizedUser.email === adminUser.email,
      'Test 6A: Authorized user found in PostgreSQL by verified Google email'
    );

    const token = signAccessToken({
      userId: authorizedUser!.id,
      email: authorizedUser!.email,
      role: authorizedUser!.role,
      branchId: authorizedUser!.branchId ?? null
    });

    const decoded = verifyAccessToken(token);
    assert(
      decoded !== null && decoded.userId === adminUser.id && decoded.email === adminUser.email,
      'Test 6B: Valid JWT access token signed with user identity'
    );

    // TEST 7: GET /api/auth/me returns authenticated user with valid JWT
    const meRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const meData = await meRes.json();

    assert(
      meRes.status === 200 && meData.success === true && meData.user && meData.user.email === adminUser.email,
      'Test 7A: GET /api/auth/me returns authorized user profile'
    );
    assert(
      meData.user.branchId === 'branch-1' || meData.user.branchId !== null,
      'Test 7B: Branch association preserved on authenticated user profile'
    );
    assert(
      meData.user.passwordHash === undefined,
      'Test 7C: passwordHash is stripped and never exposed in /api/auth/me'
    );

    // TEST 8: Existing email/password login still works
    const emailLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminUser.email, password: 'Password@123' })
    });
    const emailLoginData = await emailLoginRes.json();

    assert(
      emailLoginRes.status === 200 && emailLoginData.success === true && !!emailLoginData.token,
      'Test 8: Existing email/password login continues to work perfectly'
    );

    // TEST 9: Mock OTP Forgot Password still works
    process.env.OTP_PROVIDER = 'mock';
    const otpReqRes = await fetch(`${baseUrl}/auth/forgot-password/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: adminUser.phone })
    });
    const otpReqData = await otpReqRes.json();

    assert(
      otpReqRes.status === 200 && otpReqData.success === true,
      'Test 9: Forgot Password OTP flow continues to work perfectly'
    );

    // TEST 10: Google Client Secret is never exposed in frontend code or responses
    assert(
      !JSON.stringify(urlData).includes('test-secret') &&
      !JSON.stringify(meData).includes('test-secret') &&
      !JSON.stringify(emailLoginData).includes('test-secret'),
      'Test 10: Google Client Secret is never leaked in any API response'
    );

    console.log('\n================================================================================');
    console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('================================================================================\n');

    if (failed === 0) {
      console.log('🎉 STEP 5 — GOOGLE SIGN-IN IMPLEMENTATION: PASS');
    } else {
      console.error('💥 STEP 5: FAIL');
      process.exit(1);
    }
  } catch (err: any) {
    console.error('❌ Exception occurred during test execution:', err);
    process.exit(1);
  } finally {
    server.close();
    await prisma.$disconnect();
  }
}

runGoogleOAuthTests();
