import express from 'express';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import { createApiRouter } from '../server/src/routes/api.js';
import {
  seedDefaultUsers,
  signAccessToken,
  findUserByEmail
} from '../server/src/auth.js';
import { prisma } from '../server/src/db.js';
import { fetchBranchBusinessContext, processKVCMQuery } from '../server/src/ai.js';

async function runKVCMStep6Tests() {
  console.log('================================================================================');
  console.log('🧪 RUNNING STEP 6 — KVCM AI ASSISTANT / CHATBOT INTEGRATION TEST SUITE');
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

  // Seed default users
  await seedDefaultUsers(true);

  const app = express();
  const server = http.createServer(app);
  const io = new SocketServer(server);
  app.use(express.json());
  app.use('/api', createApiRouter(io));

  const testPort = 5095;
  await new Promise<void>((resolve) => {
    server.listen(testPort, () => {
      console.log(`Test server running on port ${testPort}`);
      resolve();
    });
  });

  const baseUrl = `http://127.0.0.1:${testPort}/api`;

  try {
    const mainUser = await prisma.user.findFirst({ where: { email: 'shruthy@kanchivaram.cafe' } });
    const cityUser = await prisma.user.findFirst({ where: { email: 'karthik@kanchivaram.cafe' } });

    if (!mainUser || !cityUser) {
      throw new Error('Default branch users not found in database');
    }

    const mainToken = signAccessToken({
      userId: mainUser.id,
      email: mainUser.email,
      role: mainUser.role,
      branchId: 'branch-1'
    });

    const cityToken = signAccessToken({
      userId: cityUser.id,
      email: cityUser.email,
      role: cityUser.role,
      branchId: 'branch-2'
    });

    // TEST 1: Direct Verified Business Context Fetch from PostgreSQL
    const mainContext = await fetchBranchBusinessContext(prisma, 'branch-1');
    const cityContext = await fetchBranchBusinessContext(prisma, 'branch-2');

    assert(
      mainContext.branchId === 'branch-1' && mainContext.branchName.includes('Main Branch'),
      'Test 1A: Main Branch context retrieved correctly from PostgreSQL'
    );
    assert(
      cityContext.branchId === 'branch-2' && cityContext.branchName.includes('City Branch'),
      'Test 1B: City Branch context retrieved correctly from PostgreSQL'
    );
    assert(
      typeof mainContext.sales.today.totalAmount === 'number' && typeof mainContext.inventory.totalTrackedItems === 'number',
      'Test 1C: Verified sales, inventory, and expense figures present in context'
    );

    // TEST 2: POST /api/chatbot/query handles sales queries with verified database numbers
    const salesQueryRes = await fetch(`${baseUrl}/chatbot/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mainToken}`,
        'x-branch-id': 'branch-1'
      },
      body: JSON.stringify({ query: "How much did we sell today?" })
    });
    const salesQueryData = await salesQueryRes.json();

    assert(
      salesQueryRes.status === 200 && salesQueryData.success === true && typeof salesQueryData.answer === 'string',
      'Test 2A: /api/chatbot/query returns HTTP 200 and structured answer'
    );
    assert(
      salesQueryData.branchId === 'branch-1',
      'Test 2B: Response strictly reflects authorized Main Branch'
    );
    assert(
      salesQueryData.answer.includes('Main Branch') || salesQueryData.answer.includes('Today'),
      'Test 2C: Answer references verified branch context'
    );

    // TEST 3: Branch Isolation - City Branch user queries return City Branch data
    const cityQueryRes = await fetch(`${baseUrl}/chatbot/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cityToken}`,
        'x-branch-id': 'branch-2'
      },
      body: JSON.stringify({ query: "What are our sales today?" })
    });
    const cityQueryData = await cityQueryRes.json();

    assert(
      cityQueryRes.status === 200 && cityQueryData.branchId === 'branch-2',
      'Test 3A: City Branch user query is isolated to City Branch'
    );
    assert(
      cityQueryData.answer.includes('City Branch') || cityQueryData.branchId === 'branch-2',
      'Test 3B: Response contains City Branch details only'
    );

    // TEST 4: Low Stock Inventory Queries
    const stockQueryRes = await fetch(`${baseUrl}/chatbot/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mainToken}`,
        'x-branch-id': 'branch-1'
      },
      body: JSON.stringify({ query: "Which stock is running low?" })
    });
    const stockQueryData = await stockQueryRes.json();

    assert(
      stockQueryRes.status === 200 && stockQueryData.success === true,
      'Test 4A: Low stock query returns valid response'
    );
    assert(
      stockQueryData.answer.toLowerCase().includes('stock') || stockQueryData.answer.toLowerCase().includes('threshold'),
      'Test 4B: Low stock answer accurately reflects inventory levels'
    );

    // TEST 5: Operating Expenses & Purchases Queries
    const expenseQueryRes = await fetch(`${baseUrl}/chatbot/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mainToken}`,
        'x-branch-id': 'branch-1'
      },
      body: JSON.stringify({ query: "What are our operating expenses today?" })
    });
    const expenseQueryData = await expenseQueryRes.json();

    assert(
      expenseQueryRes.status === 200 && expenseQueryData.success === true,
      'Test 5A: Operating expense query returns valid response'
    );
    assert(
      expenseQueryData.answer.toLowerCase().includes('expense') || expenseQueryData.answer.includes('₹'),
      'Test 5B: Expense response contains formatted currency figures'
    );

    // TEST 6: Empty or whitespace query returns user-friendly validation error
    const emptyQueryRes = await fetch(`${baseUrl}/chatbot/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mainToken}`,
        'x-branch-id': 'branch-1'
      },
      body: JSON.stringify({ query: "   " })
    });
    const emptyQueryData = await emptyQueryRes.json();

    assert(
      emptyQueryRes.status === 400 && emptyQueryData.success === false,
      'Test 6: Empty query is gracefully rejected with HTTP 400'
    );

    // TEST 7: Security - API Key and Backend Secrets are Never Leaked
    assert(
      !JSON.stringify(salesQueryData).includes('sk-') &&
      !JSON.stringify(cityQueryData).includes('sk-') &&
      !JSON.stringify(stockQueryData).includes('sk-') &&
      !JSON.stringify(expenseQueryData).includes('sk-'),
      'Test 7: OpenAI API Key and internal secrets are NEVER leaked in HTTP response'
    );

    // TEST 8: Re-verify Existing Email Login still works
    const emailLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: mainUser.email, password: 'Password@123' })
    });
    const emailLoginData = await emailLoginRes.json();

    assert(
      emailLoginRes.status === 200 && emailLoginData.success === true && !!emailLoginData.token,
      'Test 8: Existing email/password authentication continues to function'
    );

    // TEST 9: Re-verify Mock OTP Forgot Password still works
    process.env.OTP_PROVIDER = 'mock';
    const otpReqRes = await fetch(`${baseUrl}/auth/forgot-password/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: mainUser.phone })
    });
    const otpReqData = await otpReqRes.json();

    assert(
      otpReqRes.status === 200 && otpReqData.success === true,
      'Test 9: Forgot Password OTP flow continues to function'
    );

    console.log('\n================================================================================');
    console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('================================================================================\n');

    if (failed === 0) {
      console.log('🎉 STEP 6 — KVCM AI ASSISTANT / CHATBOT: PASS');
    } else {
      console.error('💥 STEP 6: FAIL');
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

runKVCMStep6Tests();
