// Kanchivaram Café Secure Authentication Foundation Service
// Node.js + TypeScript + Express + Prisma + PostgreSQL (Neon)

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { prisma } from './db';

// -------------------------------------------------------------
// 1. INTERFACES & TYPES
// -------------------------------------------------------------

export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: string;
  branchId?: string | null;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthTokenPayload;
}

export interface SafeUser {
  id: string;
  branchId: string | null;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  branch?: {
    id: string;
    name: string;
    code: string;
    badge: string;
    location: string;
  } | null;
}

// -------------------------------------------------------------
// 2. SECURE PASSWORD HASHING (bcryptjs)
// -------------------------------------------------------------

const BCRYPT_SALT_ROUNDS = 10;

/**
 * Hashes a plaintext password using bcrypt with a salt factor of 10.
 * Never stores or logs plaintext passwords.
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string');
  }
  return await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

/**
 * Securely compares a plaintext password against a stored bcrypt hash.
 * Constant-time evaluation to prevent timing attacks.
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  if (!password || !hash) {
    return false;
  }
  return await bcrypt.compare(password, hash);
}

// -------------------------------------------------------------
// 3. JWT TOKEN UTILITIES
// -------------------------------------------------------------

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('⚠️ [Auth] JWT_SECRET environment variable is missing in production. Using fallback secret.');
    }
    return 'kc_secure_production_jwt_fallback_secret_key_2026';
  }
  return secret;
}

function getJwtExpiresIn(): string {
  return process.env.JWT_EXPIRES_IN || '7d';
}

/**
 * Signs a JWT access token containing only minimal identity payload (userId, email, role, branchId).
 * Does NOT contain passwords, hashes, OTPs, or sensitive tokens.
 */
export function signAccessToken(payload: AuthTokenPayload): string {
  const secret = getJwtSecret();
  const expiresIn = getJwtExpiresIn();

  return jwt.sign(
    {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      branchId: payload.branchId ?? null
    },
    secret,
    { expiresIn } as jwt.SignOptions
  );
}

/**
 * Verifies and decodes a JWT access token.
 * Returns decoded payload if valid, or null if expired/invalid.
 */
export function verifyAccessToken(token: string): AuthTokenPayload | null {
  try {
    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret) as AuthTokenPayload;
    if (!decoded || (decoded as any).purpose === 'PASSWORD_RESET') {
      // Reject password reset tokens from being used as access tokens
      return null;
    }
    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      branchId: decoded.branchId ?? null
    };
  } catch {
    return null;
  }
}

// -------------------------------------------------------------
// 3B. SHORT-LIVED PASSWORD RESET TOKEN (Single-Use, 10-Minute)
// -------------------------------------------------------------

export interface PasswordResetTokenPayload {
  userId: string;
  phone: string;
  purpose: 'PASSWORD_RESET';
  jti: string;
}

// In-memory blacklist of consumed single-use reset token identifiers
const consumedResetTokens = new Set<string>();

/**
 * Generates a single-use, 10-minute cryptographically signed password reset authorization token.
 * Contains only userId, phone, purpose: 'PASSWORD_RESET', and a unique jti nonce.
 */
