import React, { useState, useEffect, useRef } from 'react';
import { 
  Lock, 
  Mail, 
  Phone, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  KeyRound, 
  Building2, 
  Coffee, 
  RotateCcw,
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  Check
} from 'lucide-react';
import { authStore, CAFÉ_BRANCHES } from '../services/authStore';

export default function AuthView({ onAuthSuccess, initialStep = 'LOGIN' }) {
  const [authStep, setAuthStep] = useState(initialStep); // LOGIN, FORGOT_PASSWORD, OTP_VERIFY, RESET_PASSWORD, RESET_SUCCESS, BRANCH_SELECT
  const [authState, setAuthState] = useState(() => authStore.getState());

  // Login Form States
  const [emailInput, setEmailInput] = useState('shruthy@kanchivaram.cafe');
  const [passwordInput, setPasswordInput] = useState('Password@123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Forgot Password & Phone OTP States
  const [phoneInput, setPhoneInput] = useState('+91 98765 43210');
  const [otpArray, setOtpArray] = useState(['', '', '', '', '', '']);
  const otpInputRefs = useRef([]);

  // Timer for OTP Resend
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // Reset Password States
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Branch Selection State
  const [selectedBranchId, setSelectedBranchId] = useState(CAFÉ_BRANCHES[0].id);

  // Error & Feedback Message States
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Subscribe to authStore updates
  useEffect(() => {
    const unsubscribe = authStore.subscribe(newState => {
      setAuthState(newState);
    });
    return unsubscribe;
  }, []);

  // Sync authStep when initialStep prop changes (e.g. returning to Branch Selection)
  useEffect(() => {
    setAuthStep(initialStep);
  }, [initialStep]);

  // OTP Resend Countdown Timer Effect
  useEffect(() => {
    let interval = null;
    if (authStep === 'OTP_VERIFY' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [authStep, resendTimer]);

  // Handle Quick Demo Login fill
  const handleQuickDemoFill = (email, pass) => {
    setEmailInput(email);
    setPasswordInput(pass);
    setErrorMessage(null);
  };

  // 1. HANDLE LOGIN SUBMIT
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setErrorMessage(null);

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput.trim() || !emailRegex.test(emailInput.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!passwordInput) {
      setErrorMessage('Please enter your password.');
      return;
    }

    const res = authStore.login({
      email: emailInput,
      password: passwordInput,
      rememberMe
    });

    if (!res.success) {
      setErrorMessage(res.error);
    } else {
      if (onAuthSuccess) {
        onAuthSuccess(authStore.getState());
      }
    }
  };

  // 2. HANDLE FORGOT PASSWORD (REQUEST OTP)
  const handleRequestOtpSubmit = (e) => {
    e.preventDefault();
    setErrorMessage(null);

    const res = authStore.requestPhoneOtp(phoneInput);
    if (!res.success) {
      setErrorMessage(res.error);
    } else {
      setSuccessMessage(`OTP sent to registered phone number. (Demo code: 123456)`);
      setResendTimer(30);
      setCanResend(false);
      setOtpArray(['', '', '', '', '', '']);
      setAuthStep('OTP_VERIFY');
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
    }
  };

  // 3. HANDLE OTP INPUT BOXES
  const handleOtpBoxChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otpArray];
    newOtp[index] = value.slice(-1);
    setOtpArray(newOtp);
    setErrorMessage(null);

    // Auto-advance to next input box
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpArray[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (pastedData.length > 0) {
      const newOtp = Array(6).fill('');
      pastedData.split('').forEach((char, idx) => {
        newOtp[idx] = char;
      });
      setOtpArray(newOtp);
      const nextFocusIndex = Math.min(pastedData.length, 5);
      otpInputRefs.current[nextFocusIndex]?.focus();
    }
  };

  // 4. HANDLE OTP VERIFY SUBMIT
  const handleVerifyOtpSubmit = (e) => {
    e.preventDefault();
    setErrorMessage(null);

    const enteredCode = otpArray.join('');
    const res = authStore.verifyOtp(enteredCode);

    if (!res.success) {
      setErrorMessage(res.error);
    } else {
      setSuccessMessage('OTP verified successfully! Create a new password.');
      setNewPasswordInput('');
      setConfirmPasswordInput('');
      setAuthStep('RESET_PASSWORD');
    }
  };

  const handleResendOtp = () => {
    if (!canResend) return;
    const res = authStore.requestPhoneOtp(phoneInput);
    if (res.success) {
      setResendTimer(30);
      setCanResend(false);
      setSuccessMessage('A new 6-digit OTP code has been sent.');
      setOtpArray(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
    }
  };

  // 5. HANDLE RESET PASSWORD SUBMIT
  const handleResetPasswordSubmit = (e) => {
    e.preventDefault();
    setErrorMessage(null);

    const res = authStore.resetPassword({
      newPassword: newPasswordInput,
      confirmPassword: confirmPasswordInput
    });

    if (!res.success) {
      setErrorMessage(res.error);
    } else {
      setAuthStep('RESET_SUCCESS');
    }
  };

  // 6. HANDLE BRANCH SELECTION SUBMIT
  const handleBranchSelectSubmit = (e) => {
    e.preventDefault();
    const branchObj = CAFÉ_BRANCHES.find(b => b.id === selectedBranchId) || CAFÉ_BRANCHES[0];
    authStore.selectBranch(branchObj);

    if (onAuthSuccess) {
      onAuthSuccess(authStore.getState());
    }
  };

  // Real-time Password strength indicators
  const isMinLength = newPasswordInput.length >= 8;
  const hasLetterAndNumber = /[A-Za-z]/.test(newPasswordInput) && /[0-9]/.test(newPasswordInput);
  const isMatch = newPasswordInput.length > 0 && newPasswordInput === confirmPasswordInput;

  // Determine active stage in "The Brewing Journey"
  const getActiveJourneyStage = () => {
    if (authStep === 'FORGOT_PASSWORD') return 1; // 01 SELECT BEANS (Active for Forgot Password)
    if (authStep === 'RESET_PASSWORD' || authStep === 'RESET_SUCCESS' || authStep === 'BRANCH_SELECT') return 3; // 03 READY
    return 2; // 02 BREW (Default for LOGIN and OTP_VERIFY)
  };

  const activeStage = getActiveJourneyStage();
  const isOtpFlow = authStep === 'FORGOT_PASSWORD' || authStep === 'OTP_VERIFY' || authStep === 'RESET_PASSWORD';

  // Dynamic 3D Side Image selection per auth step (consistent across all auth steps)
  const getLeftImageSrc = () => {
    switch (authStep) {
      case 'FORGOT_PASSWORD':
        return '/auth_beans_left.jpg';
      case 'OTP_VERIFY':
        return '/auth_grinding_left.jpg';
      case 'RESET_PASSWORD':
        return '/auth_brewing_left.jpg';
      case 'LOGIN':
      case 'RESET_SUCCESS':
      default:
        return '/auth_login_left.jpg';
    }
  };

  const getRightImageSrc = () => {
    switch (authStep) {
      case 'FORGOT_PASSWORD':
        return '/auth_beans_right.jpg';
      case 'OTP_VERIFY':
        return '/auth_grinding_right.jpg';
      case 'RESET_PASSWORD':
        return '/auth_brewing_right.jpg';
      case 'LOGIN':
      case 'RESET_SUCCESS':
      default:
        return '/auth_login_right.jpg';
    }
  };

  return (
    <div className="min-h-screen w-screen max-w-full overflow-y-auto lg:overflow-hidden bg-[#F8F0E3] flex flex-col justify-between relative select-none font-sans selection:bg-[#0D3B2E] selection:text-white px-3 sm:px-4 lg:px-6 pt-3 min-[380px]:pt-4 sm:pt-4 lg:pt-6 pb-2.5 sm:pb-4 lg:pb-6 pt-safe pb-safe">
      
      {/* ========================================================================= */}
      {/* 1. TOP HEADER ROW (BRANDING, "THE BREWING JOURNEY" & MICRO-BRANDING)       */}
      {/* ========================================================================= */}
      <div className="w-full flex items-center justify-between md:grid md:grid-cols-3 z-20 pb-2.5 md:pb-1.5 border-b border-[#E8DCC8] shrink-0 relative min-h-[48px] sm:min-h-[54px] gap-2">
        
        {/* TOP LEFT BRANDING */}
        <div className="flex items-center gap-2 sm:gap-3 justify-self-start min-w-0 shrink-0">
          <img 
            src="/login_logo_emblem.png" 
            alt="Kanchivaram Café Emblem" 
            className="w-8 h-6.5 min-[380px]:w-9 min-[380px]:h-7.5 sm:w-10 sm:h-8 object-contain drop-shadow-xs shrink-0"
          />
          <div className="min-w-0">
            <h1 className="text-[13px] min-[380px]:text-[14px] sm:text-base md:text-lg font-serif font-black text-[#0D3B2E] tracking-tight leading-tight whitespace-nowrap">
              Kanchivaram Café
            </h1>
            <p className="text-[8.5px] min-[380px]:text-[9.5px] md:text-[11px] font-serif text-[#5A321F] font-bold flex items-center gap-1 mt-0.5 whitespace-nowrap">
              <span>📍</span> <span>Kanchipuram, Tamil Nadu</span>
            </p>
          </div>
        </div>

        {/* TOP CENTER TITLE & SUBTITLE - STRICTLY CENTERED (DESKTOP ONLY) */}
        <div className="hidden md:flex flex-col items-center justify-center text-center justify-self-center">
          {authStep === 'BRANCH_SELECT' ? (
            <>
              <span className="text-[10.5px] font-mono font-bold tracking-[0.2em] text-[#C69A4B] uppercase block">
                WELCOME BACK!
              </span>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif font-black text-[#0D3B2E] tracking-tight uppercase -mt-0.5">
                Select Your Branch
              </h2>
              <p className="text-[11px] font-serif italic text-[#5A321F] font-semibold -mt-0.5">
                Same taste. More smiles. Choose your café.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-xl sm:text-2xl font-serif font-black text-[#0D3B2E] tracking-tight uppercase">
                THE BREWING JOURNEY
              </h2>
              <p className="text-[11px] font-serif italic text-[#5A321F] font-semibold -mt-0.5">
                Your café is ready. Let's begin.
              </p>
            </>
          )}
        </div>

        {/* TOP RIGHT MICRO BRANDING */}
        <div className="flex flex-col items-end justify-self-end text-right shrink-0 pl-1.5">
          {/* Mobile representation (< md) */}
          <div className="md:hidden flex flex-col items-end">
            <span className="text-[7.5px] min-[375px]:text-[8px] min-[400px]:text-[9px] font-mono tracking-tight min-[375px]:tracking-wider font-extrabold text-[#5A321F] uppercase whitespace-nowrap leading-tight">
              CAFÉ • PEOPLE • POSSIBILITIES
            </span>
            <div className="w-7 min-[375px]:w-8 h-0.5 bg-[#C69A4B] rounded-full mt-1"></div>
          </div>

          {/* Desktop representation (>= md: 100% frozen) */}
          <div className="hidden md:flex flex-col items-end">
            <span className="text-xs font-mono tracking-[0.2em] font-extrabold text-[#5A321F] uppercase whitespace-nowrap leading-none">
              CAFÉ • PEOPLE • POSSIBILITIES
            </span>
            <div className="w-10 h-0.5 bg-[#C69A4B] rounded-full mt-1.5"></div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 2. THE BREWING JOURNEY STEPPER BAR (01 SELECT BEANS → 02 BREW → 03 READY)   */}
      {/* ========================================================================= */}
      <div className="w-full max-w-xl mx-auto my-1 relative z-20 hidden sm:block">
        
        {/* SVG Curved Arch Connector Line */}
        <svg className="w-full h-8 absolute top-4 left-0 pointer-events-none z-0" viewBox="0 0 500 30" fill="none">
          <path d="M 50 25 Q 250 -5 450 25" stroke="#C69A4B" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
        </svg>

        {/* Stage Nodes Row */}
        <div className="flex items-center justify-between relative z-10 px-8">
          
          {/* Stage 01: SELECT BEANS */}
          <div className="flex flex-col items-center space-y-1">
            <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
              activeStage === 1
                ? 'bg-[#0D3B2E] border-[#C69A4B] text-[#FFFDF8] shadow-md scale-110'
                : 'bg-[#FFFDF8] border-[#C69A4B]/60 text-[#5A321F] shadow-xs'
            }`}>
              <Coffee className="w-5 h-5" />
            </div>
            <div className="text-center select-none">
              <span className="block text-[9.5px] font-mono font-bold text-[#C69A4B]">01</span>
              <span className={`text-[10px] font-serif font-bold tracking-wider uppercase ${
                activeStage === 1 ? 'text-[#0D3B2E]' : 'text-[#5A321F]/70'
              }`}>
                SELECT BEANS
              </span>
            </div>
          </div>

          {/* Stage 02: BREW (ACTIVE STAGE) */}
          <div className="flex flex-col items-center space-y-1">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
              activeStage === 2
                ? 'bg-[#0D3B2E] border-[#C69A4B] text-[#FFFDF8] shadow-md scale-110'
                : 'bg-[#FFFDF8] border-[#C69A4B]/60 text-[#5A321F] shadow-xs'
            }`}>
              <Sparkles className="w-5 h-5 text-[#C69A4B] animate-pulse" />
            </div>
            <div className="text-center select-none">
              <span className="block text-[9.5px] font-mono font-bold text-[#C69A4B]">02</span>
              <span className={`text-[10.5px] font-serif font-black tracking-wider uppercase ${
                activeStage === 2 ? 'text-[#0D3B2E]' : 'text-[#5A321F]/70'
              }`}>
                BREW
              </span>
            </div>
          </div>

          {/* Stage 03: READY */}
          <div className="flex flex-col items-center space-y-1">
            <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
              activeStage === 3
                ? 'bg-[#0D3B2E] border-[#C69A4B] text-[#FFFDF8] shadow-md scale-110'
                : 'bg-[#FFFDF8] border-[#C69A4B]/60 text-[#5A321F] shadow-xs'
            }`}>
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="text-center select-none">
              <span className="block text-[9.5px] font-mono font-bold text-[#C69A4B]">03</span>
              <span className={`text-[10px] font-serif font-bold tracking-wider uppercase ${
                activeStage === 3 ? 'text-[#0D3B2E]' : 'text-[#5A321F]/70'
              }`}>
                READY
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN COMPOSITION: 3D AUTHENTICATION LAYOUT OR 3D BRANCH SELECTION       */}
      {/* ========================================================================= */}
      {authStep === 'BRANCH_SELECT' ? (
        /* ------------------------------------------------------------------------- */
        /* BRANCH SELECTION PAGE: MASTER REFERENCE LAYOUT WITH 3D SLANTED CARDS     */
        /* ------------------------------------------------------------------------- */
        <div className="w-full max-w-[1440px] mx-auto my-auto flex-1 flex flex-col items-center justify-center relative z-10 py-2 px-2 sm:px-4 overflow-visible min-h-0">
          
          {/* Main Content Layout with Side Quotes Inline so Quotes Are 100% Visible */}
          <div className="w-full max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-center gap-4 lg:gap-8 relative z-10 overflow-visible">
            
            {/* Left Outer Side: Brewing Good Connections */}
            <div className="hidden xl:flex flex-col text-left space-y-2 shrink-0 select-none opacity-90 w-[175px] pl-2 overflow-visible">
              <p className="font-serif italic font-bold text-xl lg:text-2xl text-[#C69A4B] leading-tight drop-shadow-xs">
                <span className="block whitespace-nowrap">Brewing</span>
                <span className="block whitespace-nowrap">Good</span>
                <span className="block whitespace-nowrap">Connections</span>
              </p>
              <div className="w-10 h-0.5 bg-[#C69A4B]/60 rounded-full"></div>
            </div>

            {/* Main 2-Card Container */}
            <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-6 lg:gap-8 relative z-10">
              
              {/* ----------------------------------------------------------------------- */}
              {/* BRANCH 1: MAIN BRANCH (KANCHIPURAM) - HD 3D SLANT INWARD ROTATEY(10DEG) */}
              {/* ----------------------------------------------------------------------- */}
              <div className="w-full max-w-[450px] lg:max-w-[470px] bg-[#FAF6EE] border-2 border-[#0D3B2E]/30 rounded-[28px] overflow-hidden shadow-[0_25px_50px_rgba(0,0,0,0.22)] transition-all duration-500 transform [perspective:1200px] md:[transform:rotateY(10deg)_rotate(-1.5deg)] md:hover:[transform:rotateY(0deg)_rotate(0deg)] hover:scale-[1.02] flex flex-col justify-between shrink-0 relative">
                
                {/* Storefront HD Image Container */}
                <div className="h-[240px] sm:h-[260px] w-full relative overflow-hidden bg-[#EFE5D5] border-b border-[#E8D8C2]">
                  <img 
                    src="/branch_main.jpg" 
                    alt="Kanchivaram Café Main Branch Storefront HD" 
                    className="w-full h-full object-cover object-center filter contrast-[1.06] saturate-[1.08] brightness-[1.02] transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10 pointer-events-none" />
                </div>

                {/* Branch Details & Action */}
                <div className="p-6 space-y-4 text-[#241C16]">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl sm:text-2xl font-serif font-black text-[#0D3B2E]">
                        Kanchivaram Café
                      </h3>
                      <span className="text-[11px] font-bold text-white bg-[#0D3B2E] px-3 py-1 rounded-full border border-[#C69A4B]/30 shadow-xs">
                        Main Branch
                      </span>
                    </div>
                    <p className="text-xs font-serif text-[#542A16] font-semibold flex items-center gap-1 mt-1">
                      <span>📍</span> <span>Kanchipuram, Tamil Nadu</span>
                    </p>
                  </div>

                  {/* Available Services Section */}
                  <div className="pt-3 border-t border-[#E8D8C2]">
                    <p className="text-[10px] font-mono font-bold tracking-wider text-[#542A16] uppercase mb-2">
                      AVAILABLE SERVICES
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-[#F7F0E2] border border-[#E8D8C2] p-2.5 rounded-xl shadow-2xs">
                        <span className="text-sm">🍽</span>
                        <span className="block text-[11px] font-bold text-[#241C16] mt-0.5">Dine In</span>
                      </div>
                      <div className="bg-[#F7F0E2] border border-[#E8D8C2] p-2.5 rounded-xl shadow-2xs">
                        <span className="text-sm">🛍</span>
                        <span className="block text-[11px] font-bold text-[#241C16] mt-0.5">Takeaway</span>
                      </div>
                      <div className="bg-[#F7F0E2] border border-[#E8D8C2] p-2.5 rounded-xl shadow-2xs">
                        <span className="text-sm">🛵</span>
                        <span className="block text-[11px] font-bold text-[#241C16] mt-0.5">Online</span>
                      </div>
                    </div>
                  </div>

                  {/* Select Branch Button */}
                  <button
                    type="button"
                    onClick={() => {
                      authStore.selectBranch(CAFÉ_BRANCHES[0]);
                      if (onAuthSuccess) onAuthSuccess(authStore.getState());
                    }}
                    className="w-full py-3.5 bg-[#0D3B2E] hover:bg-[#07261D] text-white font-bold text-xs sm:text-sm rounded-full transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2 mt-2 group"
                  >
                    <span>SELECT BRANCH →</span>
                  </button>
                </div>

              </div>

              {/* ----------------------------------------------------------------------- */}
              {/* BRANCH 2: CITY BRANCH (CHENNAI) - HD 3D SLANT INWARD ROTATEY(-10DEG)    */}
              {/* ----------------------------------------------------------------------- */}
              <div className="w-full max-w-[450px] lg:max-w-[470px] bg-[#FAF6EE] border-2 border-[#542A16]/30 rounded-[28px] overflow-hidden shadow-[0_25px_50px_rgba(0,0,0,0.22)] transition-all duration-500 transform [perspective:1200px] md:[transform:rotateY(-10deg)_rotate(1.5deg)] md:hover:[transform:rotateY(0deg)_rotate(0deg)] hover:scale-[1.02] flex flex-col justify-between shrink-0 relative">
                
                {/* Storefront HD Image Container */}
                <div className="h-[240px] sm:h-[260px] w-full relative overflow-hidden bg-[#EFE5D5] border-b border-[#E8D8C2]">
                  <img 
                    src="/branch_city.jpg" 
                    alt="Kanchivaram Café City Branch Storefront HD" 
                    className="w-full h-full object-cover object-center filter contrast-[1.06] saturate-[1.08] brightness-[1.02] transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10 pointer-events-none" />
                </div>

                {/* Branch Details & Action */}
                <div className="p-6 space-y-4 text-[#241C16]">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl sm:text-2xl font-serif font-black text-[#542A16]">
                        Kanchivaram Café
                      </h3>
                      <span className="text-[11px] font-bold text-white bg-[#542A16] px-3 py-1 rounded-full border border-[#C69A4B]/30 shadow-xs">
                        City Branch
                      </span>
                    </div>
                    <p className="text-xs font-serif text-[#542A16] font-semibold flex items-center gap-1 mt-1">
                      <span>📍</span> <span>Kanchipuram, Tamil Nadu</span>
                    </p>
                  </div>

                  {/* Available Services Section */}
                  <div className="pt-3 border-t border-[#E8D8C2]">
                    <p className="text-[10px] font-mono font-bold tracking-wider text-[#542A16] uppercase mb-2">
                      AVAILABLE SERVICES
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-[#E8D8C2]/50 border border-[#E8D8C2] p-2.5 rounded-xl shadow-2xs">
                        <span className="text-sm">🍽</span>
                        <span className="block text-[11px] font-bold text-[#241C16] mt-0.5">Dine In</span>
                      </div>
                      <div className="bg-[#E8D8C2]/50 border border-[#E8D8C2] p-2.5 rounded-xl shadow-2xs">
                        <span className="text-sm">🛍</span>
                        <span className="block text-[11px] font-bold text-[#241C16] mt-0.5">Takeaway</span>
                      </div>
                      <div className="bg-[#E8D8C2]/50 border border-[#E8D8C2] p-2.5 rounded-xl shadow-2xs">
                        <span className="text-sm">🛵</span>
                        <span className="block text-[11px] font-bold text-[#241C16] mt-0.5">Online</span>
                      </div>
                    </div>
                  </div>

                  {/* Select Branch Button */}
                  <button
                    type="button"
                    onClick={() => {
                      authStore.selectBranch(CAFÉ_BRANCHES[1]);
                      if (onAuthSuccess) onAuthSuccess(authStore.getState());
                    }}
                    className="w-full py-3.5 bg-[#542A16] hover:bg-[#3D1E0F] text-white font-bold text-xs sm:text-sm rounded-full transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2 mt-2 group"
                  >
                    <span>SELECT BRANCH →</span>
                  </button>
                </div>

              </div>

            </div>

            {/* Right Outer Side: More Than A Café */}
            <div className="hidden xl:flex flex-col text-right space-y-2 shrink-0 select-none opacity-90 w-[175px] pr-2 overflow-visible">
              <p className="font-serif italic font-bold text-xl lg:text-2xl text-[#C69A4B] leading-tight drop-shadow-xs">
                <span className="block whitespace-nowrap">More</span>
                <span className="block whitespace-nowrap">Than</span>
                <span className="block whitespace-nowrap">A Café</span>
              </p>
              <div className="w-10 h-0.5 bg-[#C69A4B]/60 rounded-full ml-auto"></div>
            </div>

          </div>

        </div>
      ) : (
        /* ------------------------------------------------------------------------- */
        /* STANDARD 3-CARD AUTHENTICATION LAYOUT (TIGHT SPACING)                     */
        /* ------------------------------------------------------------------------- */
        <div className="w-full max-w-7xl mx-auto my-auto flex-1 flex flex-col lg:flex-row items-center justify-center gap-1.5 lg:gap-2 z-10 px-2 py-1 sm:py-2 relative min-h-0">

          {/* LEFT COLUMN: 3D PERSPECTIVE VISUAL CARD (SLANTED INWARD FACING USER) */}
          <div className="hidden lg:flex flex-col items-center justify-center z-10 p-1 shrink-0 [perspective:1200px] lg:-mr-3">
            <div className="w-[420px] h-[500px] rounded-[28px] overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.18)] border-2 border-[#E8DCC8] bg-[#EFE5D5] transition-all duration-500 transform [transform:rotateY(14deg)] pointer-events-none">
              <img 
                src={getLeftImageSrc()} 
                alt="Kanchivaram Café Left Visual" 
                className="w-full h-full object-cover transition-opacity duration-300"
              />
            </div>
          </div>

          {/* CENTER COLUMN: THE PRIMARY FLOATING REACT LOGIN / OTP CARD */}
          <div className="w-full max-w-[430px] sm:max-w-[460px] bg-[#FAF6EE] border border-[#E8DCC8] rounded-[24px] sm:rounded-[28px] p-5 sm:p-7 md:p-8 shadow-xl sm:shadow-2xl space-y-3 sm:space-y-4 text-[#2B211B] mx-auto z-20 shrink-0 relative">
            
            {/* Feedback Toast Alerts */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-xs font-bold flex items-start gap-2 animate-fadeIn shadow-xs">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && !errorMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs font-bold flex items-start gap-2 animate-fadeIn shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* DEDICATED MOBILE DUAL 3D SLANTED STORY CARDS (lg:hidden - STRICTLY ISOLATED FROM DESKTOP) */}
            <div className="lg:hidden flex items-center justify-center gap-2.5 sm:gap-4 pb-1.5 pt-0.5 select-none">
              {/* Left 3D Visual Card (Slanted inward facing User & Right Card) */}
              <div 
                style={{ transform: 'perspective(450px) rotateY(20deg) rotate(-2deg)', transformStyle: 'preserve-3d' }}
                className="flex-1 max-w-[125px] min-[390px]:max-w-[136px] sm:max-w-[155px] h-[92px] min-[390px]:h-[102px] sm:h-[125px] rounded-2xl border-2 border-[#E8DCC8] shadow-[-10px_14px_24px_rgba(0,0,0,0.22)] bg-[#EFE5D5] transition-all duration-500 relative shrink-0 overflow-hidden"
              >
                <img 
                  src={getLeftImageSrc()} 
                  alt="Kanchivaram Café Coffee Story Left" 
                  className="w-full h-full object-cover transition-opacity duration-300"
                />
              </div>

              {/* Right 3D Visual Card (Slanted inward facing User & Left Card) */}
              <div 
                style={{ transform: 'perspective(450px) rotateY(-20deg) rotate(2deg)', transformStyle: 'preserve-3d' }}
                className="flex-1 max-w-[125px] min-[390px]:max-w-[136px] sm:max-w-[155px] h-[92px] min-[390px]:h-[102px] sm:h-[125px] rounded-2xl border-2 border-[#E8DCC8] shadow-[10px_14px_24px_rgba(0,0,0,0.22)] bg-[#EFE5D5] transition-all duration-500 relative shrink-0 overflow-hidden"
              >
                <img 
                  src={getRightImageSrc()} 
                  alt="Kanchivaram Café Coffee Story Right" 
                  className="w-full h-full object-cover transition-opacity duration-300"
                />
              </div>
            </div>

            {/* STATE 1: LOGIN FORM */}
            {authStep === 'LOGIN' && (
              <div className="space-y-4">
                
                {/* Card Emblem & Titles */}
                <div className="text-center space-y-0.5">
                  <img 
                    src="/login_logo_emblem.png" 
                    alt="Kanchivaram Café Emblem" 
                    className="w-11 h-9 mx-auto object-contain mb-1 drop-shadow-xs"
                  />
                  <h2 className="text-2xl font-serif font-black text-[#0D3B2E] tracking-tight">
                    WELCOME BACK!
                  </h2>
                  <p className="text-xs font-serif text-[#5A321F] font-semibold tracking-wide">
                    Login to manage your café
                  </p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-3 pt-1">
                  
                  {/* Email Input Field */}
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7D6857]">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="Enter your email ID"
                      className="w-full pl-11 pr-4 py-3 bg-[#F5EDE0] border border-[#E2D5C3] rounded-full text-xs font-medium text-[#2B211B] placeholder-[#9E8E7E] focus:bg-white focus:ring-2 focus:ring-[#0D3B2E] focus:border-transparent focus:outline-none transition-all shadow-2xs"
                    />
                  </div>

                  {/* Password Input Field */}
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7D6857]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-11 pr-11 py-3 bg-[#F5EDE0] border border-[#E2D5C3] rounded-full text-xs font-medium text-[#2B211B] placeholder-[#9E8E7E] focus:bg-white focus:ring-2 focus:ring-[#0D3B2E] focus:border-transparent focus:outline-none transition-all shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7D6857] hover:text-[#2B211B] transition-colors p-1 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Remember Me & Forgot Password Link */}
                  <div className="flex items-center justify-between pt-0.5 text-xs px-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-3.5 h-3.5 rounded border-[#D4C5B3] text-[#0D3B2E] focus:ring-[#0D3B2E] bg-[#F5EDE0] cursor-pointer"
                      />
                      <span className="text-[11.5px] font-semibold text-[#5A321F]">Remember me</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage(null);
                        setSuccessMessage(null);
                        setAuthStep('FORGOT_PASSWORD');
                      }}
                      className="text-[11.5px] font-bold text-[#0D3B2E] hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  {/* Log In Button */}
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#0D3B2E] hover:bg-[#07261D] text-white font-semibold text-xs sm:text-sm rounded-full transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2 mt-1 group"
                  >
                    <span>Log In →</span>
                  </button>

                </form>

                {/* Divider: or */}
                <div className="relative my-2.5 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#E8DCC8]"></div>
                  </div>
                  <span className="relative bg-[#FAF6EE] px-3 text-xs font-semibold text-[#7D6857]">
                    or
                  </span>
                </div>

                {/* Google Login Button */}
                <button
                  type="button"
                  onClick={() => {
                    setSuccessMessage(null);
                    setErrorMessage('Google sign-in is not configured yet. Please log in using your registered email & password.');
                  }}
                  className="w-full py-3 bg-white hover:bg-[#FDFBF7] border border-[#E8DCC8] rounded-full text-xs font-bold text-[#2B211B] transition-all shadow-2xs hover:shadow-xs flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Login with Google</span>
                </button>

              </div>
            )}

            {/* STATE 2: FORGOT PASSWORD */}
            {authStep === 'FORGOT_PASSWORD' && (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <div className="inline-flex p-2.5 bg-[#F5EDE0] text-[#0D3B2E] rounded-2xl border border-[#E2D5C3] mb-1">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold font-serif text-[#0D3B2E]">
                    Fresh Brew, Fresh Start
                  </h2>
                  <p className="text-xs font-medium text-[#5A321F] leading-relaxed">
                    Enter your registered phone number to receive a 6-digit OTP.
                  </p>
                </div>

                <form onSubmit={handleRequestOtpSubmit} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-xs font-bold text-[#5A321F] uppercase tracking-wider mb-1">
                      REGISTERED MOBILE PHONE NUMBER
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 font-mono font-bold text-xs text-[#0D3B2E] flex items-center gap-1 border-r border-[#E2D5C3] pr-2">
                        <Phone className="w-3.5 h-3.5" />
                        <span>+91</span>
                      </div>
                      <input
                        type="tel"
                        required
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        placeholder="Enter 10-digit mobile number"
                        className="w-full pl-20 pr-4 py-3 bg-[#F5EDE0] border border-[#E2D5C3] rounded-full font-mono font-bold text-[#2B211B] placeholder-[#9E8E7E] focus:bg-white focus:ring-2 focus:ring-[#0D3B2E] focus:border-transparent focus:outline-none transition-all shadow-xs"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#0D3B2E] hover:bg-[#07261D] text-white font-semibold text-xs sm:text-sm rounded-full transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 mt-3"
                  >
                    <span>Send OTP →</span>
                  </button>
                </form>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage(null);
                      setSuccessMessage(null);
                      setAuthStep('LOGIN');
                    }}
                    className="text-xs font-bold text-[#0D3B2E] hover:underline flex items-center justify-center gap-1 mx-auto cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Login</span>
                  </button>
                </div>
              </div>
            )}

            {/* STATE 3: OTP VERIFICATION */}
            {authStep === 'OTP_VERIFY' && (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <div className="inline-flex p-2.5 bg-[#F5EDE0] text-[#0D3B2E] rounded-2xl border border-[#E2D5C3] mb-1">
                    <ShieldCheck className="w-5 h-5 text-[#0D3B2E]" />
                  </div>
                  <h2 className="text-xl font-bold font-serif text-[#0D3B2E]">
                    Almost Ready
                  </h2>
                  <p className="text-xs font-medium text-[#5A321F]">
                    Enter the 6-digit OTP sent to your mobile:
                  </p>
                  <p className="font-mono font-bold text-sm text-[#0D3B2E] bg-[#F5EDE0] py-1 px-3 rounded-xl inline-block border border-[#E2D5C3]">
                    {authState.resetState.phoneMasked || '+91 ******43210'}
                  </p>
                </div>

                <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
                  <div className="flex justify-between gap-1.5 sm:gap-2 my-2" onPaste={handleOtpPaste}>
                    {otpArray.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (otpInputRefs.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpBoxChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className="w-10 sm:w-12 h-12 text-center text-lg sm:text-xl font-mono font-bold text-[#0D3B2E] bg-white border-2 border-[#E2D5C3] rounded-2xl focus:border-[#0D3B2E] focus:ring-2 focus:ring-[#0D3B2E]/20 outline-none transition-all shadow-xs"
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#0D3B2E] hover:bg-[#07261D] text-white font-semibold text-xs sm:text-sm rounded-full transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Verify OTP →</span>
                  </button>
                </form>

                <div className="pt-2 text-center text-xs space-y-1">
                  <p className="font-medium text-[#5A321F]">Didn't receive the OTP?</p>
                  {resendTimer > 0 ? (
                    <p className="font-mono font-bold text-[#0D3B2E]">
                      Resend in 00:{resendTimer < 10 ? `0${resendTimer}` : resendTimer}
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="font-bold text-[#0D3B2E] hover:underline cursor-pointer flex items-center justify-center gap-1 mx-auto"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Resend OTP</span>
                    </button>
                  )}
                </div>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => setAuthStep('FORGOT_PASSWORD')}
                    className="text-xs font-medium text-[#5A321F] hover:text-[#2B211B] cursor-pointer"
                  >
                    Change phone number
                  </button>
                </div>
              </div>
            )}

            {/* STATE 4: UPDATE PASSWORD */}
            {authStep === 'RESET_PASSWORD' && (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <h2 className="text-xl font-bold font-serif text-[#0D3B2E]">
                    Your Brew Is Ready
                  </h2>
                  <p className="text-xs font-medium text-[#5A321F]">
                    Set a new password to continue.
                  </p>
                </div>

                <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-xs font-bold text-[#5A321F] uppercase tracking-wider mb-1">
                      NEW PASSWORD
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7D6857]" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={newPasswordInput}
                        onChange={(e) => setNewPasswordInput(e.target.value)}
                        placeholder="Enter new password"
                        className="w-full pl-11 pr-11 py-3 bg-[#F5EDE0] border border-[#E2D5C3] rounded-full font-medium text-[#2B211B] placeholder-[#9E8E7E] focus:bg-white focus:ring-2 focus:ring-[#0D3B2E] focus:border-transparent focus:outline-none transition-all shadow-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7D6857] hover:text-[#2B211B] cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#5A321F] uppercase tracking-wider mb-1">
                      CONFIRM NEW PASSWORD
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7D6857]" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPasswordInput}
                        onChange={(e) => setConfirmPasswordInput(e.target.value)}
                        placeholder="Confirm new password"
                        className="w-full pl-11 pr-11 py-3 bg-[#F5EDE0] border border-[#E2D5C3] rounded-full font-medium text-[#2B211B] placeholder-[#9E8E7E] focus:bg-white focus:ring-2 focus:ring-[#0D3B2E] focus:border-transparent focus:outline-none transition-all shadow-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7D6857] hover:text-[#2B211B] cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-[#F5EDE0] rounded-2xl border border-[#E2D5C3] space-y-1.5 text-[11px] font-medium">
                    <p className="text-[#5A321F] font-bold uppercase text-[10px]">Password Requirements:</p>
                    
                    <div className={`flex items-center gap-1.5 ${isMinLength ? 'text-emerald-800 font-bold' : 'text-[#5A321F]'}`}>
                      <Check className={`w-3.5 h-3.5 ${isMinLength ? 'text-emerald-600' : 'text-[#9E8E7E]'}`} />
                      <span>At least 8 characters long</span>
                    </div>

                    <div className={`flex items-center gap-1.5 ${hasLetterAndNumber ? 'text-emerald-800 font-bold' : 'text-[#5A321F]'}`}>
                      <Check className={`w-3.5 h-3.5 ${hasLetterAndNumber ? 'text-emerald-600' : 'text-[#9E8E7E]'}`} />
                      <span>Includes at least one letter & one number</span>
                    </div>

                    <div className={`flex items-center gap-1.5 ${isMatch ? 'text-emerald-800 font-bold' : 'text-[#5A321F]'}`}>
                      <Check className={`w-3.5 h-3.5 ${isMatch ? 'text-emerald-600' : 'text-[#9E8E7E]'}`} />
                      <span>Both password fields match</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#0D3B2E] hover:bg-[#07261D] text-white font-semibold text-xs sm:text-sm rounded-full transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 mt-3"
                  >
                    <span>Update Password →</span>
                  </button>
                </form>
              </div>
            )}

            {/* STATE 5: RESET SUCCESS */}
            {authStep === 'RESET_SUCCESS' && (
              <div className="text-center space-y-4 py-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 border-2 border-emerald-300 shadow-sm">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>

                <div className="space-y-1">
                  <h2 className="text-xl font-bold font-serif text-[#0D3B2E]">
                    BREW COMPLETE ✓
                  </h2>
                  <p className="text-xs font-medium text-[#5A321F] leading-relaxed max-w-xs mx-auto">
                    Your password has been updated successfully.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setSuccessMessage(null);
                    setPasswordInput('');
                    setAuthStep('LOGIN');
                  }}
                  className="w-full py-3.5 bg-[#0D3B2E] hover:bg-[#07261D] text-white font-semibold text-xs sm:text-sm rounded-full transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 mt-3 group"
                >
                  <span>Return to Login</span>
                  <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: 3D PERSPECTIVE VISUAL CARD (SLANTED INWARD FACING USER) */}
          <div className="hidden lg:flex flex-col items-center justify-center z-10 p-1 shrink-0 [perspective:1200px] lg:-ml-3">
            <div className="w-[420px] h-[500px] rounded-[28px] overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.18)] border-2 border-[#E8DCC8] bg-[#EFE5D5] transition-all duration-500 transform [transform:rotateY(-14deg)] pointer-events-none">
              <img 
                src={getRightImageSrc()} 
                alt="Kanchivaram Café Right Visual" 
                className="w-full h-full object-cover transition-opacity duration-300"
              />
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. BOTTOM BRANDING FOOTER (STRICTLY CENTERED & CLEARLY VISIBLE)           */}
      {/* ========================================================================= */}
      <div className="w-full text-center z-30 pointer-events-none pb-2 pt-1 shrink-0 flex items-center justify-center">
        <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-mono tracking-[0.25em] font-bold text-[#4A2C1A] uppercase bg-[#F8F0E3]/95 px-5 py-1.5 rounded-full border border-[#E8DCC8]/80 shadow-xs">
          <span>GOOD FOOD HAPPIER PEOPLE</span>
          <span className="text-red-700 text-xs sm:text-sm">♥</span>
        </div>
      </div>

    </div>
  );
}
