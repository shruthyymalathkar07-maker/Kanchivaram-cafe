import { 
  loginUserApi, 
  logoutUserApi, 
  getCurrentUserApi,
  requestPasswordOtpApi,
  verifyPasswordOtpApi,
  resetPasswordApi,
  getGoogleAuthRedirectUrl
} from './api';

const AUTH_STORAGE_KEY = 'kanchivaram_auth_session';
const BRANCH_STORAGE_KEY = 'kanchivaram_selected_branch';
const USERS_STORAGE_KEY = 'kanchivaram_registered_users';
const TOKEN_STORAGE_KEY = 'kanchivaram_auth_token';

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
    this.oauthError = null;
    this.loadInitialState();
    this.handleUrlCallback();
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
    this.token = null;

    // OTP Recovery Transient State
    this.resetState = {
      phoneInput: '',
      phoneMasked: '',
      sentOtpCode: null,
      otpVerified: false,
      resetToken: null,
      resendTimer: 30,
      attempts: 0,
      errorMsg: null,
      successMsg: null,
      targetUserId: null
    };
  }

  async handleUrlCallback() {
    if (typeof window === 'undefined') return;

    try {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      const error = params.get('error');

      if (token) {
        this.token = token;
        localStorage.setItem(TOKEN_STORAGE_KEY, token);

        // Fetch user data from backend
        const apiRes = await getCurrentUserApi(token);
        if (apiRes && apiRes.success && apiRes.user) {
          this.currentUser = apiRes.user;
          const userBranchId = apiRes.user.branchId;
          const matchedBranch = userBranchId ? CAFÉ_BRANCHES.find(b => b.id === userBranchId) : CAFÉ_BRANCHES[0];
          this.selectedBranch = apiRes.branch || matchedBranch || CAFÉ_BRANCHES[0];

          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.currentUser));
          localStorage.setItem(BRANCH_STORAGE_KEY, JSON.stringify(this.selectedBranch));
        }

        // Clean query params from URL
        const cleanUrl = window.location.pathname + (window.location.hash || '');
        window.history.replaceState({}, document.title, cleanUrl);
        this.notify();
      } else if (error) {
        let msg = 'Google authentication failed. Please try again.';
        if (error === 'unauthorized_google_account') {
          msg = 'This Google account is not authorized. Please log in with your registered credentials.';
        } else if (error === 'account_deactivated') {
          msg = 'This account has been deactivated. Please contact the administrator.';
        } else if (error === 'google_oauth_not_configured') {
          msg = 'Google sign-in is not configured yet. Please log in using email & password.';
        } else if (error === 'oauth_cancelled') {
          msg = 'Google sign-in was cancelled.';
        }
        this.oauthError = msg;

        // Clean query params from URL
        const cleanUrl = window.location.pathname + (window.location.hash || '');
        window.history.replaceState({}, document.title, cleanUrl);
        this.notify();
      }
    } catch (err) {
      console.warn('[AuthStore] URL callback handling error:', err);
    }
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
      token: this.token,
      isAuthenticated: !!this.currentUser,
      selectedBranch: this.selectedBranch,
      resetState: this.resetState,
      oauthError: this.oauthError,
      branches: CAFÉ_BRANCHES
    };
  }

  clearOAuthError() {
    this.oauthError = null;
    this.notify();
  }

  loginWithGoogle() {
    this.oauthError = null;
    const redirectUrl = getGoogleAuthRedirectUrl();
    window.location.href = redirectUrl;
  }


  // 1. LOGIN METHOD (Live PostgreSQL API with seamless fallback)
  async login({ email, password, rememberMe, branchObj }) {
    const requestedBranchId = branchObj?.id || 'branch-1';
    
    // Call live backend authentication endpoint
    const apiRes = await loginUserApi({
      email,
      password,
      branchId: requestedBranchId
    });

    if (apiRes && apiRes.success && apiRes.user) {
      this.currentUser = apiRes.user;
      this.token = apiRes.token || null;
      // Do not auto-select branch unless explicitly provided; user chooses on Branch Selection page
      this.selectedBranch = branchObj || null;

      if (rememberMe) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.currentUser));
        if (apiRes.token) localStorage.setItem(TOKEN_STORAGE_KEY, apiRes.token);
      } else {
        sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.currentUser));
        if (apiRes.token) sessionStorage.setItem(TOKEN_STORAGE_KEY, apiRes.token);
      }

      if (this.selectedBranch) {
        localStorage.setItem(BRANCH_STORAGE_KEY, JSON.stringify(this.selectedBranch));
      } else {
        localStorage.removeItem(BRANCH_STORAGE_KEY);
      }

      this.notify();
      return { success: true, user: this.currentUser, branch: this.selectedBranch, token: apiRes.token };
    }

    if (apiRes && apiRes.error) {
      return { success: false, error: apiRes.error };
    }

    // Client-side fallback if backend is offline
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

    // Do not auto-select branch unless explicitly provided
    this.selectedBranch = branchObj || null;

    if (rememberMe) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.currentUser));
    } else {
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.currentUser));
    }

    if (this.selectedBranch) {
      localStorage.setItem(BRANCH_STORAGE_KEY, JSON.stringify(this.selectedBranch));
    } else {
      localStorage.removeItem(BRANCH_STORAGE_KEY);
    }

    this.notify();
    return { success: true, user: this.currentUser, branch: this.selectedBranch };
  }

  // 2. LOGOUT METHOD
  async logout() {
    try {
      await logoutUserApi();
    } catch {
      // Ignore network errors on logout
    }
    this.currentUser = null;
    this.selectedBranch = null;
    this.token = null;
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
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

  // 5. FORGOT PASSWORD - REQUEST OTP VIA FAST2SMS API
  async requestPhoneOtp(phoneNumber) {
    const cleanPhone = (phoneNumber || '').replace(/\s+/g, '');
    const digitsOnly = cleanPhone.replace(/[^0-9]/g, '');

    if (digitsOnly.length < 10) {
      return { success: false, error: 'Please enter a valid 10-digit Indian mobile number.' };
    }

    // Call live backend Fast2SMS endpoint
    const apiRes = await requestPasswordOtpApi(phoneNumber);

    if (apiRes && apiRes.success) {
      this.resetState = {
        phoneInput: phoneNumber,
        phoneMasked: apiRes.maskedPhone || `+91 ******${digitsOnly.slice(-4)}`,
        sentOtpCode: apiRes.demoOtp || null,
        otpVerified: false,
        resetToken: null,
        resendTimer: 30,
        attempts: 0,
        errorMsg: null,
        successMsg: apiRes.message,
        targetUserId: 'api_user'
      };
      this.notify();
      return { 
        success: true, 
        maskedPhone: this.resetState.phoneMasked, 
        demoOtp: apiRes.demoOtp,
        message: apiRes.message 
      };
    }

    if (apiRes && apiRes.error) {
      return { success: false, error: apiRes.error };
    }

    // Fallback if backend offline
    const user = this.registeredUsers.find(u => u.phone.replace(/\s+/g, '') === cleanPhone || cleanPhone.endsWith(u.phone.slice(-10)));
    if (!user) {
      return { success: false, error: 'Phone number is not registered with any Kanchivaram Café account.' };
    }

    const mockOtp = '123456';
    const rawDigits = user.phone.replace(/[^0-9]/g, '').slice(-10);
    const maskedPhone = `+91 ******${rawDigits.slice(-4)}`;

    this.resetState = {
      phoneInput: user.phone,
      phoneMasked: maskedPhone,
      sentOtpCode: mockOtp,
      otpVerified: false,
      resetToken: null,
      resendTimer: 30,
      attempts: 0,
      errorMsg: null,
      successMsg: `OTP sent to ${maskedPhone}. (Demo OTP: 123456)`,
      targetUserId: user.id
    };

    this.notify();
    return { success: true, maskedPhone, demoOtp: mockOtp };
  }

  // 6. VERIFY OTP METHOD
  async verifyOtp(enteredOtp) {
    if (!enteredOtp || enteredOtp.length !== 6) {
      return { success: false, error: 'Please enter the complete 6-digit OTP code.' };
    }

    if (this.resetState.attempts >= 5) {
      return { success: false, error: 'Too many failed attempts. Please request a new OTP.' };
    }

    // Call live backend OTP verification endpoint
    const apiRes = await verifyPasswordOtpApi({
      phone: this.resetState.phoneInput,
      otp: enteredOtp
    });

    if (apiRes && apiRes.success) {
      this.resetState.otpVerified = true;
      this.resetState.resetToken = apiRes.resetToken || null;
      this.resetState.errorMsg = null;
      this.notify();
      return { success: true, resetToken: apiRes.resetToken };
    }

    if (apiRes && apiRes.error) {
      this.resetState.attempts += 1;
      this.notify();
      return { success: false, error: apiRes.error };
    }

    // Fallback comparison
    if (enteredOtp !== this.resetState.sentOtpCode && enteredOtp !== '123456') {
      this.resetState.attempts += 1;
      this.notify();
      return { success: false, error: 'Incorrect OTP. Please check the SMS code and try again.' };
    }

    this.resetState.otpVerified = true;
    this.resetState.errorMsg = null;
    this.notify();
    return { success: true };
  }

  // 7. RESET PASSWORD METHOD
  async resetPassword({ newPassword, confirmPassword }) {
    if (!this.resetState.otpVerified) {
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

    // Call live backend reset endpoint if resetToken exists
    if (this.resetState.resetToken) {
      const apiRes = await resetPasswordApi({
        resetToken: this.resetState.resetToken,
        newPassword,
        confirmPassword
      });

      if (apiRes && apiRes.success) {
        this.resetState = {
          phoneInput: '',
          phoneMasked: '',
          sentOtpCode: null,
          otpVerified: false,
          resetToken: null,
          resendTimer: 30,
          attempts: 0,
          errorMsg: null,
          successMsg: null,
          targetUserId: null
        };
        this.notify();
        return { success: true, message: apiRes.message };
      }

      if (apiRes && apiRes.error) {
        return { success: false, error: apiRes.error };
      }
    }

    // Fallback update
    if (this.resetState.targetUserId && this.resetState.targetUserId !== 'api_user') {
      const userIndex = this.registeredUsers.findIndex(u => u.id === this.resetState.targetUserId);
      if (userIndex !== -1) {
        this.registeredUsers[userIndex].passwordHash = newPassword;
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(this.registeredUsers));
      }
    }

    this.resetState = {
      phoneInput: '',
      phoneMasked: '',
      sentOtpCode: null,
      otpVerified: false,
      resetToken: null,
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

