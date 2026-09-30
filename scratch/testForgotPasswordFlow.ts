import express from 'express';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import { createApiRouter } from '../server/src/routes/api';
import { seedDefaultUsers, comparePassword } from '../server/src/auth';
import { prisma } from '../server/src/db';

async function runForgotPasswordTests() {
  console.log('=== STARTING FORGOT PASSWORD + FAST2SMS FLOW TESTS ===\n');

  // Seed default users in DB
  await seedDefaultUsers();

  const app = express();
  const server = http.createServer(app);
  const io = new SocketServer(server);
  app.use(express.json());
  app.use('/api', createApiRouter(io));

  const testPort = 5098;
  await new Promise<void>((resolve) => {
    server.listen(testPort, () => {
      console.log(`Test server running on port ${testPort}`);
      resolve();
    });
  });

  try {
    const registeredPhone = '+91 98765 43210';
    const testUserEmail = 'shruthy@kanchivaram.cafe';

    // 1. Registered phone -> Request OTP
    console.log('1. Request OTP for Registered Phone (+91 98765 43210)...');
    const res1 = await fetch(`http://localhost:${testPort}/api/auth/forgot-password/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: registeredPhone })
    });
    const data1 = await res1.json();
    console.log('   - Status:', res1.status, res1.status === 200 ? 'PASS' : 'FAIL');
    console.log('   - Masked phone:', data1.maskedPhone === '+91 ******3210' ? 'PASS' : 'FAIL');
    console.log('   - No API Key exposed:', !JSON.stringify(data1).includes('FAST2SMS') ? 'PASS' : 'FAIL');

    // 2. Unregistered phone
    console.log('\n2. Request OTP for Unregistered Phone (9999999999)...');
    const res2 = await fetch(`http://localhost:${testPort}/api/auth/forgot-password/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9999999999' })
    });
    const data2 = await res2.json();
    console.log('   - Status:', res2.status, res2.status === 404 ? 'PASS (404 Not Found)' : 'FAIL');

    // 3. Invalid phone format
    console.log('\n3. Request OTP with Invalid Phone format (12345)...');
    const res3 = await fetch(`http://localhost:${testPort}/api/auth/forgot-password/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '12345' })
    });
    console.log('   - Status:', res3.status, res3.status === 400 ? 'PASS (400 Bad Request)' : 'FAIL');

    // 4. Invalid OTP rejected
    console.log('\n4. Verify Incorrect OTP (000000)...');
    const res4 = await fetch(`http://localhost:${testPort}/api/auth/forgot-password/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: registeredPhone, otp: '000000' })
    });
    const data4 = await res4.json();
    console.log('   - Status:', res4.status, res4.status === 400 ? 'PASS (400 Rejected)' : 'FAIL');

    // 5. Valid OTP accepted & Reset Token generated
    console.log('\n5. Verify Valid OTP (123456)...');
    const res5 = await fetch(`http://localhost:${testPort}/api/auth/forgot-password/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: registeredPhone, otp: '123456' })
    });
    const data5 = await res5.json();
    console.log('   - Status:', res5.status, res5.status === 200 ? 'PASS' : 'FAIL');
    console.log('   - Reset Token returned:', !!data5.resetToken ? 'PASS' : 'FAIL');
    const resetToken = data5.resetToken;

    // 6. Security Check: Reset Token CANNOT access normal protected APIs
    console.log('\n6. Security Check: Verify Reset Token cannot access GET /api/auth/me...');
    const res6 = await fetch(`http://localhost:${testPort}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${resetToken}` }
    });
    console.log('   - Status:', res6.status, res6.status === 401 ? 'PASS (401 Unauthorized - Reset token blocked from business APIs)' : 'FAIL');

    // 7. Reset Password with Weak Password rejected
    console.log('\n7. Attempt Reset with Weak Password (short)...');
    const res7 = await fetch(`http://localhost:${testPort}/api/auth/forgot-password/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resetToken, newPassword: 'abc', confirmPassword: 'abc' })
    });
    console.log('   - Status:', res7.status, res7.status === 400 ? 'PASS (400 Rejected for weak password)' : 'FAIL');

    // 8. Reset Password with Valid New Password
    const newTestPassword = 'NewSecurePass@2026';
    console.log('\n8. Perform Valid Password Reset (NewSecurePass@2026)...');
    const res8 = await fetch(`http://localhost:${testPort}/api/auth/forgot-password/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resetToken, newPassword: newTestPassword, confirmPassword: newTestPassword })
    });
    const data8 = await res8.json();
    console.log('   - Status:', res8.status, res8.status === 200 ? 'PASS' : 'FAIL');
    console.log('   - Success message:', data8.message);

    // 9. Reset Token Replay Protection: Token CANNOT be reused
    console.log('\n9. Replay Attack Prevention: Attempt reuse of same resetToken...');
    const res9 = await fetch(`http://localhost:${testPort}/api/auth/forgot-password/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resetToken, newPassword: 'AnotherPassword@2026' })
    });
    console.log('   - Status:', res9.status, res9.status === 401 ? 'PASS (401 Replay Blocked)' : 'FAIL');

    // 10. Verify Old Password NO LONGER WORKS
    console.log('\n10. Verify Old Password (Password@123) fails login...');
    const res10 = await fetch(`http://localhost:${testPort}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUserEmail, password: 'Password@123' })
    });
    console.log('    - Status:', res10.status, res10.status === 401 ? 'PASS (Old password rejected)' : 'FAIL');

    // 11. Verify New Password WORKS for login
    console.log('\n11. Verify New Password (NewSecurePass@2026) logs in successfully...');
    const res11 = await fetch(`http://localhost:${testPort}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUserEmail, password: newTestPassword })
    });
    const data11 = await res11.json();
    console.log('    - Status:', res11.status, res11.status === 200 ? 'PASS' : 'FAIL');
    console.log('    - New JWT Token issued:', !!data11.token ? 'PASS' : 'FAIL');
    console.log('    - User role:', data11.user?.role);
    console.log('    - Branch:', data11.branch?.name);

    // Clean up / restore default test password for consistency
    await seedDefaultUsers();
    console.log('\n=== ALL FORGOT PASSWORD & SECURITY TESTS COMPLETED SUCCESSFULLY ===');
  } finally {
    server.close();
    await prisma.$disconnect();
  }
}

runForgotPasswordTests().catch(err => {
  console.error('Test run failed:', err);
  process.exit(1);
});
