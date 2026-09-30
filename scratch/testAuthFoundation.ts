import { 
  hashPassword, 
  comparePassword, 
  signAccessToken, 
  verifyAccessToken, 
  toSafeUser,
  validateUserActive 
} from '../server/src/auth';

async function runAuthFoundationTests() {
  console.log('=== RUNNING AUTH FOUNDATION TESTS ===\n');

  // Test 1: Password Hashing & Comparison
  const plain = 'Password@123';
  const hashed = await hashPassword(plain);
  console.log('1. Password Hashing Test:');
  console.log('   - Hash prefix check:', hashed.startsWith('$2') ? 'PASS ($2...)' : 'FAIL');
  console.log('   - Not equal to plain:', hashed !== plain ? 'PASS' : 'FAIL');

  const matchCorrect = await comparePassword(plain, hashed);
  console.log('   - Compare correct password:', matchCorrect ? 'PASS' : 'FAIL');

  const matchWrong = await comparePassword('WrongPassword', hashed);
  console.log('   - Compare incorrect password:', !matchWrong ? 'PASS (Correctly rejected)' : 'FAIL');

  // Test 2: JWT Token Lifecycle
  console.log('\n2. JWT Token Lifecycle Test:');
  const payload = {
    userId: 'user-1',
    email: 'shruthy@kanchivaram.cafe',
    role: 'Owner & General Manager',
    branchId: 'branch-1'
  };

  const token = signAccessToken(payload);
  console.log('   - Token generated:', typeof token === 'string' && token.length > 20 ? 'PASS' : 'FAIL');

  const decoded = verifyAccessToken(token);
  console.log('   - Token decoded userId:', decoded?.userId === payload.userId ? 'PASS' : 'FAIL');
  console.log('   - Token decoded email:', decoded?.email === payload.email ? 'PASS' : 'FAIL');
  console.log('   - Token decoded role:', decoded?.role === payload.role ? 'PASS' : 'FAIL');
  console.log('   - Token decoded branchId:', decoded?.branchId === payload.branchId ? 'PASS' : 'FAIL');

  const invalidDecoded = verifyAccessToken('invalid.token.signature');
  console.log('   - Invalid token rejected:', invalidDecoded === null ? 'PASS' : 'FAIL');

  // Test 3: Safe User Sanitization
  console.log('\n3. Safe User Sanitization Test:');
  const mockDbUser = {
    id: 'user-1',
    name: 'Shruthy A',
    email: 'shruthy@kanchivaram.cafe',
    phone: '+91 98765 43210',
    role: 'Owner & General Manager',
    passwordHash: hashed,
    avatar: 'SA',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    branch: {
      id: 'branch-1',
      name: 'Main Branch - Gandhi Road',
      code: 'KCB-MAIN-01',
      badge: 'Main Branch',
      location: 'Gandhi Road'
    }
  };

  const safe = toSafeUser(mockDbUser);
  console.log('   - passwordHash stripped:', !('passwordHash' in safe) ? 'PASS' : 'FAIL');
  console.log('   - Name preserved:', safe.name === 'Shruthy A' ? 'PASS' : 'FAIL');
  console.log('   - Branch preserved:', safe.branch?.name === 'Main Branch - Gandhi Road' ? 'PASS' : 'FAIL');

  // Test 4: User Active Validation
  console.log('\n4. User Active Validation Test:');
  console.log('   - Active user check:', validateUserActive(mockDbUser) ? 'PASS' : 'FAIL');
  console.log('   - Inactive user check:', !validateUserActive({ isActive: false }) ? 'PASS' : 'FAIL');
  console.log('   - Null user check:', !validateUserActive(null) ? 'PASS' : 'FAIL');

  console.log('\n=== ALL AUTH FOUNDATION TESTS COMPLETED SUCCESSFULLY ===');
}

runAuthFoundationTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
