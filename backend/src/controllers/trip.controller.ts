import { Response, NextFunction } from 'express'
import { Trip } from '../models/Trip'
import { AppError } from '../middlewares/errorHandler'
import { AuthRequest } from '../middlewares/auth'
import { checkMatchingAlerts } from './alert.controller'

// @desc    Create trip
// @route   POST /api/v1/trips
export const createTrip = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const trip = await Trip.create({
      ...req.body,
      userId: req.user?._id,
    })

    await trip.populate('userId', 'name email avatarUrl verified stats')

    // Vérifier les alertes correspondantes et notifier les utilisateurs
    try {
      const matchingAlerts = await checkMatchingAlerts(trip, 'trip')
      console.log(`📢 ${matchingAlerts.length} alertes correspondent à ce trajet`)
      // TODO: Envoyer notifications email/push aux utilisateurs
    } catch (alertError) {
      console.error('Erreur lors de la vérification des alertes:', alertError)
    }

    res.status(201).json({
      success: true,
      data: { trip },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get all trips
// @route   GET /api/v1/trips
export const getTrips = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      from,
      to,
      dateFrom,
      dateTo,
      minKg,
      page = 1,
      limit = 20,
    } = req.query

    const query: any = { status: 'active' }

    if (from) query['from.city'] = new RegExp(from as string, 'i')
    if (to) query['to.city'] = new RegExp(to as string, 'i')
    if (minKg) query.availableKg = { $gte: Number(minKg) }

    if (dateFrom || dateTo) {
      query.dateFrom = {}
      if (dateFrom) query.dateFrom.$gte = new Date(dateFrom as string)
      if (dateTo) query.dateFrom.$lte = new Date(dateTo as string)
    }

    const skip = (Number(page) - 1) * Number(limit)

    const [trips, total] = await Promise.all([
      Trip.find(query)
        .populate('userId', 'name email avatarUrl verified stats')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Trip.countDocuments(query),
    ])

    res.json({
      success: true,
      data: {
        trips,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get trip by ID
// @route   GET /api/v1/trips/:id
export const getTripById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const trip = await Trip.findById(req.params.id).populate(
      'userId',
      'name email avatarUrl verified stats badges'
    )

    if (!trip) {
      return next(new AppError('Trajet non trouvé', 404))
    }

    // Increment views
    trip.views += 1
    await trip.save()

    res.json({
      success: true,
      data: { trip },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Update trip
// @route   PATCH /api/v1/trips/:id
export const updateTrip = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let trip = await Trip.findById(req.params.id)

    if (!trip) {
      return next(new AppError('Trajet non trouvé', 404))
    }

    // Check ownership
    if (trip.userId.toString() !== req.user?._id.toString()) {
      return next(new AppError('Non autorisé', 403))
    }

    trip = await Trip.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('userId', 'name email avatarUrl verified stats')

    res.json({
      success: true,
      data: { trip },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Delete trip
// @route   DELETE /api/v1/trips/:id
export const deleteTrip = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const trip = await Trip.findById(req.params.id)

    if (!trip) {
      return next(new AppError('Trajet non trouvé', 404))
    }

    // Check ownership
    if (trip.userId.toString() !== req.user?._id.toString()) {
      return next(new AppError('Non autorisé', 403))
    }

    await trip.deleteOne()

    res.json({
      success: true,
      message: 'Trajet supprimé',
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get user's own trips
// @route   GET /api/v1/trips/my
export const getMyTrips = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const trips = await Trip.find({ userId: req.user?._id })
      .populate('userId', 'name email avatarUrl verified stats')
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      data: { trips },
    })
  } catch (error) {
    next(error)
  }
}
