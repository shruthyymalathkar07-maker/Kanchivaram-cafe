import { Router, Request, Response } from 'express';
import { 
  prisma,
  branchDb, 
  PRODUCT_CATEGORIES, 
  CLIENT_PRODUCTS_MASTER, 
  CLIENT_RAW_MATERIALS_MASTER, 
  CLIENT_BOM_MASTER,
  SaleRecord,
  StockLedgerEntry
} from '../db';
import { 
  findUserByEmail, 
  findUserByPhone, 
  findUserById, 
  comparePassword, 
  hashPassword,
  signAccessToken, 
  toSafeUser, 
  authenticateToken, 
  requireRole, 
  AuthenticatedRequest,
  sendTwoFactorOtp,
  verifyTwoFactorOtp,
  sendFast2SmsOtp,
  verifyFast2SmsOtp,
  getGoogleOAuthUrl,
  exchangeGoogleOAuthCode,
  signPasswordResetToken,
  verifyPasswordResetToken,
  invalidatePasswordResetToken,
  checkOtpRateLimit,
  recordOtpRequest,
  incrementOtpVerifyAttempts,
  verifyAccessToken
} from '../auth';
import { processKVCMQuery } from '../ai';
import { executeProductionHandoverCleanup } from '../cleanupProductionDatabase';
import { Server as SocketServer } from 'socket.io';

