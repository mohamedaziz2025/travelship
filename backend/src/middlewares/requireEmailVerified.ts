import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { AppError } from './errorHandler';

// Middleware to check if user's email is verified
export const requireEmailVerified = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;

    if (!user) {
      return next(new AppError('Utilisateur non authentifié', 401));
    }

    // Admins don't need email verification
    if (user.role === 'admin') {
      return next();
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return next(
        new AppError(
          'Veuillez vérifier votre adresse email avant d\'utiliser cette fonctionnalité',
          403
        )
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};
