import { Request, Response } from 'express';
import Alert from '../models/Alert';
import { User } from '../models/User';
import { Announcement } from '../models/Announcement';
import { Trip } from '../models/Trip';
import { sendAlertNotificationEmail } from '../utils/emailService';

// Créer une alerte
export const createAlert = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const {
      type,
      fromCity,
      fromCountry,
      toCity,
      toCountry,
      dateFrom,
      dateTo,
      maxWeight,
      minWeight,
      maxReward,
      minReward,
      notificationMethod,
    } = req.body;

    // Vérifier si l'utilisateur a déjà 5 alertes actives (limite)
    const activeAlertsCount = await Alert.countDocuments({
      userId,
      isActive: true,
    });

    if (activeAlertsCount >= 5) {
      return res.status(400).json({
        success: false,
        message: 'Vous avez atteint la limite de 5 alertes actives',
      });
    }

    const alert = new Alert({
      userId,
      type,
      fromCity,
      fromCountry,
      toCity,
      toCountry,
      dateFrom,
      dateTo,
      maxWeight,
      minWeight,
      maxReward,
      minReward,
      notificationMethod: notificationMethod || 'both',
    });

    await alert.save();

    res.status(201).json({
      success: true,
      message: 'Alerte créée avec succès',
      data: { alert },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Récupérer les alertes de l'utilisateur
export const getMyAlerts = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;

    const alerts = await Alert.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { alerts },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Récupérer une alerte par ID
export const getAlertById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const { id } = req.params;

    const alert = await Alert.findOne({ _id: id, userId });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alerte non trouvée',
      });
    }

    res.status(200).json({
      success: true,
      data: { alert },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Mettre à jour une alerte
export const updateAlert = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const { id } = req.params;
    const updateData = req.body;

    const alert = await Alert.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alerte non trouvée',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Alerte mise à jour',
      data: { alert },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Supprimer une alerte
export const deleteAlert = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const { id } = req.params;

    const alert = await Alert.findOneAndDelete({ _id: id, userId });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alerte non trouvée',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Alerte supprimée',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Activer/Désactiver une alerte
export const toggleAlert = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const { id } = req.params;

    const alert = await Alert.findOne({ _id: id, userId });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alerte non trouvée',
      });
    }

    alert.isActive = !alert.isActive;
    await alert.save();

    res.status(200).json({
      success: true,
      message: alert.isActive ? 'Alerte activée' : 'Alerte désactivée',
      data: { alert },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Vérifier les alertes correspondantes lors de la création d'une annonce
export const checkMatchingAlerts = async (
  announcementOrTrip: any,
  type: 'announcement' | 'trip'
) => {
  try {
    const query: any = { isActive: true };

    // Si c'est une annonce (sender), chercher les alertes de type shipper
    // Si c'est un trajet (shipper), chercher les alertes de type sender
    query.type = type === 'announcement' ? 'shipper' : 'sender';

    // Critères de localisation
    const from = announcementOrTrip.from;
    const to = announcementOrTrip.to;

    const alerts = await Alert.find(query).populate('userId', 'email name');

    const matchingAlerts = alerts.filter((alert) => {
      // Vérifier la ville de départ
      if (alert.fromCity && from.city) {
        if (alert.fromCity.toLowerCase() !== from.city.toLowerCase()) {
          return false;
        }
      }

      // Vérifier la ville d'arrivée
      if (alert.toCity && to.city) {
        if (alert.toCity.toLowerCase() !== to.city.toLowerCase()) {
          return false;
        }
      }

      // Vérifier les dates
      const itemDate = type === 'announcement' 
        ? new Date(announcementOrTrip.dateFrom)
        : new Date(announcementOrTrip.departureDate);

      if (alert.dateFrom && itemDate < new Date(alert.dateFrom)) {
        return false;
      }

      if (alert.dateTo && itemDate > new Date(alert.dateTo)) {
        return false;
      }

      // Vérifier le poids
      const weight = type === 'announcement'
        ? announcementOrTrip.weight
        : announcementOrTrip.availableKg;

      if (weight) {
        if (alert.minWeight && weight < alert.minWeight) {
          return false;
        }
        if (alert.maxWeight && weight > alert.maxWeight) {
          return false;
        }
      }

      // Vérifier la récompense/prix
      const reward = type === 'announcement'
        ? announcementOrTrip.reward
        : announcementOrTrip.pricePerKg;

      if (reward) {
        if (alert.minReward && reward < alert.minReward) {
          return false;
        }
        if (alert.maxReward && reward > alert.maxReward) {
          return false;
        }
      }

      return true;
    });

    // Mettre à jour le compteur de matchs et la date de dernière notification
    for (const alert of matchingAlerts) {
      alert.matchCount += 1;
      alert.lastNotifiedAt = new Date();
      await alert.save();

      // Envoyer notification par email
      const user = alert.userId as any;
      if (user && user.email && user.isEmailVerified) {
        try {
          const matchDetails = {
            from: announcementOrTrip.from,
            to: announcementOrTrip.to,
            date: type === 'announcement' 
              ? announcementOrTrip.dateFrom 
              : announcementOrTrip.departureDate,
            weight: type === 'announcement'
              ? announcementOrTrip.weight
              : announcementOrTrip.availableKg,
            price: type === 'announcement'
              ? announcementOrTrip.reward
              : announcementOrTrip.pricePerKg,
          };

          await sendAlertNotificationEmail(
            user.email,
            user.name,
            alert.type,
            matchDetails
          );
        } catch (error) {
          console.error('Error sending alert notification email:', error);
          // Don't fail the alert matching process if email fails
        }
      }
    }

    return matchingAlerts;
  } catch (error) {
    console.error('Erreur lors de la vérification des alertes:', error);
    return [];
  }
};

// Récupérer les annonces/trajets correspondant à une alerte
export const getMatchesForAlert = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const { id } = req.params;

    const alert = await Alert.findOne({ _id: id, userId });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alerte non trouvée',
      });
    }

    const query: any = { status: 'active' };

    if (alert.fromCity) {
      query['from.city'] = new RegExp(alert.fromCity, 'i');
    }
    if (alert.toCity) {
      query['to.city'] = new RegExp(alert.toCity, 'i');
    }

    let matches: any[] = [];

    if (alert.type === 'sender') {
      // Chercher des trajets
      const dateQuery: any = {};
      if (alert.dateFrom) dateQuery.$gte = alert.dateFrom;
      if (alert.dateTo) dateQuery.$lte = alert.dateTo;
      if (Object.keys(dateQuery).length > 0) {
        query.departureDate = dateQuery;
      }

      matches = await Trip.find(query)
        .populate('userId', 'name avatarUrl verified rating')
        .sort({ createdAt: -1 })
        .limit(20);
    } else {
      // Chercher des annonces
      const dateQuery: any = {};
      if (alert.dateFrom) dateQuery.$gte = alert.dateFrom;
      if (alert.dateTo) dateQuery.$lte = alert.dateTo;
      if (Object.keys(dateQuery).length > 0) {
        query.dateFrom = dateQuery;
      }

      matches = await Announcement.find(query)
        .populate('userId', 'name avatarUrl verified rating')
        .sort({ createdAt: -1 })
        .limit(20);
    }

    res.status(200).json({
      success: true,
      data: { 
        alert,
        matches,
        matchType: alert.type === 'sender' ? 'trips' : 'announcements'
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