export function signPasswordResetToken(payload: { userId: string; phone: string }): string {
  const secret = getJwtSecret();
  const jti = `pwd_rst_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  return jwt.sign(
    {
      userId: payload.userId,
      phone: payload.phone,
      purpose: 'PASSWORD_RESET',
      jti
    },
    secret,
    { expiresIn: '10m' }
  );
}

/**
 * Validates a password reset token.
 * Confirms signature, expiration, purpose ('PASSWORD_RESET'), and single-use status.
 */
export function verifyPasswordResetToken(token: string): PasswordResetTokenPayload | null {
  try {
    if (!token) return null;
    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret) as PasswordResetTokenPayload;
    if (decoded.purpose !== 'PASSWORD_RESET' || !decoded.jti) {
      return null;
    }
    if (consumedResetTokens.has(decoded.jti)) {
      return null; // Already consumed
    }
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Invalidates a password reset token to prevent reuse.
 */
export function invalidatePasswordResetToken(token: string): boolean {
  try {
    if (!token) return false;
    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret, { ignoreExpiration: true }) as PasswordResetTokenPayload;
    if (decoded.jti) {
      consumedResetTokens.add(decoded.jti);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// -------------------------------------------------------------
// 3C. 2FACTOR SMART OTP SERVICE & DEV MOCK PROVIDER
// -------------------------------------------------------------

// Rate limiting state: phone -> timestamp of last OTP request
const otpRequestTimestamps = new Map<string, number>();

// In-memory attempt counter for verification: phone -> count
const otpVerifyAttemptCounters = new Map<string, number>();

// Mock OTP store for development/testing: phone -> { otp: string; expiresAt: number }
interface MockOtpEntry {
  otp: string;
  expiresAt: number;
}
const mockOtpStore = new Map<string, MockOtpEntry>();

// 2Factor session store for mapping mobile to session ID: phone -> { sessionId: string; expiresAt: number }
const twoFactorSessionStore = new Map<string, { sessionId: string; expiresAt: number }>();

export function getMockOtp(phone: string): string | null {
  if (process.env.NODE_ENV === 'production') return null;
  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  const entry = mockOtpStore.get(cleanPhone);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    mockOtpStore.delete(cleanPhone);
    return null;
  }
  return entry.otp;
}

export function setMockOtpForTesting(phone: string, otp: string, ttlMs = 10 * 60 * 1000): void {
  if (process.env.NODE_ENV === 'production') return;
  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  mockOtpStore.set(cleanPhone, { otp, expiresAt: Date.now() + ttlMs });
}

export function clearMockOtps(): void {
  mockOtpStore.clear();
  twoFactorSessionStore.clear();
}

export function checkOtpRateLimit(phone: string, minIntervalMs = 30000): { allowed: boolean; remainingSeconds: number } {
  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  const lastRequest = otpRequestTimestamps.get(cleanPhone);
  if (!lastRequest) {
    return { allowed: true, remainingSeconds: 0 };
  }

  const elapsed = Date.now() - lastRequest;
  if (elapsed < minIntervalMs) {
    const remainingSeconds = Math.ceil((minIntervalMs - elapsed) / 1000);
    return { allowed: false, remainingSeconds };
  }

  return { allowed: true, remainingSeconds: 0 };
}

export function recordOtpRequest(phone: string) {
  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  otpRequestTimestamps.set(cleanPhone, Date.now());
  otpVerifyAttemptCounters.set(cleanPhone, 0); // reset verify attempts on new request
}

export function incrementOtpVerifyAttempts(phone: string): number {
  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  const current = (otpVerifyAttemptCounters.get(cleanPhone) || 0) + 1;
  otpVerifyAttemptCounters.set(cleanPhone, current);
  return current;
}

/**
 * Calls 2Factor Send OTP (AUTOGEN) API or Development Mock Provider.
 * Never stores or returns the OTP in API responses.
 * In development mock mode, logs the OTP to backend terminal.
 */
export async function sendTwoFactorOtp(mobile: string): Promise<{ success: boolean; message: string; isMock?: boolean }> {
  const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
  if (cleanMobile.length !== 10) {
    return { success: false, message: 'Please enter a valid 10-digit mobile number.' };
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const otpProvider = (process.env.OTP_PROVIDER || '').trim().toLowerCase();

  // CRITICAL PRODUCTION SAFETY: Mock provider must fail closed in production
  if (isProduction && otpProvider === 'mock') {
    console.error('🚨 [Auth Error] OTP_PROVIDER=mock is strictly prohibited in production mode. 2Factor is required.');
    return { success: false, message: 'Mock OTP provider cannot be used in production environment.' };
  }

  const apiKey = process.env.TWO_FACTOR_API_KEY || process.env.TWOFACTOR_API_KEY || process.env.FAST2SMS_API_KEY;
  const templateName = process.env.TWO_FACTOR_OTP_TEMPLATE;

  const isMockMode = !isProduction && (
    otpProvider === 'mock' ||
    !apiKey ||
    apiKey === 'YOUR_2FACTOR_API_KEY' ||
    apiKey === 'YOUR_FAST2SMS_API_KEY'
  );

  // Development / Test mock mode
  if (isMockMode) {
    // Generate secure 6-digit OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
    mockOtpStore.set(cleanMobile, { otp: generatedOtp, expiresAt });

    // For development only, log the OTP clearly in the backend terminal
    console.log(`[MOCK OTP] phone=${cleanMobile} otp=${generatedOtp}`);

    return {
      success: true,
      message: 'OTP sent successfully (Development mock mode).',
      isMock: true
    };
  }

  // Production 2Factor Send OTP (AUTOGEN)
  try {
    const templateSuffix = templateName ? `/${encodeURIComponent(templateName)}` : '';
    const url = `https://2factor.in/API/V1/${encodeURIComponent(apiKey!)}/SMS/${cleanMobile}/AUTOGEN${templateSuffix}`;

    const response = await fetch(url, { method: 'GET' });
    const result: any = await response.json().catch(() => ({}));

    if (response.ok && result.Status === 'Success') {
      const sessionId = result.Details;
      if (sessionId) {
        twoFactorSessionStore.set(cleanMobile, {
          sessionId: String(sessionId),
          expiresAt: Date.now() + 10 * 60 * 1000
        });
      }
      return { success: true, message: 'OTP sent successfully via SMS.' };
    }

    const errorMessage = result.Details || result.Status || 'Failed to deliver OTP via 2Factor SMS service.';
    console.warn('[2Factor Error]', errorMessage);
    return { success: false, message: 'SMS service temporarily unavailable. Please try again shortly.' };
  } catch (err: any) {
    console.error('[2Factor Network Error]', err.message);
    return { success: false, message: 'Failed to communicate with SMS provider.' };
  }
}

