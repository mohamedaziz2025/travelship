import { Router } from 'express'
import { body } from 'express-validator'
import { 
  register, 
  login, 
  adminLogin, 
  refreshToken, 
  logout,
  verifyEmail,
  resendVerificationEmail
} from '../controllers/auth.controller'

const router = Router()

// @route   POST /api/v1/auth/register
// @desc    Register user
// @access  Public
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Le nom est requis'),
    body('email').isEmail().withMessage('Email invalide'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Le mot de passe doit contenir au moins 6 caractères'),
    body('role')
      .optional()
      .isIn(['sender', 'shipper', 'both'])
      .withMessage('Rôle invalide'),
  ],
  register
)

// @route   POST /api/v1/auth/login
// @desc    Login user
// @access  Public
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email invalide'),
    body('password').notEmpty().withMessage('Le mot de passe est requis'),
  ],
  login
)

// @route   POST /api/v1/auth/admin/login
// @desc    Login admin
// @access  Public
router.post(
  '/admin/login',
  [
    body('email').isEmail().withMessage('Email invalide'),
    body('password').notEmpty().withMessage('Le mot de passe est requis'),
  ],
  adminLogin
)

// @route   POST /api/v1/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh', refreshToken)

// @route   GET /api/v1/auth/verify-email/:token
// @desc    Verify email address
// @access  Public
router.get('/verify-email/:token', verifyEmail)

// @route   POST /api/v1/auth/resend-verification
// @desc    Resend verification email
// @access  Public
router.post(
  '/resend-verification',
  [body('email').isEmail().withMessage('Email invalide')],
  resendVerificationEmail
)

// @route   POST /api/v1/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', logout)

export default router
