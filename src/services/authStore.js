// Kanchivaram Café Centralized Authentication Store & Session Service

const AUTH_STORAGE_KEY = 'kanchivaram_auth_session';
const BRANCH_STORAGE_KEY = 'kanchivaram_selected_branch';
const USERS_STORAGE_KEY = 'kanchivaram_registered_users';

const DEFAULT_USERS = [
  {
    id: 'user-1',
    name: 'Shruthy A',
    email: 'shruthy@kanchivaram.cafe',
    phone: '+91 98765 43210',
    role: 'Owner & General Manager',
    passwordHash: 'Password@123',
    avatar: 'SA'
  },
  {
    id: 'user-2',
    name: 'Karthik Raja',
    email: 'karthik@kanchivaram.cafe',
    phone: '+91 91234 56789',
    role: 'Store Manager',
    passwordHash: 'Kanchivaram@2026',
    avatar: 'KR'
  }
];

export const CAFÉ_BRANCHES = [
  {
    id: 'branch-1',
    code: 'KCB-MAIN-01',
    name: 'Kanchivaram Café',
    badge: 'Main Branch',
    location: 'Kanchipuram, Tamil Nadu',
    fullAddress: 'Temple Street, Kanchipuram, Tamil Nadu',
    status: 'Operational (Live)',
    tables: 24,
    posTerminals: 3,
    image: '/branch_main.jpg',
    accentColor: '#0D3B2E',
    badgeBg: 'bg-[#0D3B2E]',
    badgeText: 'text-white'
  },
  {
    id: 'branch-2',
    code: 'KCB-CITY-02',
    name: 'Kanchivaram Café',
    badge: 'City Branch',
    location: 'Kanchipuram, Tamil Nadu',
    fullAddress: 'Kanchipuram, Tamil Nadu',
    status: 'Operational (Live)',
    tables: 18,
    posTerminals: 2,
    image: '/branch_city.jpg',
    accentColor: '#3E2312',
    badgeBg: 'bg-[#3E2312]',
    badgeText: 'text-white'
  }
];

class AuthStore {
  constructor() {
    this.listeners = [];
    this.loadInitialState();
  }

  loadInitialState() {
    // Load registered users or initialize default
    try {
      const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      this.registeredUsers = storedUsers ? JSON.parse(storedUsers) : DEFAULT_USERS;
      if (!storedUsers) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
      }
    } catch {
      this.registeredUsers = DEFAULT_USERS;
    }

    // Start with fresh session on URL open so Login page appears first
    this.currentUser = null;
    this.selectedBranch = null;