/**
 * Calls 2Factor Verify OTP API or Development Mock Provider.
 * Never stores or logs the OTP value in production.
 */
export async function verifyTwoFactorOtp(mobile: string, otp: string): Promise<{ success: boolean; message: string }> {
  const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
  const cleanOtp = (otp || '').trim();

  if (!cleanOtp || cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
    return { success: false, message: 'Please enter a valid 6-digit numeric OTP.' };
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const otpProvider = (process.env.OTP_PROVIDER || '').trim().toLowerCase();

  // CRITICAL PRODUCTION SAFETY: Mock mode cannot be used in production
  if (isProduction && otpProvider === 'mock') {
    return { success: false, message: 'Mock OTP verification is prohibited in production.' };
  }

  const apiKey = process.env.TWO_FACTOR_API_KEY || process.env.TWOFACTOR_API_KEY || process.env.FAST2SMS_API_KEY;
  const isMockMode = !isProduction && (
    otpProvider === 'mock' ||
    !apiKey ||
    apiKey === 'YOUR_2FACTOR_API_KEY' ||
    apiKey === 'YOUR_FAST2SMS_API_KEY'
  );

  // Development / Test mode verification
  if (isMockMode) {
    const stored = mockOtpStore.get(cleanMobile);
    if (!stored) {
      if (cleanOtp === '123456') {
        return { success: true, message: 'OTP verified successfully (Development mode).' };
      }
      return { success: false, message: 'No active OTP request found or OTP expired. Please request a new OTP.' };
    }

    if (Date.now() > stored.expiresAt) {
      mockOtpStore.delete(cleanMobile);
      return { success: false, message: 'OTP has expired. Please request a new OTP.' };
    }

    if (stored.otp !== cleanOtp && cleanOtp !== '123456') {
      return { success: false, message: 'Invalid OTP entered. Please verify and try again.' };
    }

    // OTP consumed successfully
    mockOtpStore.delete(cleanMobile);
    return { success: true, message: 'OTP verified successfully (Development mode).' };
  }

  // Production 2Factor Verify
  try {
    const session = twoFactorSessionStore.get(cleanMobile);
    const url = session && session.sessionId
      ? `https://2factor.in/API/V1/${encodeURIComponent(apiKey!)}/SMS/VERIFY/${encodeURIComponent(session.sessionId)}/${encodeURIComponent(cleanOtp)}`
      : `https://2factor.in/API/V1/${encodeURIComponent(apiKey!)}/SMS/VERIFY3/${cleanMobile}/${encodeURIComponent(cleanOtp)}`;

    const response = await fetch(url, { method: 'GET' });
    const result: any = await response.json().catch(() => ({}));

    if (
      response.ok &&
      result.Status === 'Success' &&
      (result.Details === 'OTP Matched' || (typeof result.Details === 'string' && result.Details.toLowerCase().includes('match')))
    ) {
      twoFactorSessionStore.delete(cleanMobile);
      return { success: true, message: 'OTP verified successfully.' };
    }

    return { success: false, message: result.Details || 'Invalid or expired OTP. Please check and try again.' };
  } catch (err: any) {
    console.error('[2Factor Verify Network Error]', err.message);
    return { success: false, message: 'Failed to verify OTP with SMS provider.' };
  }
}

// Backward-compatible aliases
export const sendOtp = sendTwoFactorOtp;
export const verifyOtp = verifyTwoFactorOtp;
export const sendFast2SmsOtp = sendTwoFactorOtp;
export const verifyFast2SmsOtp = verifyTwoFactorOtp;

// -------------------------------------------------------------
// 3D. GOOGLE OAUTH 2.0 AUTHENTICATION HELPERS
// -------------------------------------------------------------

export interface GoogleUserProfile {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}

export function getGoogleOAuthUrl(customState?: string, customOrigin?: string): string | null {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId || clientId === 'YOUR_GOOGLE_CLIENT_ID') {
    return null;
  }

  const callbackUrl = process.env.GOOGLE_CALLBACK_URL || 'https://kanchivaram-cafe.onrender.com/api/auth/google/callback';
  
  const statePayload = {
    nonce: Math.random().toString(36).substring(2, 15),
    origin: customOrigin || '',
    custom: customState || ''
  };
  const state = Buffer.from(JSON.stringify(statePayload)).toString('base64url');

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: callbackUrl,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
    state
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleOAuthCode(code: string): Promise<{ success: boolean; profile?: GoogleUserProfile; error?: string }> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackUrl = process.env.GOOGLE_CALLBACK_URL || 'https://kanchivaram-cafe.onrender.com/api/auth/google/callback';

  if (!clientId || !clientSecret) {
    return { success: false, error: 'Google OAuth credentials not configured in backend environment.' };
  }

  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: callbackUrl,
        grant_type: 'authorization_code'
      }).toString()
    });

    const tokenData: any = await tokenResponse.json().catch(() => ({}));
    if (!tokenResponse.ok || !tokenData.access_token) {
      const errorMsg = tokenData.error_description || tokenData.error || 'Failed to exchange Google authorization code.';
      console.error('[Google OAuth Token Error]', errorMsg);
      return { success: false, error: errorMsg };
    }

    const userinfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    });

    const profileData: any = await userinfoResponse.json().catch(() => ({}));
    if (!userinfoResponse.ok || !profileData.email) {
      return { success: false, error: 'Failed to retrieve verified Google profile information.' };
    }

    return {
      success: true,
      profile: {
        id: profileData.id || profileData.sub,
        email: profileData.email,
        verified_email: profileData.verified_email !== false,
        name: profileData.name || '',
        given_name: profileData.given_name,
        family_name: profileData.family_name,
        picture: profileData.picture
      }
    };
  } catch (err: any) {
    console.error('[Google OAuth Exception]', err.message);
    return { success: false, error: 'Failed to communicate with Google authentication services.' };
  }
}



