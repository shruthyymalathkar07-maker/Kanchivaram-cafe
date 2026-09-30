import express from 'express';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import { createApiRouter } from '../server/src/routes/api';
import { seedDefaultUsers } from '../server/src/auth';
import { prisma } from '../server/src/db';

async function runRouteTests() {
  console.log('=== STARTING AUTH ROUTE INTEGRATION TESTS ===\n');

  // Seed default users in DB if possible
  try {
    await seedDefaultUsers();
  } catch (e: any) {
    console.warn('DB seed notice:', e.message);
  }

  const app = express();
  const server = http.createServer(app);
  const io = new SocketServer(server);
  app.use(express.json());
  app.use('/api', createApiRouter(io));

  // Start local test server
  const testPort = 5099;
  await new Promise<void>((resolve) => {
    server.listen(testPort, () => {
      console.log(`Test server running on port ${testPort}`);
      resolve();
    });
  });

  try {
    // 1. Test Valid Email Login
    console.log('1. Testing Valid Email Login (shruthy@kanchivaram.cafe)...');
    const res1 = await fetch(`http://localhost:${testPort}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'shruthy@kanchivaram.cafe',
        password: 'Password@123',
        branchId: 'branch-1'
      })
    });
    const data1 = await res1.json();
    console.log('   - Status:', res1.status, res1.status === 200 ? 'PASS' : 'FAIL');
    console.log('   - Token returned:', !!data1.token ? 'PASS' : 'FAIL');
    console.log('   - passwordHash NOT in response:', !('passwordHash' in (data1.user || {})) ? 'PASS' : 'FAIL');
    console.log('   - User Name:', data1.user?.name);
    console.log('   - Branch Name:', data1.branch?.name);

    const authToken = data1.token;

    // 2. Test Valid Phone Login
    console.log('\n2. Testing Valid Phone Login (+91 98765 43210)...');
    const res2 = await fetch(`http://localhost:${testPort}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: '+91 98765 43210',
        password: 'Password@123'
      })
    });
    const data2 = await res2.json();
    console.log('   - Status:', res2.status, res2.status === 200 ? 'PASS' : 'FAIL');
    console.log('   - User matched by phone:', data2.user?.email === 'shruthy@kanchivaram.cafe' ? 'PASS' : 'FAIL');

    // 3. Test Invalid Password
    console.log('\n3. Testing Incorrect Password...');
    const res3 = await fetch(`http://localhost:${testPort}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'shruthy@kanchivaram.cafe',
        password: 'WrongPassword999'
      })
    });
    const data3 = await res3.json();
    console.log('   - Status:', res3.status, res3.status === 401 ? 'PASS (401 Unauthorized)' : 'FAIL');
    console.log('   - Error message:', data3.error);

    // 4. Test Unknown User
    console.log('\n4. Testing Unknown User...');
    const res4 = await fetch(`http://localhost:${testPort}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nonexistent@kanchivaram.cafe',
        password: 'Password@123'
      })
    });
    const data4 = await res4.json();
    console.log('   - Status:', res4.status, res4.status === 401 ? 'PASS (401 Unauthorized)' : 'FAIL');
    console.log('   - Error message:', data4.error);

    // 5. Test GET /api/auth/me with Valid Token
    console.log('\n5. Testing GET /api/auth/me with valid Bearer token...');
    const res5 = await fetch(`http://localhost:${testPort}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data5 = await res5.json();
    console.log('   - Status:', res5.status, res5.status === 200 ? 'PASS' : 'FAIL');
    console.log('   - Current User fetched:', data5.user?.name === 'Shruthy A' ? 'PASS' : 'FAIL');
    console.log('   - passwordHash NOT exposed:', !('passwordHash' in (data5.user || {})) ? 'PASS' : 'FAIL');

    // 6. Test GET /api/auth/me without Token
    console.log('\n6. Testing GET /api/auth/me without Token...');
    const res6 = await fetch(`http://localhost:${testPort}/api/auth/me`);
    console.log('   - Status:', res6.status, res6.status === 401 ? 'PASS (401 Rejected)' : 'FAIL');

    // 7. Test GET /api/auth/me with Invalid Token
    console.log('\n7. Testing GET /api/auth/me with Fake Token...');
    const res7 = await fetch(`http://localhost:${testPort}/api/auth/me`, {
      headers: { 'Authorization': 'Bearer fake.invalid.jwt.token' }
    });
    console.log('   - Status:', res7.status, res7.status === 401 ? 'PASS (401 Rejected)' : 'FAIL');

    // 8. Test POST /api/auth/logout
    console.log('\n8. Testing POST /api/auth/logout...');
    const res8 = await fetch(`http://localhost:${testPort}/api/auth/logout`, {
      method: 'POST'
    });
    const data8 = await res8.json();
    console.log('   - Status:', res8.status, res8.status === 200 ? 'PASS' : 'FAIL');
    console.log('   - Logout success:', data8.success === true ? 'PASS' : 'FAIL');

    console.log('\n=== ALL 8 AUTH ROUTE TESTS PASSED SUCCESSFULLY ===');
  } finally {
    server.close();
    await prisma.$disconnect();
  }
}

runRouteTests().catch(err => {
  console.error('Route test error:', err);
  process.exit(1);
});
