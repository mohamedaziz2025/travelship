import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { User, IUser } from '../models/User'
import { config } from '../config'
import { AppError } from './errorHandler'

export interface AuthRequest extends Request {
  user?: IUser
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined

    // Get token from Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
      return next(new AppError('Non autorisé - Token manquant', 401))
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret) as { id: string }

    // Get user from token
    const user = await User.findById(decoded.id).select('-password')

    if (!user) {
      return next(new AppError('Utilisateur non trouvé', 404))
    }

    req.user = user
    next()
  } catch (error) {
    next(new AppError('Non autorisé - Token invalide', 401))
  }
}

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError('Non autorisé - Permissions insuffisantes', 403)
      )
    }
    
    // Check if user is blocked
    if (req.user.status === 'blocked' || req.user.status === 'suspended') {
      return next(
        new AppError('Votre compte a été suspendu', 403)
      )
    }
    
    next()
  }
}

export const authorizeAdmin = (requiredRole?: 'superadmin' | 'moderator') => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== 'admin') {
      return next(
        new AppError('Non autorisé - Accès admin requis', 403)
      )
    }
    
    if (requiredRole && req.user.adminRole !== requiredRole && req.user.adminRole !== 'superadmin') {
      return next(
        new AppError('Non autorisé - Permissions admin insuffisantes', 403)
      )
    }
    
    next()
  }
}
