import { Response, NextFunction } from 'express'
import { Announcement } from '../models/Announcement'
import { AppError } from '../middlewares/errorHandler'
import { AuthRequest } from '../middlewares/auth'
import { checkMatchingAlerts } from './alert.controller'

// @desc    Create announcement
// @route   POST /api/v1/announcements
export const createAnnouncement = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const announcement = await Announcement.create({
      ...req.body,
      userId: req.user?._id,
    })

    await announcement.populate('userId', 'name email avatarUrl verified stats')

    // Vérifier les alertes correspondantes et notifier les utilisateurs
    try {
      const matchingAlerts = await checkMatchingAlerts(announcement, 'announcement')
      console.log(`📢 ${matchingAlerts.length} alertes correspondent à cette annonce`)
      // TODO: Envoyer notifications email/push aux utilisateurs
    } catch (alertError) {
      console.error('Erreur lors de la vérification des alertes:', alertError)
    }

    res.status(201).json({
      success: true,
      data: { announcement },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get all announcements
// @route   GET /api/v1/announcements
export const getAnnouncements = async (
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
      type,
      userType,
      transportType,
      weightRange,
      serviceType,
      packageType,
      minReward,
      maxReward,
      isUrgent,
      premium,
      sortBy = 'recent', // recent, price-asc, price-desc
      page = 1,
      limit = 20,
    } = req.query

    const query: any = { status: 'active' }

    // Filtres de base
    if (from) query['from.city'] = new RegExp(from as string, 'i')
    if (to) query['to.city'] = new RegExp(to as string, 'i')
    if (type) query.type = type
    if (userType) query.userType = userType
    if (premium) query.premium = premium === 'true'

    // Filtres spécifiques Shipper/Sender
    if (transportType) query.transportType = transportType
    if (weightRange) query.weightRange = weightRange
    if (serviceType) query.serviceType = serviceType
    if (packageType) {
      // Pour "both", on accepte aussi les annonces avec packageType "both"
      if (packageType === 'both') {
        query.packageType = 'both'
      } else {
        query.packageType = { $in: [packageType, 'both'] }
      }
    }
    if (isUrgent !== undefined) query.isUrgent = isUrgent === 'true'

    // Filtrage par intervalle de dates
    if (dateFrom || dateTo) {
      query.$and = query.$and || []
      if (dateFrom && dateTo) {
        // L'annonce doit chevaucher la période recherchée
        query.$and.push({
          $or: [
            {
              dateFrom: { $lte: new Date(dateTo as string) },
              dateTo: { $gte: new Date(dateFrom as string) },
            },
          ],
        })
      } else if (dateFrom) {
        query.dateTo = { $gte: new Date(dateFrom as string) }
      } else if (dateTo) {
        query.dateFrom = { $lte: new Date(dateTo as string) }
      }
    }

    // Filtrage par prix
    if (minReward || maxReward) {
      query.reward = {}
      if (minReward) query.reward.$gte = Number(minReward)
      if (maxReward) query.reward.$lte = Number(maxReward)
    }

    // Définir l'ordre de tri
    let sortOptions: any = {}
    switch (sortBy) {
      case 'price-asc':
        sortOptions = { reward: 1 }
        break
      case 'price-desc':
        sortOptions = { reward: -1 }
        break
      case 'recent':
      default:
        sortOptions = { createdAt: -1 }
        break
    }

    const skip = (Number(page) - 1) * Number(limit)

    const [announcements, total] = await Promise.all([
      Announcement.find(query)
        .populate('userId', 'name email avatarUrl verified stats')
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit)),
      Announcement.countDocuments(query),
    ])

    res.json({
      success: true,
      data: {
        announcements,
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

// @desc    Get announcement by ID
// @route   GET /api/v1/announcements/:id
export const getAnnouncementById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const announcement = await Announcement.findById(req.params.id).populate(
      'userId',
      'name email avatarUrl verified stats badges'
    )

    if (!announcement) {
      return next(new AppError('Annonce non trouvée', 404))
    }

    // Increment views
    announcement.views += 1
    await announcement.save()

    res.json({
      success: true,
      data: { announcement },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Update announcement
// @route   PATCH /api/v1/announcements/:id
export const updateAnnouncement = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let announcement = await Announcement.findById(req.params.id)

    if (!announcement) {
      return next(new AppError('Annonce non trouvée', 404))
    }

    // Check ownership
    if (announcement.userId.toString() !== req.user?._id.toString()) {
      return next(new AppError('Non autorisé', 403))
    }

    announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate('userId', 'name email avatarUrl verified stats')

    res.json({
      success: true,
      data: { announcement },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Delete announcement
// @route   DELETE /api/v1/announcements/:id
export const deleteAnnouncement = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const announcement = await Announcement.findById(req.params.id)

    if (!announcement) {
      return next(new AppError('Annonce non trouvée', 404))
    }

    // Check ownership
    if (announcement.userId.toString() !== req.user?._id.toString()) {
      return next(new AppError('Non autorisé', 403))
    }

    await announcement.deleteOne()

    res.json({
      success: true,
      message: 'Annonce supprimée',
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get user's own announcements
// @route   GET /api/v1/announcements/my
export const getMyAnnouncements = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const announcements = await Announcement.find({ userId: req.user?._id })
      .populate('userId', 'name email avatarUrl verified stats')
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      data: { announcements },
    })
  } catch (error) {
    next(error)
  }
}
