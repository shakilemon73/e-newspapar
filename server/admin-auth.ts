import { Request, Response } from 'express';

// Simple in-memory session storage for admin authentication
// In production, use Redis or database
const adminSessions = new Map<string, { email: string, loginTime: number }>();

// Default admin credentials (change these in production)
const ADMIN_CREDENTIALS = {
  email: 'admin@news.com',
  password: 'admin123456',
  username: 'admin'
};

// Session timeout (24 hours)
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000;

// Generate random session token
function generateSessionToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Clean expired sessions
function cleanExpiredSessions() {
  const now = Date.now();
  for (const [token, session] of adminSessions.entries()) {
    if (now - session.loginTime > SESSION_TIMEOUT) {
      adminSessions.delete(token);
    }
  }
}

// Admin login function
export const adminLogin = async (req: Request, res: Response) => {
  try {
    const { email, password, username } = req.body;
    
    // Clean expired sessions first
    cleanExpiredSessions();
    
    // Check credentials
    const isValidEmail = email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password;
    const isValidUsername = username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password;
    
    if (!isValidEmail && !isValidUsername) {
      return res.status(401).json({ 
        error: 'Invalid admin credentials',
        message: 'অ্যাডমিন ইমেইল/ইউজারনেম অথবা পাসওয়ার্ড ভুল' 
      });
    }
    
    // Create session
    const sessionToken = generateSessionToken();
    adminSessions.set(sessionToken, {
      email: ADMIN_CREDENTIALS.email,
      loginTime: Date.now()
    });
    
    // Set session cookie
    res.cookie('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: SESSION_TIMEOUT,
      sameSite: 'strict'
    });
    
    console.log(`Admin login successful for: ${email || username}`);
    
    return res.json({
      success: true,
      message: 'Admin login successful',
      admin: {
        email: ADMIN_CREDENTIALS.email,
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
};

// Admin logout function
export const adminLogout = async (req: Request, res: Response) => {
  try {
    const sessionToken = req.cookies.admin_session;
    
    if (sessionToken) {
      adminSessions.delete(sessionToken);
    }
    
    res.clearCookie('admin_session');
    
    return res.json({
      success: true,
      message: 'Admin logout successful'
    });
  } catch (error) {
    console.error('Admin logout error:', error);
    return res.status(500).json({ error: 'Logout failed' });
  }
};

// Admin authentication middleware
export const requireAdminSession = (req: Request, res: Response, next: Function) => {
  try {
    const sessionToken = req.cookies.admin_session;
    
    if (!sessionToken) {
      return res.status(401).json({ 
        error: 'Admin session required',
        message: 'অ্যাডমিন লগইন প্রয়োজন'
      });
    }
    
    const session = adminSessions.get(sessionToken);
    
    if (!session) {
      res.clearCookie('admin_session');
      return res.status(401).json({ 
        error: 'Invalid admin session',
        message: 'অকার্যকর অ্যাডমিন সেশন'
      });
    }
    
    // Check if session is expired
    if (Date.now() - session.loginTime > SESSION_TIMEOUT) {
      adminSessions.delete(sessionToken);
      res.clearCookie('admin_session');
      return res.status(401).json({ 
        error: 'Admin session expired',
        message: 'অ্যাডমিন সেশনের মেয়াদ শেষ'
      });
    }
    
    // Add admin info to request
    (req as any).admin = {
      email: session.email,
      role: 'admin'
    };
    
    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    return res.status(500).json({ error: 'Authentication error' });
  }
};

// Check admin session status
export const checkAdminSession = async (req: Request, res: Response) => {
  try {
    const sessionToken = req.cookies.admin_session;
    
    if (!sessionToken) {
      return res.json({ 
        authenticated: false,
        message: 'No admin session found'
      });
    }
    
    const session = adminSessions.get(sessionToken);
    
    if (!session || (Date.now() - session.loginTime > SESSION_TIMEOUT)) {
      if (session) adminSessions.delete(sessionToken);
      res.clearCookie('admin_session');
      return res.json({ 
        authenticated: false,
        message: 'Admin session expired'
      });
    }
    
    return res.json({
      authenticated: true,
      admin: {
        email: session.email,
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('Check admin session error:', error);
    return res.status(500).json({ error: 'Session check failed' });
  }
};

// Get active admin sessions (for debugging)
export const getAdminSessions = () => {
  cleanExpiredSessions();
  return {
    count: adminSessions.size,
    sessions: Array.from(adminSessions.entries()).map(([token, session]) => ({
      token: token.substring(0, 8) + '...',
      email: session.email,
      loginTime: new Date(session.loginTime).toISOString()
    }))
  };
};