import express from 'express';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import { createApiRouter } from '../server/src/routes/api.js';
import { seedDefaultUsers } from '../server/src/auth.js';
import { prisma } from '../server/src/db.js';
import { authStore, CAFÉ_BRANCHES } from '../src/services/authStore.js';

// Setup mock browser storage for Node.js test environment
const memoryStore = new Map<string, string>();
const mockStorage = {
  getItem: (k: string) => memoryStore.get(k) || null,
  setItem: (k: string, v: string) => memoryStore.set(k, String(v)),
  removeItem: (k: string) => memoryStore.delete(k),
  clear: () => memoryStore.clear()
};

(globalThis as any).localStorage = mockStorage;
(globalThis as any).sessionStorage = mockStorage;
(globalThis as any).window = {
  location: { hostname: 'localhost', search: '', pathname: '/', hash: '', replaceState: () => {} },
  history: { replaceState: () => {} }
};

async function runBranchSelectionFlowTests() {
  console.log('================================================================================');
  console.log('🧪 RUNNING VERIFICATION: RESTORE BRANCH SELECTION FLOW AFTER LOGIN');
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

  // 1. Seed database & spin up Express test server
  await seedDefaultUsers();
  const app = express();
  app.use(express.json());
  const server = http.createServer(app);
  const io = new SocketServer(server, { cors: { origin: '*' } });
  app.use('/api', createApiRouter(io));

  const PORT = 5096;
  await new Promise<void>((resolve) => server.listen(PORT, () => resolve()));
  console.log(`Test server running on port ${PORT}\n`);

  try {
    // Test 1: Initial state on launch has no user and no pre-selected branch
    authStore.loadInitialState();
    const initial = authStore.getState();
    assert(initial.currentUser === null && initial.isAuthenticated === false, 'Test 1: Initial state is unauthenticated');
    assert(initial.selectedBranch === null, 'Test 2: Initial state has no selectedBranch (clean start)');

    // Test 2: Standard Email/Password login authenticates without pre-selecting branch
    const loginRes = await authStore.login({
      email: 'shruthy@kanchivaram.cafe',
      password: 'Password@123',
      rememberMe: true
    });
    assert(loginRes.success === true, 'Test 3: Standard login succeeds with backend authentication');
    assert(loginRes.user !== null && loginRes.user.email === 'shruthy@kanchivaram.cafe', 'Test 4: Authenticated user is properly set');
    assert(loginRes.branch === null, 'Test 5: login() returns branch: null so Branch Selection page is NOT skipped');
    
    const postLoginState = authStore.getState();
    assert(postLoginState.isAuthenticated === true, 'Test 6: authState.isAuthenticated is true');
    assert(postLoginState.selectedBranch === null, 'Test 7: authState.selectedBranch is null -> triggers BRANCH_SELECT in App.jsx');

    // Test 3: User selects Main Branch
    authStore.selectBranch(CAFÉ_BRANCHES[0]);
    const mainBranchState = authStore.getState();
    assert(mainBranchState.selectedBranch?.id === 'branch-1', 'Test 8: Main Branch selection sets branch-1');
    assert(mainBranchState.selectedBranch?.badge === 'Main Branch', 'Test 9: Main Branch badge is Main Branch');

    // Test 4: Switching to City Branch
    authStore.selectBranch(CAFÉ_BRANCHES[1]);
    const cityBranchState = authStore.getState();
    assert(cityBranchState.selectedBranch?.id === 'branch-2', 'Test 10: City Branch selection sets branch-2');
    assert(cityBranchState.selectedBranch?.badge === 'City Branch', 'Test 11: City Branch badge is City Branch');

    // Test 5: Changing branch (clearSelectedBranch) returns to Branch Selection without logout
    authStore.clearSelectedBranch();
    const clearedBranchState = authStore.getState();
    assert(clearedBranchState.isAuthenticated === true, 'Test 12: User remains authenticated when changing branch');
    assert(clearedBranchState.selectedBranch === null, 'Test 13: selectedBranch is cleared to null -> returns to Branch Selection');

    // Test 6: Complete Forgot Password -> Reset -> Login -> Branch Selection Flow
    // Step 6A: Request OTP
    const otpRes = await authStore.requestPhoneOtp('+91 98765 43210');
    assert(otpRes.success === true, 'Test 14: Forgot password OTP request succeeds');

    // Step 6B: Verify OTP
    const testOtp = authStore.getState().resetState.sentOtpCode || '123456';
    const verifyRes = await authStore.verifyOtp(testOtp);
    assert(verifyRes.success === true, 'Test 15: OTP verification succeeds');

    // Step 6C: Set new password
    const newPass = 'FreshBrew@2026';
    const resetRes = await authStore.resetPassword({
      newPassword: newPass,
      confirmPassword: newPass
    });
    assert(resetRes.success === true, 'Test 16: Password reset in database succeeds');

    // Step 6D: Log in using new password
    const newPassLoginRes = await authStore.login({
      email: 'shruthy@kanchivaram.cafe',
      password: newPass,
      rememberMe: true
    });
    assert(newPassLoginRes.success === true, 'Test 17: Login with new password succeeds');
    assert(newPassLoginRes.branch === null, 'Test 18: Login after password reset requires branch selection (branch is null)');

    // Step 6E: Choose City Branch after password reset
    authStore.selectBranch(CAFÉ_BRANCHES[1]);
    assert(authStore.getState().selectedBranch?.id === 'branch-2', 'Test 19: Branch selection after password reset assigns branch-2 correctly');

    // Step 7: Restore original password for continuous operational consistency
    await authStore.resetPassword({
      newPassword: 'Password@123',
      confirmPassword: 'Password@123'
    });
    console.log('\n[Cleanup] Restored default test password to Password@123');

  } catch (err: any) {
    console.error('Test error:', err);
    failed++;
  } finally {
    server.close();
    await prisma.$disconnect();
  }

  console.log('\n================================================================================');
  console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================================\n');

  if (failed === 0) {
    console.log('🎉 BRANCH SELECTION FLOW RESTORATION: PASS');
  } else {
    process.exit(1);
  }
}

runBranchSelectionFlowTests();