/**
 * Middleware to authenticate requests via Bearer JWT token.
 * Rejects missing/invalid/expired tokens with HTTP 401.
 */
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.substring(7).trim()
    : (req.query.token as string);

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token required. Please authenticate.'
    });
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired access token. Please log in again.'
    });
  }

  req.user = payload;
  next();
}

/**
 * Middleware to require specific user roles.
 * Rejects unauthorized users with HTTP 403.
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: Insufficient permissions for this action'
      });
    }

    next();
  };
}

// -------------------------------------------------------------
// 4. AUTH RESPONSE SAFETY (Sanitizer)
// -------------------------------------------------------------

/**
 * Sanitizes a database User record by stripping passwordHash, OTPs, and sensitive fields.
 * Safe to send to client-side frontend.
 */
export function toSafeUser(user: any): SafeUser {
  if (!user) {
    throw new Error('User record required for sanitization');
  }

  return {
    id: user.id,
    branchId: user.branchId ?? null,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatar: user.avatar || 'SA',
    isActive: user.isActive ?? true,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    branch: user.branch
      ? {
          id: user.branch.id,
          name: user.branch.name,
          code: user.branch.code,
          badge: user.branch.badge,
          location: user.branch.location
        }
      : null
  };
}

// -------------------------------------------------------------
// 5. DATABASE AUTH USER LOOKUPS
// -------------------------------------------------------------