    // OTP Recovery Transient State
    this.resetState = {
      phoneInput: '',
      phoneMasked: '',
      sentOtpCode: null,
      otpVerified: false,
      resendTimer: 30,
      attempts: 0,
      errorMsg: null,
      successMsg: null,
      targetUserId: null
    };
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    const state = this.getState();
    this.listeners.forEach(l => l(state));
  }

  getState() {
    return {
      currentUser: this.currentUser,
      isAuthenticated: !!this.currentUser,
      selectedBranch: this.selectedBranch,
      resetState: this.resetState,
      branches: CAFÉ_BRANCHES
    };
  }

  // 1. LOGIN METHOD
  login({ email, password, rememberMe, branchObj }) {
    const normalizedEmail = (email || '').trim().toLowerCase();
    const user = this.registeredUsers.find(u => u.email.toLowerCase() === normalizedEmail);

    if (!user) {
      return { success: false, error: 'No account found with this email ID. Please check and try again.' };
    }

    if (user.passwordHash !== password) {
      return { success: false, error: 'Incorrect password entered. Please verify or use Forgot Password.' };
    }

    this.currentUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar
    };

    // Set active branch on login (default to Main Branch)
    this.selectedBranch = branchObj || CAFÉ_BRANCHES[0];

    // Save session based on rememberMe
    if (rememberMe) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.currentUser));
    } else {
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.currentUser));
    }
    localStorage.setItem(BRANCH_STORAGE_KEY, JSON.stringify(this.selectedBranch));

    this.notify();
    return { success: true, user: this.currentUser, branch: this.selectedBranch };
  }

  // 2. LOGOUT METHOD
  logout() {
    this.currentUser = null;
    this.selectedBranch = null;
    localStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(BRANCH_STORAGE_KEY);
    this.notify();
  }

  // 3. SELECT BRANCH METHOD
  selectBranch(branchObj) {
    this.selectedBranch = branchObj;
    localStorage.setItem(BRANCH_STORAGE_KEY, JSON.stringify(branchObj));
    this.notify();
  }

  // 4. CLEAR SELECTED BRANCH METHOD (Switch Branch without logging out)
  clearSelectedBranch() {
    this.selectedBranch = null;
    localStorage.removeItem(BRANCH_STORAGE_KEY);
    this.notify();
  }

  // 4. FORGOT PASSWORD - REQUEST OTP VIA SMS
  requestPhoneOtp(phoneNumber) {
    const cleanPhone = (phoneNumber || '').replace(/\s+/g, '');
    const user = this.registeredUsers.find(u => u.phone.replace(/\s+/g, '') === cleanPhone || cleanPhone.endsWith(u.phone.slice(-10)));

    // Indian 10-digit phone format validation
    const digitsOnly = cleanPhone.replace(/[^0-9]/g, '');
    if (digitsOnly.length < 10) {
      return { success: false, error: 'Please enter a valid 10-digit Indian mobile number.' };
    }

    if (!user) {
      return { success: false, error: 'Phone number is not registered with any Kanchivaram Café account.' };
    }

    // Generate 6-digit OTP (for demo, 123456 or random 6 digits)
    const mockOtp = '123456';
    
    // Mask phone number for display (+91 ******43210)
    const rawDigits = user.phone.replace(/[^0-9]/g, '').slice(-10);
    const maskedPhone = `+91 ******${rawDigits.slice(-4)}`;

    this.resetState = {
      phoneInput: user.phone,
      phoneMasked: maskedPhone,
      sentOtpCode: mockOtp,
      otpVerified: false,
      resendTimer: 30,
      attempts: 0,
      errorMsg: null,
      successMsg: `OTP sent to ${maskedPhone}. (Demo OTP: 123456)`,
      targetUserId: user.id
    };

    this.notify();
    return { success: true, maskedPhone, demoOtp: mockOtp };
  }

  // 5. VERIFY OTP METHOD
  verifyOtp(enteredOtp) {
    if (this.resetState.attempts >= 5) {
      return { success: false, error: 'Too many failed attempts. Please request a new OTP.' };
    }

    if (!enteredOtp || enteredOtp.length !== 6) {
      return { success: false, error: 'Please enter the complete 6-digit OTP code.' };
    }

    if (enteredOtp !== this.resetState.sentOtpCode) {
      this.resetState.attempts += 1;
      this.notify();
      return { success: false, error: 'Incorrect OTP. Please check the SMS code and try again.' };
    }

    this.resetState.otpVerified = true;
    this.resetState.errorMsg = null;
    this.notify();
    return { success: true };
  }

  // 6. RESET PASSWORD METHOD
  resetPassword({ newPassword, confirmPassword }) {
    if (!this.resetState.otpVerified || !this.resetState.targetUserId) {
      return { success: false, error: 'Unauthorized. Please complete OTP verification first.' };
    }

    if (newPassword.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters long.' };
    }

    if (!/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      return { success: false, error: 'Password must include at least one letter and one number.' };
    }

    if (newPassword !== confirmPassword) {
      return { success: false, error: 'Passwords do not match. Please verify both fields.' };
    }

    // Update user password in registeredUsers list
    const userIndex = this.registeredUsers.findIndex(u => u.id === this.resetState.targetUserId);
    if (userIndex !== -1) {
      this.registeredUsers[userIndex].passwordHash = newPassword;
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(this.registeredUsers));
    }

    // Reset recovery state
    this.resetState = {
      phoneInput: '',
      phoneMasked: '',
      sentOtpCode: null,
      otpVerified: false,
      resendTimer: 30,
      attempts: 0,
      errorMsg: null,
      successMsg: null,
      targetUserId: null
    };

    this.notify();
    return { success: true };
  }
}

export const authStore = new AuthStore();
