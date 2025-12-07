import { Request, Response, NextFunction } from 'express'

export class AppError extends Error {
  statusCode: number
  isOperational: boolean

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = err.statusCode || 500
  let message = err.message || 'Erreur serveur'

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400
    message = Object.values(err.errors)
      .map((e: any) => e.message)
      .join(', ')
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 400
    message = 'Cette valeur existe déjà'
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401
    message = 'Token invalide'
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401
    message = 'Token expiré'
  }

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err)
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}
