import { Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'
import jwt from 'jsonwebtoken'
import { User } from '../models/User'
import { config } from '../config'
import { AppError } from '../middlewares/errorHandler'
import { AuthRequest } from '../middlewares/auth'

// Generate JWT tokens
const generateTokens = (userId: string) => {
  const accessToken = jwt.sign(
    { id: userId },
    config.jwtSecret as any,
    { expiresIn: config.jwtExpire } as any
  )

  const refreshToken = jwt.sign(
    { id: userId },
    config.jwtRefreshSecret as any,
    { expiresIn: config.jwtRefreshExpire } as any
  )

  return { accessToken, refreshToken }
}

// @desc    Register user
// @route   POST /api/v1/auth/register
export const register = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { name, email, password, role } = req.body

    // Check if user exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return next(new AppError('Cet email est déjà utilisé', 400))
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'both',
    })

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id.toString())

    // Save refresh token
    user.refreshTokens.push(refreshToken)
    await user.save()

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          verified: user.verified,
          avatarUrl: user.avatarUrl,
          badges: user.badges,
          stats: user.stats,
        },
        accessToken,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Login user
// @route   POST /api/v1/auth/login
export const login = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { email, password } = req.body

    // Find user
    const user = await User.findOne({ email }).select('+password +refreshTokens')
    if (!user) {
      return next(new AppError('Email ou mot de passe incorrect', 401))
    }

    // Check password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return next(new AppError('Email ou mot de passe incorrect', 401))
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id.toString())

    // Save refresh token
    user.refreshTokens.push(refreshToken)
    await user.save()

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          verified: user.verified,
          avatarUrl: user.avatarUrl,
          badges: user.badges,
          stats: user.stats,
        },
        accessToken,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Refresh access token
// @route   POST /api/v1/auth/refresh
export const refreshToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.cookies.refreshToken

    if (!refreshToken) {
      return next(new AppError('Token de rafraîchissement manquant', 401))
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret) as {
      id: string
    }

    // Find user and check if refresh token is valid
    const user = await User.findById(decoded.id).select('+refreshTokens')
    if (!user || !user.refreshTokens.includes(refreshToken)) {
      return next(new AppError('Token de rafraîchissement invalide', 401))
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { id: user._id },
      config.jwtSecret as any,
      { expiresIn: config.jwtExpire } as any
    )

    res.json({
      success: true,
      data: { accessToken },
    })
  } catch (error) {
    next(new AppError('Token de rafraîchissement invalide', 401))
  }
}

// @desc    Login admin
// @route   POST /api/v1/auth/admin/login
export const adminLogin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { email, password } = req.body

    // Find user and check if admin
    const user = await User.findOne({ email, role: 'admin' }).select('+password +refreshTokens')
    if (!user) {
      return next(new AppError('Accès refusé. Identifiants administrateur invalides', 401))
    }

    // Check if user is blocked or suspended
    if (user.status !== 'active') {
      return next(new AppError('Votre compte administrateur est ' + user.status, 403))
    }

    // Check password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return next(new AppError('Accès refusé. Identifiants administrateur invalides', 401))
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id.toString())

    // Save refresh token
    user.refreshTokens.push(refreshToken)
    await user.save()

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          adminRole: user.adminRole,
          verified: user.verified,
          avatarUrl: user.avatarUrl,
          badges: user.badges,
          stats: user.stats,
        },
        accessToken,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Logout user
// @route   POST /api/v1/auth/logout
export const logout = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.cookies.refreshToken

    if (refreshToken && req.user) {
      // Remove refresh token from database
      const user = await User.findById(req.user._id).select('+refreshTokens')
      if (user) {
        user.refreshTokens = user.refreshTokens.filter(
          (token) => token !== refreshToken
        )
        await user.save()
      }
    }

    // Clear cookie
    res.clearCookie('refreshToken')

    res.json({
      success: true,
      message: 'Déconnexion réussie',
    })
  } catch (error) {
    next(error)
  }
}