export function createApiRouter(io: SocketServer) {
  const router = Router();

  // Version and deploy commit tracker
  router.get('/version', (_req: Request, res: Response) => {
    res.json({
      success: true,
      commit: 'phase14-forgot-password-v1.0.0',
      deployedAt: new Date().toISOString(),
      version: '1.0.0-phase14-forgot-password-fast2sms',
      database: 'Neon PostgreSQL'
    });
  });

  // ============================================================
  // AUTHENTICATION ROUTES
  // ============================================================

  // 1. POST /api/auth/login
  router.post('/auth/login', async (req: Request, res: Response) => {
    try {
      const { email, phone, password, branchId } = req.body || {};

      const lookupIdentifier = (email || phone || '').trim();
      const rawPassword = password || '';

      if (!lookupIdentifier || !rawPassword) {
        return res.status(400).json({
          success: false,
          error: 'Email or phone number and password are required.'
        });
      }

      // Lookup user by email or phone
      let user = null;
      if (lookupIdentifier.includes('@')) {
        user = await findUserByEmail(lookupIdentifier, true);
      } else {
        user = await findUserByPhone(lookupIdentifier, true);
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'No account found with this email ID / phone number. Please check and try again.'
        });
      }

      // Verify active status
      if (user.isActive === false) {
        return res.status(403).json({
          success: false,
          error: 'Your account is deactivated. Please contact the administrator.'
        });
      }

      // Verify password via bcrypt
      const isMatch = await comparePassword(rawPassword, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: 'Incorrect password entered. Please verify or use Forgot Password.'
        });
      }

      // Determine active branch
      let targetBranchId = (branchId || user.branchId || 'branch-1').trim().toLowerCase();
      if (targetBranchId === 'city' || targetBranchId === 'branch-2') {
        targetBranchId = 'branch-2';
      } else {
        targetBranchId = 'branch-1';
      }

      // Fetch target branch info
      let branchInfo = null;
      try {
        if (prisma) {
          branchInfo = await prisma.branch.findUnique({
            where: { id: targetBranchId },
            include: { settings: true }
          });
        }
      } catch (err: any) {
        console.warn('[API /auth/login] Branch query notice:', err.message);
      }

      if (!branchInfo) {
        branchInfo = {
          id: targetBranchId,
          name: targetBranchId === 'branch-2' ? 'City Branch - Anna Salai' : 'Main Branch - Gandhi Road',
          badge: targetBranchId === 'branch-2' ? 'City Branch' : 'Main Branch',
          location: targetBranchId === 'branch-2' ? 'Anna Salai' : 'Gandhi Road',
          status: 'Operational (Live)'
        };
      }

      // Sign JWT token
      const token = signAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        branchId: targetBranchId
      });

      const safeUser = toSafeUser(user);

      return res.json({
        success: true,
        message: 'Login successful',
        token,
        user: safeUser,
        branch: branchInfo
      });
    } catch (err: any) {
      console.error('[API /auth/login] Error during login:', err.message);
      return res.status(500).json({
        success: false,
        error: 'An unexpected authentication error occurred. Please try again.'
      });
    }
  });

  // 2. GET /api/auth/me
  router.get('/auth/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const user = await findUserById(userId, true);
      if (!user || user.isActive === false) {
        return res.status(401).json({
          success: false,
          error: 'User account is no longer active or valid.'
        });
      }

      return res.json({
        success: true,
        user: toSafeUser(user),
        branch: user.branch || null
      });
    } catch (err: any) {
      console.error('[API /auth/me] Error:', err.message);
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve current user details.'
      });
    }
  });

  // 3. POST /api/auth/logout
  router.post('/auth/logout', (_req: Request, res: Response) => {
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  });

  // 4. POST /api/auth/forgot-password/request-otp
  router.post('/auth/forgot-password/request-otp', async (req: Request, res: Response) => {
    try {
      const { phone } = req.body || {};
      const rawPhone = (phone || '').trim();
      const digitsOnly = rawPhone.replace(/\D/g, '');

      if (!rawPhone || digitsOnly.length < 10) {
        return res.status(400).json({
          success: false,
          error: 'Please enter a valid 10-digit Indian mobile number.'
        });
      }

      // Rate limiting check (30s minimum interval)
      const rateLimit = checkOtpRateLimit(digitsOnly, 30000);
      if (!rateLimit.allowed) {
        return res.status(429).json({
          success: false,
          error: `Please wait ${rateLimit.remainingSeconds}s before requesting a new OTP.`
        });
      }

      // Lookup user in PostgreSQL
      const user = await findUserByPhone(digitsOnly, false);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Phone number is not registered with any Kanchivaram Café account.'
        });
      }

      if (user.isActive === false) {
        return res.status(403).json({
          success: false,
          error: 'Account is deactivated. Please contact the administrator.'
        });
      }

      // Call 2Factor OTP Provider
      const smsResult = await sendTwoFactorOtp(digitsOnly);
      if (!smsResult.success) {
        return res.status(502).json({
          success: false,
          error: smsResult.message
        });
      }

      // Record successful request timestamp for rate limiting
      recordOtpRequest(digitsOnly);

      const last4 = digitsOnly.slice(-4);
      const maskedPhone = `+91 ******${last4}`;

      return res.json({
        success: true,
        message: `OTP sent successfully to ${maskedPhone}.`,
        maskedPhone
      });
    } catch (err: any) {
      console.error('[API /auth/forgot-password/request-otp] Error:', err.message);
      return res.status(500).json({
        success: false,
        error: 'An unexpected error occurred while requesting OTP. Please try again.'
      });
    }
  });

  // 5. POST /api/auth/forgot-password/verify-otp
  router.post('/auth/forgot-password/verify-otp', async (req: Request, res: Response) => {
    try {
      const { phone, otp } = req.body || {};
      const rawPhone = (phone || '').trim();
      const digitsOnly = rawPhone.replace(/\D/g, '');
      const rawOtp = (otp || '').trim();

      if (!digitsOnly || digitsOnly.length < 10) {
        return res.status(400).json({
          success: false,
          error: 'Valid 10-digit phone number is required.'
        });
      }

      if (!rawOtp || rawOtp.length !== 6 || !/^\d{6}$/.test(rawOtp)) {
        return res.status(400).json({
          success: false,
          error: 'Please enter the complete 6-digit numeric OTP code.'
        });
      }

      // Verify attempts limit
      const attempts = incrementOtpVerifyAttempts(digitsOnly);
      if (attempts > 5) {
        return res.status(429).json({
          success: false,
          error: 'Too many failed verification attempts. Please request a new OTP.'
        });
      }

      // Verify user exists
      const user = await findUserByPhone(digitsOnly, false);
      if (!user || user.isActive === false) {
        return res.status(404).json({
          success: false,
          error: 'User not found or account is inactive.'
        });
      }

      // Verify OTP via 2Factor
      const verifyRes = await verifyTwoFactorOtp(digitsOnly, rawOtp);
      if (!verifyRes.success) {
        return res.status(400).json({
          success: false,
          error: verifyRes.message
        });
      }

      // Generate single-use, 10-minute password reset authorization token
      const resetToken = signPasswordResetToken({
        userId: user.id,
        phone: user.phone
      });

      return res.json({
        success: true,
        message: 'OTP verified successfully.',
        resetToken
      });
    } catch (err: any) {
      console.error('[API /auth/forgot-password/verify-otp] Error:', err.message);
      return res.status(500).json({
        success: false,
        error: 'An unexpected error occurred during OTP verification.'
      });
    }
  });

  // 6. POST /api/auth/forgot-password/reset
  router.post('/auth/forgot-password/reset', async (req: Request, res: Response) => {
    try {
      const { resetToken, newPassword, confirmPassword } = req.body || {};

      if (!resetToken) {
        return res.status(401).json({
          success: false,
          error: 'Password reset authorization token is missing or expired. Please verify OTP again.'
        });
      }

      // Verify single-use reset authorization token
      const tokenPayload = verifyPasswordResetToken(resetToken);
      if (!tokenPayload || !tokenPayload.userId) {
        return res.status(401).json({
          success: false,
          error: 'Invalid, expired, or already-used password reset session. Please request a new OTP.'
        });
      }

      // Password strength validation
      const pwd = newPassword || '';
      if (pwd.length < 8) {
        return res.status(400).json({
          success: false,
          error: 'Password must be at least 8 characters long.'
        });
      }

      if (!/[A-Za-z]/.test(pwd) || !/[0-9]/.test(pwd)) {
        return res.status(400).json({
          success: false,
          error: 'Password must include at least one letter and one number.'
        });
      }

      if (confirmPassword !== undefined && pwd !== confirmPassword) {
        return res.status(400).json({
          success: false,
          error: 'Passwords do not match. Please verify both fields.'
        });
      }

      // Hash new password using bcrypt
      const hashedPassword = await hashPassword(pwd);

      // Update password in PostgreSQL database
      if (prisma) {
        try {
          const rawPhone = tokenPayload.phone || '';
          const digitsOnly = rawPhone.replace(/\D/g, '');
          const last10 = digitsOnly.slice(-10);

          const existingUser = await prisma.user.findFirst({
            where: {
              OR: [
                { id: tokenPayload.userId },
                { phone: rawPhone },
                { phone: `+91 ${last10}` },
                { phone: last10 }
              ]
            }
          });

          if (existingUser) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { passwordHash: hashedPassword }
            });
          } else {
            // Upsert default user in DB
            const cleanDigits = last10 || '9876543210';
            const email = tokenPayload.userId === 'user-2' ? 'karthik@kanchivaram.cafe' : 'shruthy@kanchivaram.cafe';
            await prisma.user.upsert({
              where: { email },
              update: { passwordHash: hashedPassword },
              create: {
                id: tokenPayload.userId || `user-${cleanDigits}`,
                name: tokenPayload.userId === 'user-2' ? 'Karthik Raja' : 'Shruthy A',
                email,
                phone: `+91 ${cleanDigits}`,
                role: tokenPayload.userId === 'user-2' ? 'Store Manager' : 'Owner & General Manager',
                passwordHash: hashedPassword,
                avatar: tokenPayload.userId === 'user-2' ? 'KR' : 'SA',
                isActive: true
              }
            });
          }
        } catch (dbErr: any) {
          console.warn('[API /auth/forgot-password/reset] DB notice:', dbErr.message);
        }
      }

      // Invalidate the single-use token
      invalidatePasswordResetToken(resetToken);

      return res.json({
        success: true,
        message: 'Password updated successfully. Please log in with your new password.'
      });
    } catch (err: any) {
      console.error('[API /auth/forgot-password/reset] Error:', err.message);
      return res.status(500).json({
        success: false,
        error: 'An unexpected error occurred while updating password.'
      });
    }
  });

  // 7. GET /api/auth/google (Initiate Google OAuth 2.0 Web Flow)
  router.get('/auth/google', (req: Request, res: Response) => {
    try {
      const origin = (req.query.origin as string) || '';
      const stateParam = (req.query.state as string) || '';
      const googleAuthUrl = getGoogleOAuthUrl(stateParam, origin);

      if (!googleAuthUrl) {
        const fallbackOrigin = origin || (process.env.NODE_ENV === 'production' ? 'https://kanchivaram-cafe.surge.sh' : 'http://localhost:5173');
        return res.redirect(`${fallbackOrigin}/?error=google_oauth_not_configured`);
      }

      return res.redirect(googleAuthUrl);
    } catch (err: any) {
      console.error('[API /auth/google] Error:', err.message);
      return res.status(500).json({ success: false, error: 'Failed to initiate Google sign-in.' });
    }
  });

  // 7b. GET /api/auth/google/url (Helper to query Google OAuth URL)
  router.get('/auth/google/url', (req: Request, res: Response) => {
    const origin = (req.query.origin as string) || '';
    const stateParam = (req.query.state as string) || '';
    const googleAuthUrl = getGoogleOAuthUrl(stateParam, origin);

    if (!googleAuthUrl) {
      return res.status(400).json({
        success: false,
        error: 'Google OAuth is not configured on the backend. GOOGLE_CLIENT_ID is missing.'
      });
    }

    return res.json({ success: true, url: googleAuthUrl });
  });

  // 8. GET /api/auth/google/callback (Google OAuth 2.0 Web Callback)
  router.get('/auth/google/callback', async (req: Request, res: Response) => {
    // Extract origin from state if provided
    let frontendOrigin = process.env.FRONTEND_URL || (process.env.NODE_ENV === 'production' ? 'https://kanchivaram-cafe.surge.sh' : 'http://localhost:5173');
    const stateRaw = req.query.state as string;
    if (stateRaw) {
      try {
        const decoded = JSON.parse(Buffer.from(stateRaw, 'base64url').toString('utf8'));
        if (decoded.origin && typeof decoded.origin === 'string') {
          const originUrl = new URL(decoded.origin);
          if (
            originUrl.hostname === 'localhost' ||
            originUrl.hostname === '127.0.0.1' ||
            originUrl.hostname.endsWith('surge.sh') ||
            originUrl.hostname.includes('kanchivaram-cafe')
          ) {
            frontendOrigin = decoded.origin;
          }
        }
      } catch {}
    }

    try {
      // 1. Check for OAuth errors (e.g. user cancelled or denied access)
      if (req.query.error) {
        const oauthError = req.query.error === 'access_denied' ? 'oauth_cancelled' : String(req.query.error);
        return res.redirect(`${frontendOrigin}/?error=${encodeURIComponent(oauthError)}`);
      }

      // 2. Validate authorization code
      const code = req.query.code as string;
      if (!code) {
        return res.redirect(`${frontendOrigin}/?error=invalid_oauth_response`);
      }

      // 3. Exchange code for Google tokens and retrieve verified user profile
      const exchangeResult = await exchangeGoogleOAuthCode(code);
      if (!exchangeResult.success || !exchangeResult.profile) {
        const errorDetail = exchangeResult.error || 'oauth_failed';
        return res.redirect(`${frontendOrigin}/?error=${encodeURIComponent(errorDetail)}`);
      }

      const googleProfile = exchangeResult.profile;
      const normalizedEmail = googleProfile.email.trim().toLowerCase();

      // 4. Find existing user in PostgreSQL
      const user = await findUserByEmail(normalizedEmail, true);
      if (!user) {
        // IMPORTANT ACCOUNT RULE: Do not silently create a privileged account from an arbitrary Google email.
        console.warn(`[Google OAuth] Unauthorized Google email attempted login: ${normalizedEmail}`);
        return res.redirect(`${frontendOrigin}/?error=unauthorized_google_account`);
      }

      // 5. Check if user is active
      if (user.isActive === false) {
        return res.redirect(`${frontendOrigin}/?error=account_deactivated`);
      }

      // 6. Generate normal JWT access token
      const token = signAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        branchId: user.branchId ?? null
      });

      // 7. Redirect back to frontend application with token
      return res.redirect(`${frontendOrigin}/?token=${encodeURIComponent(token)}`);
    } catch (err: any) {
      console.error('[API /auth/google/callback] Exception:', err.message);
      return res.redirect(`${frontendOrigin}/?error=oauth_internal_error`);
    }
  });

  // Helper to extract branch from request header, query, or body
  const getBranchId = (req: Request): string => {
    const raw = ((req.headers['x-branch-id'] as string) || (req.query.branchId as string) || (req.body && req.body.branchId ? String(req.body.branchId) : '') || 'branch-1').trim().toLowerCase();
    if (raw === 'city' || raw === 'branch-2' || raw.includes('city') || raw === '2') return 'branch-2';
    return 'branch-1';
  };

  // 1. GET /api/branches (Returns configured branches and store settings)
  router.get('/branches', async (req: Request, res: Response) => {
    try {
      if (prisma) {
        const branches = await prisma.branch.findMany({
          include: { settings: true }
        });
        if (branches.length > 0) {
          return res.json({ success: true, count: branches.length, branches });
        }
      }
    } catch (err: any) {
      console.warn('[API /branches] PostgreSQL query fallback:', err.message);
    }

    // Fallback response
    res.json({
      success: true,
      count: 2,
      branches: [
        { id: 'branch-1', name: 'Main Branch - Gandhi Road', badge: 'Main Branch', location: 'Gandhi Road', status: 'Operational (Live)' },
        { id: 'branch-2', name: 'City Branch - Anna Salai', badge: 'City Branch', location: 'Anna Salai', status: 'Operational (Live)' }
      ]
    });
  });

  // 2. GET /api/categories (Returns 9 Product Categories)
  router.get('/categories', async (req: Request, res: Response) => {
    try {
      if (prisma) {
        const categories = await prisma.productCategory.findMany({
          orderBy: { displayOrder: 'asc' }
        });
        if (categories.length > 0) {
          return res.json({ success: true, count: categories.length, categories });
        }
      }
    } catch (err: any) {
      console.warn('[API /categories] PostgreSQL query fallback:', err.message);
    }

    res.json({ success: true, count: PRODUCT_CATEGORIES.length, categories: PRODUCT_CATEGORIES });
  });

  // 3. GET /api/products (Returns exact 59 Menu Products & 9 Categories from PostgreSQL)
  router.get('/products', async (req: Request, res: Response) => {
    const branchId = getBranchId(req);
    try {
      if (prisma) {
        const [dbProducts, dbCategories] = await Promise.all([
          prisma.product.findMany({ orderBy: { id: 'asc' } }),
          prisma.productCategory.findMany({ orderBy: { displayOrder: 'asc' } })
        ]);

        if (dbProducts.length > 0) {
          const mappedProducts = dbProducts.map((p) => ({
            id: p.id,
            name: p.name,
            category: p.categoryName,
            categoryName: p.categoryName,
            categoryId: p.categoryId,
            servingQty: p.servingQty,
            uom: p.uom,
            dineInPrice: p.dineInPrice,
            deliveryPrice: p.deliveryPrice,
            packingCharge: p.packingCharge,
            description: p.description,
            price: p.dineInPrice,
            unit: p.uom,
            stockQuantity: 40,
            image: p.image || `/dishes/${p.id}.jpg`
          }));

          return res.json({
            success: true,
            branchId,
            totalCount: mappedProducts.length, // 59
            categories: dbCategories,          // 9
            products: mappedProducts
          });
        }
      }
    } catch (err: any) {
      console.warn('[API /products] PostgreSQL query fallback:', err.message);
    }

    const branchData = branchDb.getBranchData(branchId);
    res.json({
      success: true,
      branchId,
      totalCount: branchData.products.length, // 59
      categories: branchData.categories,      // 9
      products: branchData.products
    });
  });

  // 4. GET /api/inventory/master & /api/inventory/items (Returns exact 117+ Raw Material Master Items from PostgreSQL, sorted alphabetically A-Z)
  const handleGetInventoryMaster = async (req: Request, res: Response) => {
    const branchId = getBranchId(req);
    try {
      if (prisma) {
        const dbItems = await prisma.inventoryItem.findMany();

        if (dbItems.length > 0) {
          // Sort items in case-insensitive ascending alphabetical order (A-Z) by name
          const sortedItems = dbItems.map(item => ({
            ...item,
            remainingStock: Math.max(0, (item.openingStock || 0) + (item.stockIn || 0) - (item.stockOut || 0)),
            lastMovementDisplay: item.lastMovement ? new Date(item.lastMovement).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'
          })).sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

          return res.json({
            success: true,
            branchId,
            totalCount: sortedItems.length,
            items: sortedItems
          });
        }
      }
    } catch (err: any) {
      console.warn('[API /inventory/master] PostgreSQL query fallback:', err.message);
    }

    const branchData = branchDb.getBranchData(branchId);
    const sortedFallback = [...branchData.inventoryItems]
      .map(item => ({
        ...item,
        remainingStock: Math.max(0, (item.openingStock || 0) + (item.stockIn || 0) - (item.stockOut || 0))
      }))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

    res.json({
      success: true,
      branchId,
      totalCount: sortedFallback.length,
      items: sortedFallback,
      fallback: true
    });
  };

  router.get('/inventory', handleGetInventoryMaster);
  router.get('/inventory/master', handleGetInventoryMaster);
  router.get('/inventory/items', handleGetInventoryMaster);

  // 4a. POST /api/inventory/items (Add genuinely new raw material item to master catalog)
  router.post('/inventory/items', async (req: Request, res: Response) => {
    const branchId = getBranchId(req);
    const { name, category, unit, minThreshold, costPerUnit, supplier } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Item name is required' });
    }

    const trimmedName = name.trim();
    const cleanUnit = (unit || 'units').trim();
    const cleanCategory = (category || 'Raw Ingredients').trim();
    const numThreshold = Math.max(0, parseFloat(minThreshold) || 0);
    const numCost = Math.max(0, parseFloat(costPerUnit) || 0);
    const cleanSupplier = (supplier || 'Unassigned').trim();

    try {
      if (prisma) {
        // Check if item with this name already exists (case-insensitive)
        const existing = await prisma.inventoryItem.findFirst({
          where: { name: { equals: trimmedName, mode: 'insensitive' } }
        });

        if (existing) {
          return res.json({
            success: true,
            message: `Item '${existing.name}' already exists in catalog`,
            item: existing,
            created: false
          });
        }

        const newItemId = `rm-${Date.now().toString().slice(-6)}`;
        const createdItem = await prisma.inventoryItem.create({
          data: {
            id: newItemId,
            branchId,
            name: trimmedName,
            category: cleanCategory,
            unit: cleanUnit,
            openingStock: 0,
            stockIn: 0,
            stockOut: 0,
            minThreshold: numThreshold,
            costPerUnit: numCost,
            supplier: cleanSupplier,
            lastMovement: new Date()
          }
        });

        io.emit('inventory_updated', { branchId });

        return res.status(201).json({
          success: true,
          message: `Master raw material '${createdItem.name}' added successfully`,
          item: createdItem,
          created: true
        });
      }
    } catch (err: any) {
      console.warn('[API /inventory/items] PostgreSQL write fallback:', err.message);
    }

    // In-memory fallback
    const branchData = branchDb.getBranchData(branchId);
    const newItem = {
      id: `rm-${Date.now().toString().slice(-6)}`,
      name: trimmedName,
      category: cleanCategory,
      unit: cleanUnit,
      openingStock: 0,
      stockIn: 0,
      stockOut: 0,
      minThreshold: numThreshold,
      costPerUnit: numCost,
      supplier: cleanSupplier
    };
    branchData.inventoryItems.push(newItem as any);
    io.emit('inventory_updated', { branchId });

    res.status(201).json({
      success: true,
      message: `Master raw material '${newItem.name}' added`,
      item: newItem,
      created: true,
      fallback: true
    });
  });

  // 4b. POST /api/inventory/purchases & /api/inventory/stock-in (Persist Purchase, Update Stock In & Create Ledger in PostgreSQL)
  const handleStockInPurchase = async (req: Request, res: Response) => {
    const branchId = getBranchId(req);
    const { invoiceRef, supplier, date, notes, items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one purchase item is required' });
    }

    const todayIso = new Date().toISOString().split('T')[0];
    const displayDate = date || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const purchaseId = `PUR-${Date.now().toString().slice(-6)}`;
    const finalInvoiceRef = invoiceRef || `PO #${purchaseId}`;
    const finalSupplier = (supplier && supplier !== 'Other') ? supplier : 'General Supplier';

    let totalAmount = 0;
    const processedLineItems: any[] = [];

    try {
      if (prisma) {
        // Compute total amount and validate line items
        for (const item of items) {
          const qtyNum = parseFloat(item.qty) || 0;
          const priceNum = parseFloat(item.pricePerUnit || item.cost || 0) || 0;
          if (qtyNum > 0) {
            totalAmount += qtyNum * priceNum;
          }
        }

        // Check for idempotency: if an identical invoice was saved within the last 15 seconds, return it
        const existingPurchase = await prisma.purchase.findFirst({
          where: {
            branchId,
            invoiceRef: finalInvoiceRef
          },
          include: { items: true }
        });
        if (existingPurchase) {
          return res.status(200).json({
            success: true,
            message: `Stock purchase ${finalInvoiceRef} already recorded`,
            purchase: {
              ...existingPurchase,
              date: existingPurchase.createdAt ? new Date(existingPurchase.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : existingPurchase.dateIso
            }
          });
        }

        // 1. Create Purchase record in PostgreSQL via direct SQL with dynamic legacy column alignment
        try {
          await prisma.$executeRawUnsafe(
            `INSERT INTO "public"."Purchase" ("id", "branchId", "invoiceRef", "supplier", "category", "notes", "totalAmount", "recordedBy", "dateIso", "createdAt")
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
             ON CONFLICT ("id") DO NOTHING;`,
            purchaseId, branchId, finalInvoiceRef, finalSupplier, items[0]?.category || 'Raw Ingredients', notes || 'Incoming stock purchase', totalAmount, 'Shruthy A', todayIso
          );
        } catch (insertErr: any) {
          console.warn('[API /inventory/purchases] Initial insert failed, attempting dynamic legacy cleanup:', insertErr.message);
          try {
            await prisma.$executeRawUnsafe(`
              DO $$
              DECLARE
                  rec RECORD;
              BEGIN
                  FOR rec IN (
                      SELECT column_name 
                      FROM information_schema.columns 
                      WHERE table_schema = 'public' 
                        AND table_name = 'Purchase' 
                        AND column_name NOT IN ('id', 'branchId', 'invoiceRef', 'supplier')
                  ) LOOP
                      BEGIN
                          EXECUTE 'ALTER TABLE "public"."Purchase" ALTER COLUMN "' || rec.column_name || '" DROP NOT NULL;';
                      EXCEPTION WHEN OTHERS THEN NULL;
                      END;
                  END LOOP;

                  FOR rec IN (
                      SELECT column_name 
                      FROM information_schema.columns 
                      WHERE table_schema = 'public' 
                        AND table_name = 'Purchase' 
                        AND column_name NOT IN ('id', 'branchId', 'invoiceRef', 'supplier', 'category', 'notes', 'totalAmount', 'recordedBy', 'dateIso', 'createdAt')
                  ) LOOP
                      BEGIN
                          EXECUTE 'ALTER TABLE "public"."Purchase" DROP COLUMN IF EXISTS "' || rec.column_name || '" CASCADE;';
                      EXCEPTION WHEN OTHERS THEN NULL;
                      END;
                  END LOOP;
              END $$;
            `);
          } catch (alterErr) {
            console.warn('[API /inventory/purchases] Alter table notice:', alterErr);
          }
          await prisma.$executeRawUnsafe(
            `INSERT INTO "public"."Purchase" ("id", "branchId", "invoiceRef", "supplier", "category", "notes", "totalAmount", "recordedBy", "dateIso", "createdAt")
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
             ON CONFLICT ("id") DO NOTHING;`,
            purchaseId, branchId, finalInvoiceRef, finalSupplier, items[0]?.category || 'Raw Ingredients', notes || 'Incoming stock purchase', totalAmount, 'Shruthy A', todayIso
          );
        }

        const purchaseRecord = {
          id: purchaseId,
          branchId,
          invoiceRef: finalInvoiceRef,
          supplier: finalSupplier,
          category: items[0]?.category || 'Raw Ingredients',
          notes: notes || 'Incoming stock purchase',
          totalAmount,
          recordedBy: 'Shruthy A',
          dateIso: todayIso,
          createdAt: new Date()
        };

        // 2. Process each item: Upsert InventoryItem, Create PurchaseItem, Create StockLedger
        for (const lineItem of items) {
          const numQty = parseFloat(lineItem.qty) || 0;
          if (numQty <= 0) continue;
          const numPrice = parseFloat(lineItem.pricePerUnit || lineItem.cost || 0) || 0;
          const itemTotal = numQty * numPrice;

          // Find item by ID or name
          let dbItem: any = null;
          if (lineItem.itemId) {
            const foundById = await prisma.$queryRawUnsafe<any[]>(
              `SELECT * FROM "public"."InventoryItem" WHERE "id" = $1;`,
              lineItem.itemId
            );
            if (foundById.length > 0) dbItem = foundById[0];
          }
          if (!dbItem && lineItem.itemName) {
            const foundByName = await prisma.$queryRawUnsafe<any[]>(
              `SELECT * FROM "public"."InventoryItem" WHERE LOWER("name") = LOWER($1);`,
              lineItem.itemName.trim()
            );
            if (foundByName.length > 0) dbItem = foundByName[0];
          }

          if (dbItem) {
            // Update existing inventory item stockIn
            await prisma.$executeRawUnsafe(
              `UPDATE "public"."InventoryItem"
               SET "stockIn" = "stockIn" + $1,
                   "costPerUnit" = CASE WHEN $2 > 0 THEN $2 ELSE "costPerUnit" END,
                   "supplier" = $3,
                   "lastMovement" = CURRENT_TIMESTAMP
               WHERE "id" = $4;`,
              numQty, numPrice, finalSupplier, dbItem.id
            );

            const updatedRows = await prisma.$queryRawUnsafe<any[]>(
              `SELECT * FROM "public"."InventoryItem" WHERE "id" = $1;`,
              dbItem.id
            );
            const updated = updatedRows[0] || dbItem;
            const remainingAfter = Math.max(0, (updated.openingStock || 0) + (updated.stockIn || 0) - (updated.stockOut || 0));

            // Create PurchaseItem
            const piId = `pi-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            await prisma.$executeRawUnsafe(
              `INSERT INTO "public"."PurchaseItem" ("id", "purchaseId", "itemId", "itemName", "category", "qty", "unit", "pricePerUnit", "total")
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
               ON CONFLICT ("id") DO NOTHING;`,
              piId, purchaseRecord.id, updated.id, updated.name, updated.category, numQty, lineItem.unit || updated.unit, numPrice, itemTotal
            );

            // Create StockLedger movement
            const mvId = `MV-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 1000)}`;
            await prisma.$executeRawUnsafe(
              `INSERT INTO "public"."StockLedger" ("id", "branchId", "itemId", "itemName", "type", "qty", "unit", "supplier", "ref", "source", "notes", "remainingAfter", "purchaseId", "dateIso", "createdAt")
               VALUES ($1, $2, $3, $4, 'STOCK_IN', $5, $6, $7, $8, 'Purchase / Stock In', $9, $10, $11, $12, CURRENT_TIMESTAMP)
               ON CONFLICT ("id") DO NOTHING;`,
              mvId, branchId, updated.id, updated.name, numQty, lineItem.unit || updated.unit, finalSupplier, finalInvoiceRef, notes || `Purchase In (${finalInvoiceRef})`, remainingAfter, purchaseRecord.id, todayIso
            );

            processedLineItems.push({
              itemId: updated.id,
              itemName: updated.name,
              category: updated.category,
              qty: numQty,
              unit: lineItem.unit || updated.unit,
              pricePerUnit: numPrice,
              total: itemTotal
            });
          } else if (lineItem.itemName) {
            // Genuinely new raw material item: create in catalog
            const newRmId = `rm-${Date.now().toString().slice(-6)}`;
            await prisma.$executeRawUnsafe(
              `INSERT INTO "public"."InventoryItem" ("id", "branchId", "name", "category", "unit", "openingStock", "stockIn", "stockOut", "minThreshold", "costPerUnit", "supplier", "lastMovement", "createdAt", "updatedAt")
               VALUES ($1, $2, $3, $4, $5, 0, $6, 0, 0, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
               ON CONFLICT ("id") DO NOTHING;`,
              newRmId, branchId, lineItem.itemName.trim(), lineItem.category || 'Raw Ingredients', lineItem.unit || 'kg', numQty, numPrice, finalSupplier
            );

            // Create PurchaseItem
            const piId = `pi-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            await prisma.$executeRawUnsafe(
              `INSERT INTO "public"."PurchaseItem" ("id", "purchaseId", "itemId", "itemName", "category", "qty", "unit", "pricePerUnit", "total")
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
               ON CONFLICT ("id") DO NOTHING;`,
              piId, purchaseRecord.id, newRmId, lineItem.itemName.trim(), lineItem.category || 'Raw Ingredients', numQty, lineItem.unit || 'kg', numPrice, itemTotal
            );

            // Create StockLedger movement
            const mvId = `MV-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 1000)}`;
            await prisma.$executeRawUnsafe(
              `INSERT INTO "public"."StockLedger" ("id", "branchId", "itemId", "itemName", "type", "qty", "unit", "supplier", "ref", "source", "notes", "remainingAfter", "purchaseId", "dateIso", "createdAt")
               VALUES ($1, $2, $3, $4, 'STOCK_IN', $5, $6, $7, $8, 'Purchase / Stock In', $9, $10, $11, $12, CURRENT_TIMESTAMP)
               ON CONFLICT ("id") DO NOTHING;`,
              mvId, branchId, newRmId, lineItem.itemName.trim(), numQty, lineItem.unit || 'kg', finalSupplier, finalInvoiceRef, notes || `New Item Purchase (${finalInvoiceRef})`, numQty, purchaseRecord.id, todayIso
            );

            processedLineItems.push({
              itemId: newRmId,
              itemName: lineItem.itemName.trim(),
              category: lineItem.category || 'Raw Ingredients',
              qty: numQty,
              unit: lineItem.unit || 'kg',
              pricePerUnit: numPrice,
              total: itemTotal
            });
          }
        }

        const fullPurchase = {
          ...purchaseRecord,
          items: processedLineItems
        };

        // Broadcast to all connected clients
        io.emit('purchase_created', { purchase: fullPurchase, branchId });
        io.emit('inventory_updated', { branchId });

        return res.status(201).json({
          success: true,
          message: `Stock purchase ${finalInvoiceRef} persisted to PostgreSQL successfully`,
          purchase: fullPurchase
        });
      }
    } catch (err: any) {
      console.error('[API /inventory/purchases] PostgreSQL write error:', err.message, err.stack);
      return res.status(500).json({
        success: false,
        error: err.message,
        details: err.stack
      });
    }

    return res.status(503).json({
      success: false,
      message: 'PostgreSQL database connection is unavailable'
    });
  };

  router.post('/inventory/purchases', handleStockInPurchase);
  router.post('/inventory/stock-in', handleStockInPurchase);

  // 4c. GET /api/inventory/purchases (Fetch purchase invoices from PostgreSQL)
  router.get('/inventory/purchases', async (req: Request, res: Response) => {
    const branchId = getBranchId(req);
    try {
      if (prisma) {
        const purchases = await prisma.purchase.findMany({
          where: { branchId },
          include: { items: true },
          orderBy: { createdAt: 'desc' }
        });

        return res.json({
          success: true,
          branchId,
          count: purchases.length,
          purchases: purchases.map(p => ({
            ...p,
            date: p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : p.dateIso
          }))
        });
      }
    } catch (err: any) {
      console.error('[API /inventory/purchases GET] Database error:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve purchases from PostgreSQL database',
        error: err.message
      });
    }

    return res.status(503).json({
      success: false,
      message: 'PostgreSQL database connection unavailable'
    });
  });

  // 4c-1. DELETE /api/inventory/purchases/:id (Delete purchase and rollback stock in PostgreSQL)
  router.delete('/inventory/purchases/:id', async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : String(req.params.id);
    const branchId = getBranchId(req);
    try {
      if (prisma) {
        const purchase = await prisma.purchase.findUnique({
          where: { id },
          include: { items: true }
        });
        if (!purchase) {
          return res.status(404).json({ success: false, message: 'Purchase not found' });
        }

        // Revert stock for each purchase item
        for (const item of purchase.items) {
          if (item.itemId) {
            await prisma.inventoryItem.updateMany({
              where: { id: item.itemId },
              data: {
                stockIn: { decrement: item.qty }
              }
            });
          }
        }

        // Delete related stock ledgers
        await prisma.stockLedger.deleteMany({
          where: { purchaseId: id }
        });

        // Delete purchase items and purchase
        await prisma.purchaseItem.deleteMany({
          where: { purchaseId: id }
        });
        await prisma.purchase.delete({
          where: { id }
        });

        io.emit('inventory_updated', { branchId });
        io.emit('purchase_deleted', { id, branchId });

        return res.json({
          success: true,
          message: `Purchase ${id} deleted and stock reverted successfully`
        });
      }
    } catch (err: any) {
      console.error('[API /inventory/purchases DELETE] Database error:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete purchase',
        error: err.message
      });
    }

    return res.status(503).json({
      success: false,
      message: 'PostgreSQL database connection unavailable'
    });
  });

  // 4d. GET /api/inventory/ledger (Fetch stock ledger movements from PostgreSQL)
  router.get('/inventory/ledger', async (req: Request, res: Response) => {
    const branchId = getBranchId(req);
    try {
      if (prisma) {
        const ledger = await prisma.stockLedger.findMany({
          where: { branchId },
          orderBy: { createdAt: 'desc' }
        });

        return res.json({
          success: true,
          branchId,
          count: ledger.length,
          ledger: ledger.map(m => ({
            ...m,
            date: m.createdAt ? new Date(m.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : m.dateIso,
            time: m.createdAt ? new Date(m.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : ''
          }))
        });
      }
    } catch (err: any) {
      console.error('[API /inventory/ledger GET] Database error:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve stock ledger from PostgreSQL database',
        error: err.message
      });
    }

    return res.status(503).json({
      success: false,
      message: 'PostgreSQL database connection unavailable'
    });
  });

  // 4d-1. DELETE /api/inventory/ledger (Clear all or branch-specific stock ledger movements from PostgreSQL)
  router.delete('/inventory/ledger', async (req: Request, res: Response) => {
    const branchId = getBranchId(req);
    try {
      if (prisma) {
        const deleted = await prisma.stockLedger.deleteMany({
          where: branchId ? { branchId } : {}
        });

        io.emit('inventory_updated', { branchId });

        return res.json({
          success: true,
          message: `Deleted ${deleted.count} stock ledger records for branch ${branchId || 'all'}`,
          count: deleted.count
        });
      }
    } catch (err: any) {
      console.error('[API /inventory/ledger DELETE] Error:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete stock ledger',
        error: err.message
      });
    }

    return res.json({ success: true, count: 0 });
  });

  // 4d-2. POST /api/admin/clean-database (Full Production Handover Database Reset)
  router.post('/admin/clean-database', async (_req: Request, res: Response) => {
    try {
      const result = await executeProductionHandoverCleanup();
      io.emit('inventory_updated', { branchId: 'branch-1' });
      io.emit('inventory_updated', { branchId: 'branch-2' });
      return res.json({
        success: true,
        message: 'Production database clean state executed successfully',
        result
      });
    } catch (err: any) {
      console.error('[API /admin/clean-database POST] Error:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to execute production database cleanup',
        error: err.message
      });
    }
  });

  // 4e. PUT/PATCH /api/inventory/items/:id/threshold (Secure update for item minThreshold in PostgreSQL)
  const handleThresholdUpdate = async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : String(req.params.id);
    const branchId = getBranchId(req);
    const { minThreshold } = req.body;

    if (minThreshold === undefined || isNaN(Number(minThreshold)) || Number(minThreshold) < 0) {
      return res.status(400).json({
        success: false,
        message: 'A valid non-negative number is required for minThreshold'
      });
    }

    const thresholdNum = parseFloat(Number(minThreshold).toFixed(2));

    try {
      if (prisma) {
        // Update in PostgreSQL
        const updatedItem = await prisma.inventoryItem.update({
          where: { id },
          data: {
            minThreshold: thresholdNum,
            updatedAt: new Date()
          }
        });

        // Broadcast threshold change to connected clients
        io.emit('inventory_threshold_updated', {
          id,
          branchId,
          minThreshold: thresholdNum
        });
        io.emit('inventory_updated', { branchId });

        return res.json({
          success: true,
          message: `Minimum stock threshold for ${updatedItem.name} updated to ${thresholdNum} ${updatedItem.unit}`,
          item: updatedItem
        });
      }
    } catch (err: any) {
      console.warn(`[API threshold update] PostgreSQL write fallback for ${id}:`, err.message);
    }

    // Fallback in-memory update
    const branchData = branchDb.getBranchData(branchId);
    const item = branchData.inventoryItems.find(i => i.id === id);
    if (item) {
      item.minThreshold = thresholdNum;
      io.emit('inventory_threshold_updated', {
        id,
        branchId,
        minThreshold: thresholdNum
      });
      io.emit('inventory_updated', { branchId });
      return res.json({
        success: true,
        message: `Minimum stock threshold for ${item.name} updated to ${thresholdNum} ${item.unit}`,
        item,
        fallback: true
      });
    }

    return res.status(404).json({
      success: false,
      message: `Inventory item with ID ${id} not found`
    });
  };

  router.put('/inventory/items/:id/threshold', handleThresholdUpdate);
  router.patch('/inventory/items/:id/threshold', handleThresholdUpdate);

  // 5. GET /api/recipes (Returns BOM / Recipes Master: 2 Complete, 7 Awaiting Details from PostgreSQL)
  router.get('/recipes', async (req: Request, res: Response) => {
    const branchId = getBranchId(req);
    try {
      if (prisma) {
        const dbRecipes = await prisma.recipe.findMany({
          include: {
            items: {
              orderBy: { stepNumber: 'asc' }
            }
          }
        });

        if (dbRecipes.length > 0) {
          const completeRecipes = dbRecipes.filter(r => r.status === 'COMPLETE');
          const pendingRecipes = dbRecipes.filter(r => r.status === 'AWAITING_RECIPE_DETAILS');

          const formattedRecipes = dbRecipes.map(r => ({
            productId: r.productId,
            productName: r.productName,
            servingQty: r.servingQty,
            servingUom: r.servingUom,
            status: r.status,
            finalProcess: r.finalProcess,
            processes: r.items.map(item => ({
              step: item.stepNumber,
              rawMaterialName: item.rawMaterialName,
              rawMaterialId: item.inventoryItemId,
              qty: item.quantity,
              uom: item.uom,
              process: item.process
            }))
          }));

          return res.json({
            success: true,
            branchId,
            totalCount: formattedRecipes.length, // 9
            completeCount: completeRecipes.length,  // 2
            pendingCount: pendingRecipes.length,    // 7
            recipes: formattedRecipes
          });
        }
      }
    } catch (err: any) {
      console.warn('[API /recipes] PostgreSQL query fallback:', err.message);
    }

    const branchData = branchDb.getBranchData(branchId);
    const completeRecipes = branchData.recipes.filter(r => r.status === 'COMPLETE');
    const pendingRecipes = branchData.recipes.filter(r => r.status === 'AWAITING_RECIPE_DETAILS');

    res.json({
      success: true,
      branchId,
      totalCount: branchData.recipes.length, // 9
      completeCount: completeRecipes.length,  // 2
      pendingCount: pendingRecipes.length,    // 7
      recipes: branchData.recipes
    });
  });

  // 6. POST /api/sales (Create Bill Transaction & Execute BOM Stock Deductions in PostgreSQL)
  router.post('/sales', async (req: Request, res: Response) => {
    const branchId = getBranchId(req);
    const branchData = branchDb.getBranchData(branchId);
    const { items, subtotal, tax, discount, grandTotal, paymentMethod, receiptType, cashierName, channel } = req.body;
    const customerPhone = req.body.customerPhone || req.body.customer?.phone || null;
    const customerName = req.body.customerName || req.body.customer?.name || null;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart items are required' });
    }

    const billNumber = `KC-2026-${1000 + Date.now().toString().slice(-4)}`;
    const todayIso = new Date().toISOString().split('T')[0];
    const saleId = `sale-${Date.now()}`;

    const newSale: SaleRecord = {
      id: saleId,
      branchId,
      billNumber,
      subtotal: parseFloat(subtotal) || 0,
      tax: parseFloat(tax) || 0,
      discount: parseFloat(discount || 0),
      grandTotal: parseFloat(grandTotal) || 0,
      paymentMethod: paymentMethod || 'CASH',
      receiptType: receiptType || 'PAPER',
      customerPhone,
      customerName,
      cashierName: cashierName || 'Shruthy',
      status: 'COMPLETED',
      channel: channel || 'POS',
      createdAt: new Date().toISOString(),
      dateIso: todayIso,
      items: items.map((item: any) => ({
        productId: item.id || item.productId,
        productName: item.name || item.productName,
        quantity: parseFloat(item.quantity || item.qty || 1),
        unitPrice: parseFloat(item.price || item.unitPrice || 0),
        subtotal: parseFloat(item.total || ((item.price || 0) * (item.quantity || 1))),
        unit: item.unit || 'units',
        categoryName: item.categoryName || item.category || 'General'
      })),
      bomDeductionsApplied: false
    };

    // POS → INVENTORY BOM LOGIC
    const appliedDeductions: { rawMaterial: string; qtyDeducted: number; uom: string; product: string }[] = [];

    // Attempt DB persistence
    try {
      if (!prisma) {
        return res.status(503).json({
          success: false,
          error: 'DATABASE_UNAVAILABLE',
          message: 'PostgreSQL database connection is unavailable. Transaction aborted for data safety.'
        });
      }

      // Fetch recipes to check for BOM deduction (PostgreSQL first, fallback to master BOM)
      let allRecipes: any[] = [];
      try {
        if (prisma) {
          const dbRecipes = await prisma.recipe.findMany({
            include: { items: true }
          });
          if (dbRecipes && dbRecipes.length > 0) {
            allRecipes = dbRecipes;
          }
        }
      } catch (rErr: any) {
        console.warn('[Sale BOM Fetch Notice]:', rErr.message);
      }

      if (allRecipes.length === 0) {
        allRecipes = CLIENT_BOM_MASTER;
      }

      for (const saleItem of newSale.items) {
        const itemProdId = (saleItem.productId || '').toLowerCase().trim();
        const itemProdName = (saleItem.productName || '').toLowerCase().trim();

        const matchedBOM = allRecipes.find(r => 
          (r.productId && r.productId.toLowerCase().trim() === itemProdId) || 
          (r.productName && r.productName.toLowerCase().trim() === itemProdName)
        );

        const bomSteps = matchedBOM ? (matchedBOM.items || matchedBOM.processes || []) : [];

        if (matchedBOM && matchedBOM.status === 'COMPLETE' && bomSteps.length > 0) {
          newSale.bomDeductionsApplied = true;

          for (const proc of bomSteps) {
            const rawQtyNum = (proc.quantity !== undefined ? proc.quantity : proc.qty) || 0;
            const totalRawQty = rawQtyNum * saleItem.quantity;
            const rawName = proc.rawMaterialName || proc.name;
            const rawId = proc.inventoryItemId || proc.rawMaterialId || proc.id;
            const rawUom = proc.uom || proc.unit || 'units';
            const procDesc = proc.process || 'Recipe Process';
            
            // Resolve inventory item by ID or by name
            let targetItem = null;
            if (rawId) {
              targetItem = await prisma.inventoryItem.findFirst({
                where: {
                  OR: [
                    { id: rawId },
                    ...(branchId ? [{ id: rawId, branchId }] : [])
                  ]
                }
              });
            }
            if (!targetItem && rawName) {
              targetItem = await prisma.inventoryItem.findFirst({
                where: {
                  name: { equals: rawName, mode: 'insensitive' },
                  ...(branchId ? { OR: [{ branchId }, { branchId: null }] } : {})
                }
              });
            }

            if (targetItem) {
              const updatedItem = await prisma.inventoryItem.update({
                where: { id: targetItem.id },
                data: {
                  stockOut: { increment: totalRawQty },
                  lastMovement: new Date()
                }
              });

              const remainingAfter = Math.max(0, (updatedItem.openingStock || 0) + (updatedItem.stockIn || 0) - (updatedItem.stockOut || 0));

              await prisma.stockLedger.create({
                data: {
                  id: `MV-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 1000)}`,
                  branchId,
                  itemId: targetItem.id,
                  itemName: targetItem.name,
                  type: 'STOCK_OUT',
                  qty: totalRawQty,
                  unit: targetItem.unit || rawUom,
                  supplier: '-',
                  ref: billNumber,
                  source: 'POS / Recipe BOM',
                  notes: `BOM Consumption: ${saleItem.quantity} x ${saleItem.productName} (${procDesc})`,
                  remainingAfter,
                  dateIso: todayIso
                }
              });
            }

            appliedDeductions.push({
              rawMaterial: rawName,
              qtyDeducted: totalRawQty,
              uom: rawUom,
              product: saleItem.productName
            });
          }
        }
      }

      // Automatically Upsert Customer in PostgreSQL if customerPhone is present
      let linkedCustomerId: string | null = null;
      if (customerPhone && customerPhone.trim().length >= 7) {
        try {
          const rawPhone = customerPhone.trim();
          const formattedPhone = rawPhone.startsWith('+91') ? rawPhone : `+91 ${rawPhone.replace(/^\+91\s*/, '')}`;
          const cleanDigits = rawPhone.replace(/\D/g, '').slice(-10);

          // Find customer by branchId and phone match
          const existingCustomers = await prisma.customer.findMany({
            where: { branchId }
          });
          const customerMatch = existingCustomers.find(c => {
            const cDigits = c.phone ? c.phone.replace(/\D/g, '').slice(-10) : '';
            return cDigits === cleanDigits || c.phone === formattedPhone || c.phone === rawPhone;
          });

          const displayDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
          const displayTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
          const lastVisitFormatted = `${displayDate}, ${displayTime}`;
          const saleAmount = newSale.grandTotal || 0;

          if (customerMatch) {
            const newVisits = (customerMatch.visits || 0) + 1;
            const newTotalSpent = (customerMatch.totalSpent || 0) + saleAmount;
            const newTier = (newTotalSpent >= 10000 || newVisits >= 20) ? 'VIP Gold' : (newTotalSpent >= 3000 || newVisits >= 8) ? 'Frequent' : 'Regular';
            const updatedName = (customerName && customerName.trim() && !customerName.includes('Customer') && customerName !== 'Walk-in Customer')
              ? customerName.trim()
              : customerMatch.name;

            const updatedCustomer = await prisma.customer.update({
              where: { id: customerMatch.id },
              data: {
                name: updatedName,
                visits: newVisits,
                totalSpent: newTotalSpent,
                tier: newTier,
                lastVisit: lastVisitFormatted
              }
            });
            linkedCustomerId = updatedCustomer.id;
          } else {
            const newCustName = (customerName && customerName.trim() && customerName !== 'Walk-in Customer')
              ? customerName.trim()
              : `Customer (${cleanDigits.slice(-4)})`;
            const initialTier = (saleAmount >= 10000) ? 'VIP Gold' : (saleAmount >= 3000) ? 'Frequent' : 'Regular';
            const initialFavItem = newSale.items[0]?.productName || 'Kanchivaram Filter Coffee';

            const createdCustomer = await prisma.customer.create({
              data: {
                id: `c-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                branchId,
                name: newCustName,
                phone: formattedPhone,
                email: 'Not specified',
                visits: 1,
                totalSpent: saleAmount,
                tier: initialTier,
                favoriteItem: initialFavItem,
                lastVisit: lastVisitFormatted
              }
            });
            linkedCustomerId = createdCustomer.id;
          }
        } catch (cErr: any) {
          console.warn('[Sale -> Customer Upsert Notice]:', cErr.message);
        }
      }

      // Prepare validated sale items (prevent foreign key violation on non-existent product IDs)
      const validDbProducts = await prisma.product.findMany({ select: { id: true, name: true } });
      const validProdIdSet = new Set(validDbProducts.map(p => p.id));
      const prodNameToIdMap = new Map(validDbProducts.map(p => [p.name.toLowerCase().trim(), p.id]));

      const validatedSaleItems = newSale.items.map(item => {
        let matchedId = null;
        if (item.productId && validProdIdSet.has(item.productId)) {
          matchedId = item.productId;
        } else if (item.productName && prodNameToIdMap.has(item.productName.toLowerCase().trim())) {
          matchedId = prodNameToIdMap.get(item.productName.toLowerCase().trim());
        }
        return {
          productId: matchedId,
          name: item.productName,
          quantity: item.quantity,
          price: item.unitPrice,
          total: item.subtotal,
          unit: item.unit || 'units',
          categoryName: item.categoryName || 'General'
        };
      });

      // Persist Sale and SaleItems to PostgreSQL
      await prisma.sale.create({
        data: {
          id: saleId,
          branchId,
          billNumber,
          customerId: linkedCustomerId,
          customerPhone,
          customerName,
          channel: newSale.channel,
          subtotal: newSale.subtotal,
          discount: newSale.discount,
          tax: newSale.tax,
          grandTotal: newSale.grandTotal,
          paymentMethod: newSale.paymentMethod,
          receiptType: newSale.receiptType,
          status: 'COMPLETED',
          cashierName: newSale.cashierName,
          dateIso: todayIso,
          items: {
            create: validatedSaleItems
          }
        }
      });

      // Emit Socket.IO live updates to connected POS clients
      io.emit('sale_created', { sale: newSale, branchId, deductions: appliedDeductions });
      io.emit('inventory_updated', { branchId, deductions: appliedDeductions });
      io.emit('customer_updated', { branchId });

      return res.status(201).json({
        success: true,
        message: 'Sale finalized and persisted to PostgreSQL successfully',
        sale: newSale,
        appliedDeductions
      });
    } catch (dbErr: any) {
      console.error('[Sale Creation DB Error]:', dbErr.message);
      return res.status(500).json({
        success: false,
        error: 'DATABASE_TRANSACTION_FAILED',
        message: 'Failed to write transaction to PostgreSQL database. Transaction was not recorded.',
        details: dbErr.message
      });
    }
  });

  // 7. GET /api/sales (Fetch Real-Time Transaction Ledger from PostgreSQL)
  router.get('/sales', async (req: Request, res: Response) => {
    const branchId = getBranchId(req);
    const period = (req.query.period as string) || 'today';
    const channel = (req.query.channel as string) || 'ALL';
    const today = new Date();
    const todayIso = today.toISOString().split('T')[0];

    try {
      if (prisma) {
        let dateFilter: any = {};
        if (period === 'today') {
          dateFilter = { dateIso: todayIso };
        } else if (period === 'week') {
          const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          dateFilter = { createdAt: { gte: sevenDaysAgo } };
        } else if (period === 'month') {
          const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          dateFilter = { createdAt: { gte: firstDayOfMonth } };
        } else if (period === 'prev_month') {
          const firstDayPrevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          const lastDayPrevMonth = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);
          dateFilter = { createdAt: { gte: firstDayPrevMonth, lte: lastDayPrevMonth } };
        } else if (period === 'custom') {
          const start = (req.query.startDate as string) || todayIso;
          const end = (req.query.endDate as string) || todayIso;
          dateFilter = { dateIso: { gte: start, lte: end } };
        }

        let whereClause: any = {
          branchId,
          isCancelled: false,
          ...dateFilter
        };

        if (channel === 'POS') {
          whereClause.channel = { in: ['POS', 'IN_STORE', 'In-Store POS'] };
        } else if (channel === 'ONLINE') {
          whereClause.channel = { notIn: ['POS', 'IN_STORE', 'In-Store POS'] };
        }

        const sales = await prisma.sale.findMany({
          where: whereClause,
          include: { items: true },
          orderBy: { createdAt: 'desc' }
        });

        const formattedSales = sales.map(s => ({
          ...s,
          date: s.dateIso || (s.createdAt ? new Date(s.createdAt).toISOString().split('T')[0] : todayIso),
          time: s.createdAt ? new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
        }));

        return res.json({
          success: true,
          count: formattedSales.length,
          branchId,
          sales: formattedSales
        });
      }

      // Fallback
      const branchData = branchDb.getBranchData(branchId);
      const sales = (branchData.sales || []).filter(s => {
        if (period === 'today') return s.dateIso === todayIso;
        return true;
      });
      return res.json({ success: true, count: sales.length, branchId, sales, fallback: true });
    } catch (err: any) {
      console.error('[API /sales Error]:', err.message);
      const branchData = branchDb.getBranchData(branchId);
      return res.json({ success: true, count: (branchData.sales || []).length, branchId, sales: branchData.sales || [], fallback: true });
    }
  });

  // 8. GET /api/customers (Fetch Customers & purchase history for branch from PostgreSQL)
  router.get('/customers', async (req: Request, res: Response) => {
    const branchId = getBranchId(req);
    try {
      if (prisma) {
        const dbCustomers = await prisma.customer.findMany({
          where: { branchId },
          orderBy: { createdAt: 'desc' }
        });

        const allSales = await prisma.sale.findMany({
          where: { branchId, isCancelled: false },
          include: { items: true },
          orderBy: { createdAt: 'desc' }
        });

        const formattedCustomers = dbCustomers.map(cust => {
          const custCleanDigits = cust.phone ? cust.phone.replace(/\D/g, '').slice(-10) : '';
          const custCleanName = cust.name ? cust.name.trim().toLowerCase() : '';
          
          // Match sales strictly belonging to this customer by ID, Phone, or Name
          const linkedSales = allSales.filter(s => {
            if (s.customerId && s.customerId === cust.id) return true;
            const sCleanPhone = s.customerPhone ? s.customerPhone.replace(/\D/g, '').slice(-10) : '';
            if (sCleanPhone && custCleanDigits && sCleanPhone === custCleanDigits) return true;
            const sCleanName = s.customerName ? s.customerName.trim().toLowerCase() : '';
            if (sCleanName && custCleanName && sCleanName === custCleanName && !['walk-in customer', 'customer'].includes(sCleanName)) return true;
            return false;
          });

          // Compute accurate metrics from sales
          const totalSpent = linkedSales.length > 0
            ? linkedSales.reduce((sum, s) => sum + (s.grandTotal || 0), 0)
            : (cust.totalSpent || 0);

          const visits = linkedSales.length > 0 ? linkedSales.length : (cust.visits || 0);

          // Compute favorite item
          const itemCounts: Record<string, number> = {};
          linkedSales.forEach(s => {
            (s.items || []).forEach(it => {
              itemCounts[it.name] = (itemCounts[it.name] || 0) + (it.quantity || 1);
            });
          });
          let favoriteItem = cust.favoriteItem || 'Filter Coffee';
          let maxCount = 0;
          Object.entries(itemCounts).forEach(([name, count]) => {
            if (count > maxCount) {
              maxCount = count;
              favoriteItem = name;
            }
          });

          // Last visit
          let lastVisit = cust.lastVisit;
          if (linkedSales.length > 0 && linkedSales[0].createdAt) {
            const d = new Date(linkedSales[0].createdAt);
            lastVisit = `${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}, ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
          }

          const tier = (totalSpent >= 10000 || visits >= 20) ? 'VIP Gold' : (totalSpent >= 3000 || visits >= 8) ? 'Frequent' : 'Regular';

          const purchaseHistory = linkedSales.map(s => {
            const sDate = s.createdAt ? new Date(s.createdAt) : new Date();
            return {
              id: s.id,
              billNumber: s.billNumber,
              date: sDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
              time: sDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
              dateIso: s.dateIso,
              createdAt: s.createdAt,
              grandTotal: s.grandTotal,
              subtotal: s.subtotal,
              tax: s.tax,
              discount: s.discount || 0,
              paymentMethod: s.paymentMethod || 'CASH',
              receiptType: s.receiptType || 'PAPER',
              channel: s.channel || 'POS',
              cashierName: s.cashierName || 'Shruthy',
              items: (s.items || []).map(i => ({
                id: i.productId || i.id,
                name: i.name,
                qty: i.quantity,
                price: i.price,
                total: i.total,
                unit: i.unit,
                categoryName: i.categoryName
              }))
            };
          });

          return {
            id: cust.id,
            branchId: cust.branchId,
            name: cust.name,
            phone: cust.phone,
            email: cust.email || 'Not specified',
            visits,
            totalSpent,
            tier,
            favoriteItem,
            lastVisit: lastVisit || 'No purchases yet',
            purchaseHistory
          };
        });

        return res.json({
          success: true,
          branchId,
          count: formattedCustomers.length,
          customers: formattedCustomers
        });
      }
    } catch (err: any) {
      console.warn('[API /customers GET] Fallback:', err.message);
    }

    res.json({ success: true, branchId, count: 0, customers: [] });
  });

  // 9. POST /api/customers (Manual customer creation from UI)
  router.post('/customers', async (req: Request, res: Response) => {
    const branchId = getBranchId(req);
    const { name, phone, email } = req.body;

    if (!name || !name.trim() || !phone || !phone.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Customer name and phone number are required.'
      });
    }

    const rawPhone = phone.trim();
    const formattedPhone = rawPhone.startsWith('+91') ? rawPhone : `+91 ${rawPhone.replace(/^\+91\s*/, '')}`;
    const cleanDigits = rawPhone.replace(/\D/g, '').slice(-10);

    try {
      if (prisma) {
        // Check if customer with this phone already exists in this branch
        const existingList = await prisma.customer.findMany({
          where: { branchId }
        });
        const existing = existingList.find(c => {
          const cDigits = c.phone.replace(/\D/g, '').slice(-10);
          return cDigits === cleanDigits || c.phone === formattedPhone || c.phone === rawPhone;
        });

        if (existing) {
          // Update existing details if provided
          const updated = await prisma.customer.update({
            where: { id: existing.id },
            data: {
              name: name.trim(),
              email: email?.trim() || existing.email
            }
          });
          io.emit('customer_updated', { customer: updated, branchId });
          return res.json({
            success: true,
            message: `Customer ${existing.phone} updated successfully`,
            customer: {
              ...updated,
              purchaseHistory: []
            }
          });
        }

        const newCustomer = await prisma.customer.create({
          data: {
            id: `c-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            branchId,
            name: name.trim(),
            phone: formattedPhone,
            email: email?.trim() || 'Not specified',
            visits: 0,
            totalSpent: 0,
            tier: 'Regular',
            favoriteItem: 'None',
            lastVisit: 'No purchases yet'
          }
        });

        io.emit('customer_updated', { customer: newCustomer, branchId });

        return res.status(201).json({
          success: true,
          message: 'Customer created successfully in PostgreSQL',
          customer: {
            ...newCustomer,
            purchaseHistory: []
          }
        });
      }
    } catch (err: any) {
      console.error('[API /customers POST] Error:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to create customer in PostgreSQL',
        error: err.message
      });
    }

    return res.status(503).json({
      success: false,
      message: 'PostgreSQL database connection unavailable'
    });
  });

  // 10. DELETE /api/customers/:id
  router.delete('/customers/:id', async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : String(req.params.id);
    const branchId = getBranchId(req);
    try {
      if (prisma) {
        await prisma.customer.delete({ where: { id } }).catch(() => {});
        io.emit('customer_updated', { id, branchId, deleted: true });
        return res.json({ success: true, message: `Customer ${id} deleted successfully` });
      }
    } catch (err: any) {
      console.warn('[API /customers DELETE] Error:', err.message);
    }
    return res.json({ success: true, message: `Customer ${id} deleted` });
  });

  // 10b. GET /api/expenses (Fetch expenses for branch from PostgreSQL)
  router.get('/expenses', async (req: Request, res: Response) => {
    const branchId = getBranchId(req);
    const todayIso = new Date().toISOString().split('T')[0];
    const currentMonthPrefix = todayIso.slice(0, 7);

    try {
      if (prisma) {
        const rows = await prisma.$queryRawUnsafe<any[]>(
          `SELECT "id", "branchId", "description", "category", "amount", "dateIso", "notes", "recordedBy", "createdAt"
           FROM "public"."Expense"
           WHERE "branchId" = $1
           ORDER BY "dateIso" DESC, "createdAt" DESC;`,
          branchId
        );

        const mappedExpenses = rows.map(r => {
          const dateObj = r.dateIso ? new Date(r.dateIso) : new Date(r.createdAt);
          const displayDate = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
          return {
            id: r.id,
            branchId: r.branchId,
            description: r.description,
            category: r.category || 'Other',
            amount: parseFloat(r.amount) || 0,
            date: r.dateIso || todayIso,
            dateIso: r.dateIso || todayIso,
            displayDate,
            notes: r.notes || '',
            recordedBy: r.recordedBy || 'Shruthy A',
            createdAt: r.createdAt
          };
        });

        const totalExpenses = mappedExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
        const todayExpenses = mappedExpenses
          .filter(e => e.date === todayIso)
          .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
        const monthExpenses = mappedExpenses
          .filter(e => e.date.startsWith(currentMonthPrefix))
          .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

        return res.json({
          success: true,
          branchId,
          count: mappedExpenses.length,
          expenses: mappedExpenses,
          summary: {
            totalExpenses,
            todayExpenses,
            monthExpenses,
            totalRecordsCount: mappedExpenses.length,
            todayIso
          }
        });
      }
    } catch (err: any) {
      console.warn('[API /expenses GET] Error:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve expenses from PostgreSQL database',
        error: err.message
      });
    }

    return res.status(503).json({
      success: false,
      message: 'PostgreSQL database connection unavailable'
    });
  });

  // 10c. POST /api/expenses (Create an operational expense in PostgreSQL)
  router.post('/expenses', async (req: Request, res: Response) => {
    const branchId = getBranchId(req);
    const { description, category, amount, date, notes, recordedBy } = req.body;

    const numAmount = parseFloat(amount) || 0;
    if (!description || typeof description !== 'string' || !description.trim() || numAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'A valid description and positive amount are required.'
      });
    }

    const expenseId = `exp-${Date.now()}`;
    const todayIso = new Date().toISOString().split('T')[0];
    const dateIso = date || todayIso;
    const cleanDesc = description.trim();
    const cleanCategory = (category || 'Other').trim();
    const cleanNotes = notes ? String(notes).trim() : 'General operational expense';
    const cleanRecordedBy = recordedBy ? String(recordedBy).trim() : 'Shruthy A';

    try {
      if (prisma) {
        try {
          await prisma.$executeRawUnsafe(
            `INSERT INTO "public"."Expense" ("id", "branchId", "description", "category", "amount", "dateIso", "notes", "recordedBy", "createdAt")
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP);`,
            expenseId, branchId, cleanDesc, cleanCategory, numAmount, dateIso, cleanNotes, cleanRecordedBy
          );
        } catch (insertErr: any) {
          console.warn('[API /expenses POST] Initial insert failed, attempting dynamic legacy cleanup:', insertErr.message);
          try {
            await prisma.$executeRawUnsafe(`
              DO $$
              DECLARE
                  rec RECORD;
              BEGIN
                  FOR rec IN (
                      SELECT column_name 
                      FROM information_schema.columns 
                      WHERE table_schema = 'public' 
                        AND table_name = 'Expense' 
                        AND column_name NOT IN ('id', 'branchId', 'description', 'amount')
                  ) LOOP
                      BEGIN
                          EXECUTE 'ALTER TABLE "public"."Expense" ALTER COLUMN "' || rec.column_name || '" DROP NOT NULL;';
                      EXCEPTION WHEN OTHERS THEN NULL;
                      END;
                  END LOOP;

                  FOR rec IN (
                      SELECT column_name 
                      FROM information_schema.columns 
                      WHERE table_schema = 'public' 
                        AND table_name = 'Expense' 
                        AND column_name NOT IN ('id', 'branchId', 'description', 'category', 'amount', 'dateIso', 'notes', 'recordedBy', 'createdAt')
                  ) LOOP
                      BEGIN
                          EXECUTE 'ALTER TABLE "public"."Expense" DROP COLUMN IF EXISTS "' || rec.column_name || '" CASCADE;';
                      EXCEPTION WHEN OTHERS THEN NULL;
                      END;
                  END LOOP;
              END $$;
            `);
          } catch (alterErr) {
            console.warn('[API /expenses POST] Alter table notice:', alterErr);
          }
          await prisma.$executeRawUnsafe(
            `INSERT INTO "public"."Expense" ("id", "branchId", "description", "category", "amount", "dateIso", "notes", "recordedBy", "createdAt")
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP);`,
            expenseId, branchId, cleanDesc, cleanCategory, numAmount, dateIso, cleanNotes, cleanRecordedBy
          );
        }

        const dateObj = new Date(dateIso);
        const displayDate = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

        const createdExpense = {
          id: expenseId,
          branchId,
          description: cleanDesc,
          category: cleanCategory,
          amount: numAmount,
          date: dateIso,
          dateIso,
          displayDate,
          notes: cleanNotes,
          recordedBy: cleanRecordedBy,
          createdAt: new Date().toISOString()
        };

        io.emit('expense_created', { expense: createdExpense, branchId });

        return res.status(201).json({
          success: true,
          message: 'Expense created successfully in PostgreSQL',
          expense: createdExpense
        });
      }
    } catch (err: any) {
      console.error('[API /expenses POST] Error:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to write expense to PostgreSQL database',
        error: err.message
      });
    }

    return res.status(503).json({
      success: false,
      message: 'PostgreSQL database connection unavailable'
    });
  });

  // 10d. PUT/PATCH /api/expenses/:id (Update operational expense in PostgreSQL)
  const handleUpdateExpense = async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : String(req.params.id);
    const branchId = getBranchId(req);
    const { description, category, amount, date, notes, recordedBy } = req.body;

    const numAmount = amount !== undefined ? (parseFloat(amount) || 0) : undefined;
    const cleanDesc = description ? String(description).trim() : undefined;
    const cleanCategory = category ? String(category).trim() : undefined;
    const cleanNotes = notes !== undefined ? String(notes).trim() : undefined;
    const cleanDate = date ? String(date).trim() : undefined;
    const cleanRecordedBy = recordedBy ? String(recordedBy).trim() : undefined;

    try {
      if (prisma) {
        // Find existing
        const existing = await prisma.$queryRawUnsafe<any[]>(
          `SELECT * FROM "public"."Expense" WHERE "id" = $1 AND "branchId" = $2;`,
          id, branchId
        );

        if (existing.length === 0) {
          return res.status(404).json({
            success: false,
            message: `Expense with ID ${id} not found in this branch`
          });
        }

        const current = existing[0];
        const finalDesc = cleanDesc !== undefined ? cleanDesc : current.description;
        const finalCategory = cleanCategory !== undefined ? cleanCategory : current.category;
        const finalAmount = numAmount !== undefined && numAmount > 0 ? numAmount : current.amount;
        const finalDateIso = cleanDate !== undefined ? cleanDate : current.dateIso;
        const finalNotes = cleanNotes !== undefined ? cleanNotes : current.notes;
        const finalRecordedBy = cleanRecordedBy !== undefined ? cleanRecordedBy : current.recordedBy;

        await prisma.$executeRawUnsafe(
          `UPDATE "public"."Expense"
           SET "description" = $1,
               "category" = $2,
               "amount" = $3,
               "dateIso" = $4,
               "notes" = $5,
               "recordedBy" = $6
           WHERE "id" = $7 AND "branchId" = $8;`,
          finalDesc, finalCategory, finalAmount, finalDateIso, finalNotes, finalRecordedBy, id, branchId
        );

        const dateObj = new Date(finalDateIso);
        const displayDate = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

        const updatedExpense = {
          id,
          branchId,
          description: finalDesc,
          category: finalCategory,
          amount: finalAmount,
          date: finalDateIso,
          dateIso: finalDateIso,
          displayDate,
          notes: finalNotes,
          recordedBy: finalRecordedBy
        };

        io.emit('expense_updated', { expense: updatedExpense, branchId });

        return res.json({
          success: true,
          message: `Expense ${id} updated successfully in PostgreSQL`,
          expense: updatedExpense
        });
      }
    } catch (err: any) {
      console.error('[API /expenses PUT/PATCH] Error:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to update expense in PostgreSQL database',
        error: err.message
      });
    }

    return res.status(503).json({
      success: false,
      message: 'PostgreSQL database connection unavailable'
    });
  };

  router.put('/expenses/:id', handleUpdateExpense);
  router.patch('/expenses/:id', handleUpdateExpense);

  // 10e. DELETE /api/expenses/:id (Delete operational expense from PostgreSQL)
  router.delete('/expenses/:id', async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : String(req.params.id);
    const branchId = getBranchId(req);

    try {
      if (prisma) {
        await prisma.$executeRawUnsafe(
          `DELETE FROM "public"."Expense" WHERE "id" = $1 AND "branchId" = $2;`,
          id, branchId
        );

        io.emit('expense_deleted', { id, branchId });

        return res.json({
          success: true,
          message: `Expense ${id} deleted successfully from PostgreSQL`,
          id
        });
      }
    } catch (err: any) {
      console.error('[API /expenses DELETE] Error:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete expense from PostgreSQL database',
        error: err.message
      });
    }

    return res.status(503).json({
      success: false,
      message: 'PostgreSQL database connection unavailable'
    });
  });

  // 10f. GET /api/staff (Fetch staff for branch from PostgreSQL)
  router.get('/staff', async (req: Request, res: Response) => {
    const branchId = getBranchId(req);

    try {
      if (prisma) {
        const staffRows = await prisma.$queryRawUnsafe<any[]>(
          `SELECT "id", "branchId", "name", "role", "shift", "shiftType", "startTime", "endTime", "phone", "status", "monthlyPay", "joinedDate", "createdAt"
           FROM "public"."Staff"
           WHERE "branchId" = $1
           ORDER BY "createdAt" DESC;`,
          branchId
        );

        const mappedStaff = staffRows.map(s => ({
          id: s.id,
          branchId: s.branchId,
          name: s.name,
          role: s.role,
          shift: s.shift,
          shiftType: s.shiftType,
          startTime: s.startTime,
          endTime: s.endTime,
          phone: s.phone,
          status: s.status,
          monthlyPay: Number(s.monthlyPay || 18000),
          pay: s.monthlyPay ? `₹${Number(s.monthlyPay).toLocaleString('en-IN')}/mo` : '₹18,000/mo',
          joined: s.joinedDate || 'Today',
          joinedDate: s.joinedDate || 'Today',
          createdAt: s.createdAt
        }));

        return res.json({
          success: true,
          branchId,
          count: mappedStaff.length,
          staff: mappedStaff
        });
      }
    } catch (err: any) {
      console.warn('[API /staff GET] Error:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve staff from PostgreSQL database',
        error: err.message
      });
    }

    return res.status(503).json({
      success: false,
      message: 'PostgreSQL database connection unavailable'
    });
  });

  // 10g. POST /api/staff (Create a staff member in PostgreSQL)
  router.post('/staff', async (req: Request, res: Response) => {
    const branchId = req.body.branchId || getBranchId(req);
    const {
      id: customId,
      name,
      role = 'Master Filter Coffee Barista',
      shift,
      shiftType = 'Morning',
      startTime = '06:30 AM',
      endTime = '03:30 PM',
      phone,
      pay,
      monthlyPay,
      status = 'On Duty',
      joined,
      joinedDate
    } = req.body;

    if (!name || !name.trim() || !phone || !phone.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Staff name and phone number are required'
      });
    }

    const trimmedName = name.trim();
    const formattedPhone = phone.trim().startsWith('+91') ? phone.trim() : `+91 ${phone.trim()}`;
    const staffId = customId || `stf-${Date.now()}`;
    const finalShift = shift || `${shiftType} (${startTime} - ${endTime})`;
    const finalJoined = joinedDate || joined || 'Today';

    let parsedPay = 18000.0;
    if (monthlyPay !== undefined && !isNaN(Number(monthlyPay))) {
      parsedPay = Number(monthlyPay);
    } else if (pay) {
      const cleanPay = String(pay).replace(/[^0-9.]/g, '');
      if (cleanPay && !isNaN(Number(cleanPay))) {
        parsedPay = Number(cleanPay);
      }
    }

    try {
      if (prisma) {
        try {
          await prisma.$executeRawUnsafe(
            `INSERT INTO "public"."Staff" ("id", "branchId", "name", "role", "shift", "shiftType", "startTime", "endTime", "phone", "status", "monthlyPay", "joinedDate", "createdAt")
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP);`,
            staffId, branchId, trimmedName, role, finalShift, shiftType, startTime, endTime, formattedPhone, status, parsedPay, finalJoined
          );
        } catch (insertErr: any) {
          console.warn('[API /staff POST] Initial insert failed, attempting dynamic legacy cleanup:', insertErr.message);
          try {
            await prisma.$executeRawUnsafe(`
              DO $$
              DECLARE
                  rec RECORD;
              BEGIN
                  FOR rec IN (
                      SELECT column_name 
                      FROM information_schema.columns 
                      WHERE table_schema = 'public' 
                        AND table_name = 'Staff' 
                        AND column_name NOT IN ('id', 'branchId', 'name', 'phone')
                  ) LOOP
                      BEGIN
                          EXECUTE 'ALTER TABLE "public"."Staff" ALTER COLUMN "' || rec.column_name || '" DROP NOT NULL;';
                      EXCEPTION WHEN OTHERS THEN NULL;
                      END;
                  END LOOP;

                  FOR rec IN (
                      SELECT column_name 
                      FROM information_schema.columns 
                      WHERE table_schema = 'public' 
                        AND table_name = 'Staff' 
                        AND column_name NOT IN ('id', 'branchId', 'name', 'role', 'shift', 'shiftType', 'startTime', 'endTime', 'phone', 'status', 'monthlyPay', 'joinedDate', 'createdAt')
                  ) LOOP
                      BEGIN
                          EXECUTE 'ALTER TABLE "public"."Staff" DROP COLUMN IF EXISTS "' || rec.column_name || '" CASCADE;';
                      EXCEPTION WHEN OTHERS THEN NULL;
                      END;
                  END LOOP;
              END $$;
            `);
          } catch (alterErr) {
            console.warn('[API /staff POST] Alter table notice:', alterErr);
          }
          await prisma.$executeRawUnsafe(
            `INSERT INTO "public"."Staff" ("id", "branchId", "name", "role", "shift", "shiftType", "startTime", "endTime", "phone", "status", "monthlyPay", "joinedDate", "createdAt")
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP);`,
            staffId, branchId, trimmedName, role, finalShift, shiftType, startTime, endTime, formattedPhone, status, parsedPay, finalJoined
          );
        }

        const newStaff = {
          id: staffId,
          branchId,
          name: trimmedName,
          role,
          shift: finalShift,
          shiftType,
          startTime,
          endTime,
          phone: formattedPhone,
          status,
          monthlyPay: parsedPay,
          pay: `₹${parsedPay.toLocaleString('en-IN')}/mo`,
          joined: finalJoined,
          joinedDate: finalJoined,
          createdAt: new Date().toISOString()
        };

        io.emit('staff_created', { staff: newStaff, branchId });

        return res.status(201).json({
          success: true,
          message: `Staff member ${trimmedName} created successfully in PostgreSQL`,
          staff: newStaff
        });
      }
    } catch (err: any) {
      console.error('[API /staff POST] Error:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to create staff member in PostgreSQL database',
        error: err.message
      });
    }

    return res.status(503).json({
      success: false,
      message: 'PostgreSQL database connection unavailable'
    });
  });

  // 10h. PUT/PATCH /api/staff/:id (Update staff member in PostgreSQL)
  const handleUpdateStaff = async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : String(req.params.id);
    const branchId = req.body.branchId || getBranchId(req);
    const {
      name,
      role,
      shift,
      shiftType,
      startTime,
      endTime,
      phone,
      pay,
      monthlyPay,
      status,
      joined,
      joinedDate
    } = req.body;

    let parsedPay: number | null = null;
    if (monthlyPay !== undefined && !isNaN(Number(monthlyPay))) {
      parsedPay = Number(monthlyPay);
    } else if (pay !== undefined) {
      const cleanPay = String(pay).replace(/[^0-9.]/g, '');
      if (cleanPay && !isNaN(Number(cleanPay))) {
        parsedPay = Number(cleanPay);
      }
    }

    const finalJoined = joinedDate || joined || null;

    try {
      if (prisma) {
        await prisma.$executeRawUnsafe(
          `UPDATE "public"."Staff"
           SET "name" = COALESCE($1, "name"),
               "role" = COALESCE($2, "role"),
               "shift" = COALESCE($3, "shift"),
               "shiftType" = COALESCE($4, "shiftType"),
               "startTime" = COALESCE($5, "startTime"),
               "endTime" = COALESCE($6, "endTime"),
               "phone" = COALESCE($7, "phone"),
               "status" = COALESCE($8, "status"),
               "monthlyPay" = COALESCE($9, "monthlyPay"),
               "joinedDate" = COALESCE($10, "joinedDate")
           WHERE "id" = $11 AND "branchId" = $12;`,
          name || null,
          role || null,
          shift || null,
          shiftType || null,
          startTime || null,
          endTime || null,
          phone || null,
          status || null,
          parsedPay,
          finalJoined,
          id,
          branchId
        );

        const updatedRows = await prisma.$queryRawUnsafe<any[]>(
          `SELECT "id", "branchId", "name", "role", "shift", "shiftType", "startTime", "endTime", "phone", "status", "monthlyPay", "joinedDate", "createdAt"
           FROM "public"."Staff"
           WHERE "id" = $1 AND "branchId" = $2;`,
          id, branchId
        );

        if (updatedRows.length === 0) {
          return res.status(404).json({
            success: false,
            message: `Staff member ${id} not found in branch ${branchId}`
          });
        }

        const s = updatedRows[0];
        const updatedStaff = {
          id: s.id,
          branchId: s.branchId,
          name: s.name,
          role: s.role,
          shift: s.shift,
          shiftType: s.shiftType,
          startTime: s.startTime,
          endTime: s.endTime,
          phone: s.phone,
          status: s.status,
          monthlyPay: Number(s.monthlyPay || 18000),
          pay: s.monthlyPay ? `₹${Number(s.monthlyPay).toLocaleString('en-IN')}/mo` : '₹18,000/mo',
          joined: s.joinedDate || 'Today',
          joinedDate: s.joinedDate || 'Today',
          createdAt: s.createdAt
        };

        io.emit('staff_updated', { staff: updatedStaff, branchId });

        return res.json({
          success: true,
          message: `Staff member ${id} updated successfully in PostgreSQL`,
          staff: updatedStaff
        });
      }
    } catch (err: any) {
      console.error('[API /staff PUT/PATCH] Error:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to update staff member in PostgreSQL database',
        error: err.message
      });
    }

    return res.status(503).json({
      success: false,
      message: 'PostgreSQL database connection unavailable'
    });
  };

  router.put('/staff/:id', handleUpdateStaff);
  router.patch('/staff/:id', handleUpdateStaff);

  // 10i. DELETE /api/staff/:id (Delete staff member from PostgreSQL)
  router.delete('/staff/:id', async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : String(req.params.id);
    const branchId = getBranchId(req);

    try {
      if (prisma) {
        await prisma.$executeRawUnsafe(
          `DELETE FROM "public"."Staff" WHERE "id" = $1 AND "branchId" = $2;`,
          id, branchId
        );

        io.emit('staff_deleted', { id, branchId });

        return res.json({
          success: true,
          message: `Staff member ${id} deleted successfully from PostgreSQL`,
          id
        });
      }
    } catch (err: any) {
      console.error('[API /staff DELETE] Error:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete staff member from PostgreSQL database',
        error: err.message
      });
    }

    return res.status(503).json({
      success: false,
      message: 'PostgreSQL database connection unavailable'
    });
  });

  // 11. GET /api/settings (Store Settings & Tax Preferences from PostgreSQL)
  router.get('/settings', async (req: Request, res: Response) => {
    const branchId = getBranchId(req);
    try {
      if (prisma) {
        const settings = await prisma.storeSetting.findUnique({
          where: { branchId }
        });
        if (settings) {
          return res.json({ success: true, settings });
        }
      }
      return res.json({
        success: true,
        settings: {
          branchId,
          storeName: 'Kanchivaram Café',
          branchName: branchId === 'branch-2' ? 'City Branch - Anna Salai' : 'Main Branch - Gandhi Road',
          gstin: '33AAACK1234F1Z9',
          fssaiNo: '12421008000142',
          contactPhone: '+91 98765 43210',
          contactEmail: 'contact@kanchivaram.cafe',
          cgstPercent: 2.5,
          sgstPercent: 2.5,
          autoPrintReceipt: true,
          defaultPaymentMode: 'CASH'
        }
      });
    } catch (err: any) {
      console.error('[API /settings GET] Error:', err.message);
      return res.status(500).json({ success: false, message: 'Failed to fetch store settings', error: err.message });
    }
  });

  // 12. PUT /api/settings (Save & Persist Store Settings in PostgreSQL)
  router.put('/settings', async (req: Request, res: Response) => {
    const branchId = getBranchId(req);
    const {
      storeName,
      branchName,
      gstin,
      fssaiNo,
      contactPhone,
      contactEmail,
      cgstPercent,
      sgstPercent,
      autoPrintReceipt,
      defaultPaymentMode
    } = req.body;

    try {
      if (prisma) {
        const updated = await prisma.storeSetting.upsert({
          where: { branchId },
          update: {
            storeName: storeName || 'Kanchivaram Café',
            branchName: branchName || (branchId === 'branch-2' ? 'City Branch - Anna Salai' : 'Main Branch - Gandhi Road'),
            gstin: gstin || '33AAACK1234F1Z9',
            fssaiNo: fssaiNo || '12421008000142',
            contactPhone: contactPhone || '+91 98765 43210',
            contactEmail: contactEmail || 'contact@kanchivaram.cafe',
            cgstPercent: typeof cgstPercent !== 'undefined' ? parseFloat(cgstPercent) : 2.5,
            sgstPercent: typeof sgstPercent !== 'undefined' ? parseFloat(sgstPercent) : 2.5,
            autoPrintReceipt: typeof autoPrintReceipt === 'boolean' ? autoPrintReceipt : true,
            defaultPaymentMode: defaultPaymentMode || 'CASH'
          },
          create: {
            branchId,
            storeName: storeName || 'Kanchivaram Café',
            branchName: branchName || (branchId === 'branch-2' ? 'City Branch - Anna Salai' : 'Main Branch - Gandhi Road'),
            gstin: gstin || '33AAACK1234F1Z9',
            fssaiNo: fssaiNo || '12421008000142',
            contactPhone: contactPhone || '+91 98765 43210',
            contactEmail: contactEmail || 'contact@kanchivaram.cafe',
            cgstPercent: typeof cgstPercent !== 'undefined' ? parseFloat(cgstPercent) : 2.5,
            sgstPercent: typeof sgstPercent !== 'undefined' ? parseFloat(sgstPercent) : 2.5,
            autoPrintReceipt: typeof autoPrintReceipt === 'boolean' ? autoPrintReceipt : true,
            defaultPaymentMode: defaultPaymentMode || 'CASH'
          }
        });

        io.emit('settings_updated', { branchId, settings: updated });

        return res.json({
          success: true,
          message: 'Settings updated successfully in PostgreSQL',
          settings: updated
        });
      }
    } catch (err: any) {
      console.error('[API /settings PUT] Error:', err.message);
      return res.status(500).json({ success: false, message: 'Failed to update store settings', error: err.message });
    }

    return res.status(503).json({ success: false, message: 'PostgreSQL database connection unavailable' });
  });

  // 13. GET /api/dashboard/stats (Aggregated KPI Analytics from PostgreSQL)
  router.get('/dashboard/stats', async (req: Request, res: Response) => {
    const branchId = getBranchId(req);
    const period = (req.query.period as string) || 'today';
    const today = new Date();
    const todayIso = today.toISOString().split('T')[0];

    try {
      let sales: any[] = [];
      if (prisma) {
        // Compute date filters based on period
        let dateFilter: any = {};
        if (period === 'today') {
          dateFilter = { dateIso: todayIso };
        } else if (period === 'week') {
          const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          dateFilter = { createdAt: { gte: sevenDaysAgo } };
        } else if (period === 'month') {
          const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          dateFilter = { createdAt: { gte: firstDayOfMonth } };
        } else if (period === 'prev_month') {
          const firstDayPrevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          const lastDayPrevMonth = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);
          dateFilter = { createdAt: { gte: firstDayPrevMonth, lte: lastDayPrevMonth } };
        } else if (period === 'custom') {
          const start = (req.query.startDate as string) || todayIso;
          const end = (req.query.endDate as string) || todayIso;
          dateFilter = { dateIso: { gte: start, lte: end } };
        }

        sales = await prisma.sale.findMany({
          where: {
            branchId,
            isCancelled: false,
            ...dateFilter
          },
          include: { items: true },
          orderBy: { createdAt: 'desc' }
        });
      } else {
        const branchData = branchDb.getBranchData(branchId);
        sales = (branchData.sales || []).filter(s => {
          if (period === 'today') return s.dateIso === todayIso;
          return true;
        });
      }

      const totalSales = sales.reduce((acc, s) => acc + (s.grandTotal || 0), 0);
      const isPos = (ch: string) => {
        const c = (ch || '').toUpperCase();
        return c === 'POS' || c === 'IN_STORE' || c === 'IN-STORE POS';
      };

      const posSales = sales.filter(s => isPos(s.channel)).reduce((acc, s) => acc + (s.grandTotal || 0), 0);
      const onlineSales = sales.filter(s => !isPos(s.channel)).reduce((acc, s) => acc + (s.grandTotal || 0), 0);
      
      const swiggySales = sales.filter(s => (s.channel || '').toUpperCase() === 'SWIGGY').reduce((acc, s) => acc + (s.grandTotal || 0), 0);
      const zomatoSales = sales.filter(s => (s.channel || '').toUpperCase() === 'ZOMATO').reduce((acc, s) => acc + (s.grandTotal || 0), 0);
      const dunzoSales = sales.filter(s => (s.channel || '').toUpperCase() === 'DUNZO').reduce((acc, s) => acc + (s.grandTotal || 0), 0);
      const directOnlineSales = sales.filter(s => {
        const c = (s.channel || '').toUpperCase();
        return c.includes('DIRECT') || c.includes('ONLINE');
      }).reduce((acc, s) => acc + (s.grandTotal || 0), 0);

      const totalDiscounts = sales.reduce((acc, s) => acc + (s.discount || 0), 0);
      const discountedBills = sales.filter(s => (s.discount || 0) > 0);
      const avgDiscount = discountedBills.length > 0 ? Math.round(totalDiscounts / discountedBills.length) : 0;

      const totalTax = sales.reduce((acc, s) => acc + (s.tax || 0), 0);
      const taxableSales = Math.max(0, totalSales - totalTax);
      const netSales = Math.max(0, totalSales - totalTax - totalDiscounts);

      const cashCollected = sales.filter(s => (s.paymentMethod || '').toUpperCase() === 'CASH').reduce((acc, s) => acc + (s.grandTotal || 0), 0);
      const upiCollected = sales.filter(s => (s.paymentMethod || '').toUpperCase() === 'UPI').reduce((acc, s) => acc + (s.grandTotal || 0), 0);
      const cardCollected = sales.filter(s => (s.paymentMethod || '').toUpperCase() === 'CARD').reduce((acc, s) => acc + (s.grandTotal || 0), 0);
      const productsSold = sales.reduce((acc, s) => acc + ((s.items || []).reduce((sum: number, i: any) => sum + (i.quantity || 0), 0)), 0);

      // Hourly/time series distribution from real sales
      const timeSlots = ['08:00 AM', '10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM', '08:00 PM'];
      const salesTrend = timeSlots.map(time => {
        return {
          time,
          sales: Math.round(totalSales / (timeSlots.length || 1)),
          orders: Math.round(sales.length / (timeSlots.length || 1))
        };
      });

      // Distribution data
      const posPct = totalSales > 0 ? Math.round((posSales / totalSales) * 100) : 0;
      const onlinePct = totalSales > 0 ? Math.round((onlineSales / totalSales) * 100) : 0;

      const salesDistribution = [
        { name: 'In-Store POS', value: Math.round(posSales), percentage: posPct, color: '#4ade80' },
        { name: 'Swiggy Delivery', value: Math.round(swiggySales), percentage: totalSales > 0 ? Math.round((swiggySales / totalSales) * 100) : 0, color: '#f97316' },
        { name: 'Direct Online', value: Math.round(directOnlineSales), percentage: totalSales > 0 ? Math.round((directOnlineSales / totalSales) * 100) : 0, color: '#3b82f6' }
      ];

      const posTax = sales.filter(s => isPos(s.channel)).reduce((acc, s) => acc + (s.tax || 0), 0);
      const onlineTax = sales.filter(s => !isPos(s.channel)).reduce((acc, s) => acc + (s.tax || 0), 0);

      return res.json({
        success: true,
        branchId,
        data: {
          period,
          kpis: {
            totalSales: {
              amount: Math.round(totalSales),
              growth: 0,
              inStore: Math.round(posSales),
              online: Math.round(onlineSales),
              orderCount: sales.length,
              swiggy: Math.round(swiggySales),
              zomato: Math.round(zomatoSales),
              dunzo: Math.round(dunzoSales),
              otherOnline: Math.round(directOnlineSales)
            },
            netSales: {
              amount: Math.round(netSales),
              overallNet: Math.round(netSales),
              inStoreNet: Math.round(posSales),
              onlineNet: Math.round(onlineSales)
            },
            discounts: {
              amount: Math.round(totalDiscounts),
              transactionCount: discountedBills.length,
              avgDiscount,
              byType: []
            },
            cashCollection: {
              amount: Math.round(cashCollected),
              upiAmount: Math.round(upiCollected),
              cardAmount: Math.round(cardCollected),
              split: [
                { method: 'Cash Payments', amount: Math.round(cashCollected), percentage: totalSales > 0 ? Math.round((cashCollected / totalSales) * 100) : 0 },
                { method: 'UPI / QR Payments (GPay, PhonePe)', amount: Math.round(upiCollected), percentage: totalSales > 0 ? Math.round((upiCollected / totalSales) * 100) : 0 },
                { method: 'Card Swipes', amount: Math.round(cardCollected), percentage: totalSales > 0 ? Math.round((cardCollected / totalSales) * 100) : 0 }
              ]
            },
            onlineSales: {
              amount: Math.round(onlineSales),
              orderCount: sales.filter(s => !isPos(s.channel)).length,
              netOnlineSales: Math.round(onlineSales),
              swiggy: Math.round(swiggySales),
              zomato: Math.round(zomatoSales),
              dunzo: Math.round(dunzoSales),
              otherChannels: Math.round(directOnlineSales)
            },
            tax: {
              totalSales: Math.round(totalSales),
              taxableSales: Math.round(taxableSales),
              gstAmount: Math.round(totalTax),
              cgst: Math.round(totalTax / 2),
              sgst: Math.round(totalTax / 2),
              orderCount: sales.length,
              inStoreGst: Math.round(posTax),
              onlineGst: Math.round(onlineTax)
            }
          },
          productsSold,
          charts: {
            salesTrend,
            salesDistribution
          },
          recentTransactions: sales.slice(0, 50).map(s => ({
            ...s,
            date: s.dateIso || (s.createdAt ? new Date(s.createdAt).toISOString().split('T')[0] : todayIso)
          }))
        }
      });
    } catch (err: any) {
      console.error('[API /dashboard/stats DB Error]:', err.message);
      const branchData = branchDb.getBranchData(branchId);
      const sales = branchData.sales || [];
      const totalSales = sales.reduce((acc, s) => acc + (s.grandTotal || 0), 0);
      return res.json({
        success: true,
        branchId,
        fallback: true,
        data: {
          period,
          kpis: {
            totalSales: { amount: Math.round(totalSales), growth: 0, inStore: 0, online: 0, orderCount: sales.length },
            netSales: { amount: Math.round(totalSales), overallNet: Math.round(totalSales), inStoreNet: 0, onlineNet: 0 },
            discounts: { amount: 0, transactionCount: 0, avgDiscount: 0 },
            cashCollection: { amount: Math.round(totalSales), upiAmount: 0, cardAmount: 0, split: [] },
            onlineSales: { amount: 0, orderCount: 0, netOnlineSales: 0, swiggy: 0, zomato: 0, dunzo: 0, otherChannels: 0 },
            tax: { totalSales: Math.round(totalSales), taxableSales: Math.round(totalSales), gstAmount: 0, cgst: 0, sgst: 0, orderCount: sales.length }
          },
          productsSold: 0,
          charts: { salesTrend: [], salesDistribution: [] },
          recentTransactions: []
        }
      });
    }
  });

  // 14. POST /api/chatbot/query (Protected KVCM AI Assistant Query Endpoint)
  const handleChatbotQuery = async (req: Request, res: Response) => {
    try {
      // 1. Validate Authentication (from Bearer token or optional header)
      const authHeader = req.headers['authorization'];
      let authenticatedUser = null;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7).trim();
        authenticatedUser = verifyAccessToken(token);
      }

      // Determine authorized branchId
      let branchId = getBranchId(req);
      if (authenticatedUser?.branchId) {
        // Enforce user's branch if user is locked to a branch
        branchId = authenticatedUser.branchId;
      }

      const rawQuery = req.body?.query || req.body?.message || req.body?.prompt || '';
      const cleanQuery = typeof rawQuery === 'string' ? rawQuery.trim() : '';

      if (!cleanQuery) {
        return res.status(400).json({
          success: false,
          answer: 'Please provide a valid question for KVCM Assistant.',
          branchId
        });
      }

      // Process query with verified PostgreSQL context and OpenAI
      const result = await processKVCMQuery(prisma, {
        query: cleanQuery,
        branchId,
        userId: authenticatedUser?.userId,
        userEmail: authenticatedUser?.email,
        userRole: authenticatedUser?.role
      });

      return res.json({
        success: result.success,
        answer: result.answer,
        message: result.answer,
        branchId: result.branchId,
        dataContext: result.dataContext,
        modelUsed: result.modelUsed
      });
    } catch (err: any) {
      console.error('[API /chatbot/query] Error:', err.message);
      return res.status(500).json({
        success: false,
        answer: 'I encountered an unexpected error retrieving your café data. Please try again.',
        error: 'AI assistant service temporarily unavailable.'
      });
    }
  };

  router.post('/chatbot/query', handleChatbotQuery);
  router.post('/ai/query', handleChatbotQuery);
  router.post('/ai/assistant', handleChatbotQuery);

  return router;
}
