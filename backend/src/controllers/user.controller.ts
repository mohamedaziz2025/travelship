import { Response, NextFunction } from 'express'
import { User } from '../models/User'
import { AppError } from '../middlewares/errorHandler'
import { AuthRequest } from '../middlewares/auth'

// @desc    Get current user
// @route   GET /api/v1/users/me
export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.user?._id)

    if (!user) {
      return next(new AppError('Utilisateur non trouvé', 404))
    }

    res.json({
      success: true,
      data: { user },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Update current user
// @route   PATCH /api/v1/users/me
export const updateMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const allowedFields = ['name', 'phone', 'avatarUrl']
    const updates: any = {}

    Object.keys(req.body).forEach((key) => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key]
      }
    })

    const user = await User.findByIdAndUpdate(req.user?._id, updates, {
      new: true,
      runValidators: true,
    })

    if (!user) {
      return next(new AppError('Utilisateur non trouvé', 404))
    }

    res.json({
      success: true,
      data: { user },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get user by ID (public profile)
// @route   GET /api/v1/users/:id
export const getUserById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params

    const user = await User.findById(id).select(
      'name email avatarUrl verified stats createdAt'
    )

    if (!user) {
      return next(new AppError('Utilisateur non trouvé', 404))
    }

    res.json({
      success: true,
      data: { user },
    })
  } catch (error) {
    next(error)
  }
}