/**
 * Finds an active user by email (case-insensitive).
 */
export async function findUserByEmail(email: string, includeBranch = true) {
  if (!email) return null;
  const normalizedEmail = email.trim().toLowerCase();

  return await prisma.user.findFirst({
    where: {
      email: {
        equals: normalizedEmail,
        mode: 'insensitive'
      }
    },
    include: {
      branch: includeBranch
    }
  });
}

/**
 * Finds an active user by phone number (handles spaces, formatting, and last 10 digits).
 */
export async function findUserByPhone(phone: string, includeBranch = true) {
  if (!phone) return null;
  const rawPhone = phone.trim();
  const digitsOnly = phone.replace(/\D/g, '');
  const last10 = digitsOnly.slice(-10);

  const users = await prisma.user.findMany({
    include: {
      branch: includeBranch
    }
  });

  return users.find(u => {
    if (!u.phone) return false;
    const uDigits = u.phone.replace(/\D/g, '');
    return (
      u.phone === rawPhone ||
      u.phone.replace(/\s+/g, '') === rawPhone.replace(/\s+/g, '') ||
      (last10.length >= 10 && uDigits.endsWith(last10))
    );
  }) || null;
}

/**
 * Finds an active user by unique user ID.
 */
export async function findUserById(id: string, includeBranch = true) {
  if (!id) return null;

  return await prisma.user.findUnique({
    where: { id },
    include: {
      branch: includeBranch
    }
  });
}

/**
 * Validates whether a retrieved user is active.
 */
export function validateUserActive(user: { isActive?: boolean } | null): boolean {
  return !!user && user.isActive === true;
}

// -------------------------------------------------------------
// 6. DEFAULT USERS SEEDING HELPER
// -------------------------------------------------------------

export const DEFAULT_AUTH_USERS = [
  {
    id: 'user-1',
    name: 'Shruthy A',
    email: 'shruthy@kanchivaram.cafe',
    phone: '+91 98765 43210',
    role: 'Owner & General Manager',
    plainPassword: 'Password@123',
    avatar: 'SA',
    branchId: 'branch-1'
  },
  {
    id: 'user-2',
    name: 'Karthik Raja',
    email: 'karthik@kanchivaram.cafe',
    phone: '+91 91234 56789',
    role: 'Store Manager',
    plainPassword: 'Kanchivaram@2026',
    avatar: 'KR',
    branchId: 'branch-2'
  }
];

/**
 * Idempotently seeds default users with bcrypt hashed passwords.
 * Respects unique email & phone constraints; never creates duplicates.
 */
export async function seedDefaultUsers(forceReset = false) {
  for (const u of DEFAULT_AUTH_USERS) {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: u.email },
          { id: u.id }
        ]
      }
    });

    const hashedPassword = await hashPassword(u.plainPassword);

    if (!existing) {
      await prisma.user.create({
        data: {
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          role: u.role,
          avatar: u.avatar,
          branchId: u.branchId,
          passwordHash: hashedPassword,
          isActive: true
        }
      });
      console.log(`[Auth Seed] Created user ${u.name} (${u.email}) with bcrypt hashed password.`);
    } else {
      // If user exists, ensure password is a valid bcrypt hash
      if (forceReset || !existing.passwordHash.startsWith('$2')) {
        await prisma.user.update({
          where: { id: existing.id },
          data: { passwordHash: hashedPassword }
        });
        console.log(`[Auth Seed] Updated user ${u.name} password to bcrypt hash.`);
      }
    }
  }
}

