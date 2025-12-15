import { transporter } from '../config/email';
import crypto from 'crypto';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Generate verification token
export const generateVerificationToken = (): { token: string, expires: Date } => {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date();
  expires.setHours(expires.getHours() + 24); // Token valid for 24 hours
  return { token, expires };
};

// Send email verification email
export const sendVerificationEmail = async (
  email: string,
  name: string,
  token: string
): Promise<void> => {
  const verificationUrl = `${FRONTEND_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: '"ShipperTrip" <admin@shippertrip.com>',
    to: email,
    subject: 'Vérifiez votre adresse email - ShipperTrip',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
          }
          .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 30px; 
            text-align: center; 
            border-radius: 10px 10px 0 0; 
          }
          .content { 
            background: #f9f9f9; 
            padding: 30px; 
            border-radius: 0 0 10px 10px; 
          }
          .button { 
            display: inline-block; 
            padding: 15px 30px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white !important; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0; 
            font-weight: bold; 
          }
          .footer { 
            text-align: center; 
            margin-top: 20px; 
            font-size: 12px; 
            color: #666; 
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Bienvenue sur ShipperTrip !</h1>
        </div>
        <div class="content">
          <p>Bonjour <strong>${name}</strong>,</p>
          
          <p>Merci de vous être inscrit sur ShipperTrip ! Pour commencer à utiliser votre compte, veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous :</p>
          
          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">Vérifier mon email</a>
          </div>
          
          <p>Ou copiez-collez ce lien dans votre navigateur :</p>
          <p style="word-break: break-all; background: #fff; padding: 10px; border-radius: 5px;">
            ${verificationUrl}
          </p>
          
          <p><strong>Ce lien est valide pendant 24 heures.</strong></p>
          
          <p>Si vous n'avez pas créé de compte sur ShipperTrip, vous pouvez ignorer cet email.</p>
          
          <p>Cordialement,<br>L'équipe ShipperTrip</p>
        </div>
        <div class="footer">
          <p>© 2025 ShipperTrip. Tous droits réservés.</p>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${email}`);
  } catch (error) {
    console.error(`❌ Error sending verification email to ${email}:`, error);
    throw new Error('Failed to send verification email');
  }
};

// Send alert notification email
export const sendAlertNotificationEmail = async (
  userEmail: string,
  userName: string,
  alertType: 'sender' | 'shipper',
  matchDetails: {
    from: { city: string; country: string };
    to: { city: string; country: string };
    date?: string;
    price?: number;
    weight?: number;
  }
): Promise<void> => {
  const alertsUrl = `${FRONTEND_URL}/alerts`;
  
  const matchType = alertType === 'sender' ? 'un voyageur' : 'une annonce de colis';
  const matchTitle = alertType === 'sender' ? 'Nouveau voyageur disponible' : 'Nouveau colis à transporter';

  const mailOptions = {
    from: '"ShipperTrip" <admin@shippertrip.com>',
    to: userEmail,
    subject: `🔔 ${matchTitle} - ShipperTrip`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
          }
          .header { 
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); 
            color: white; 
            padding: 30px; 
            text-align: center; 
            border-radius: 10px 10px 0 0; 
          }
          .content { 
            background: #f9f9f9; 
            padding: 30px; 
            border-radius: 0 0 10px 10px; 
          }
          .match-details { 
            background: white; 
            padding: 20px; 
            border-left: 4px solid #f59e0b; 
            margin: 20px 0; 
            border-radius: 5px; 
          }
          .button { 
            display: inline-block; 
            padding: 15px 30px; 
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); 
            color: white !important; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0; 
            font-weight: bold; 
          }
          .footer { 
            text-align: center; 
            margin-top: 20px; 
            font-size: 12px; 
            color: #666; 
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🔔 Nouvelle correspondance !</h1>
        </div>
        <div class="content">
          <p>Bonjour <strong>${userName}</strong>,</p>
          
          <p>Bonne nouvelle ! Nous avons trouvé ${matchType} qui correspond à votre alerte :</p>
          
          <div class="match-details">
            <h3 style="margin-top: 0; color: #f59e0b;">Détails de la correspondance</h3>
            <p><strong>De :</strong> ${matchDetails.from.city}, ${matchDetails.from.country}</p>
            <p><strong>Vers :</strong> ${matchDetails.to.city}, ${matchDetails.to.country}</p>
            ${matchDetails.date ? `<p><strong>Date :</strong> ${matchDetails.date}</p>` : ''}
            ${matchDetails.weight ? `<p><strong>Poids :</strong> ${matchDetails.weight} kg</p>` : ''}
            ${matchDetails.price ? `<p><strong>Prix :</strong> ${matchDetails.price} €</p>` : ''}
          </div>
          
          <p>Ne laissez pas passer cette opportunité ! Consultez les détails complets et contactez l'utilisateur dès maintenant.</p>
          
          <div style="text-align: center;">
            <a href="${alertsUrl}" class="button">Voir mes alertes</a>
          </div>
          
          <p>Cordialement,<br>L'équipe ShipperTrip</p>
        </div>
        <div class="footer">
          <p>© 2025 ShipperTrip. Tous droits réservés.</p>
          <p>Pour ne plus recevoir ces notifications, désactivez vos alertes dans vos paramètres.</p>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Alert notification email sent to ${userEmail}`);
  } catch (error) {
    console.error(`❌ Error sending alert notification to ${userEmail}:`, error);
    // Don't throw error here - we don't want to fail the alert matching process
  }
};

// Send password reset email (for future use)
export const sendPasswordResetEmail = async (
  email: string,
  name: string,
  token: string
): Promise<void> => {
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;

  const mailOptions = {
    from: '"ShipperTrip" <admin@shippertrip.com>',
    to: email,
    subject: 'Réinitialisation de votre mot de passe - ShipperTrip',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
          }
          .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 30px; 
            text-align: center; 
            border-radius: 10px 10px 0 0; 
          }
          .content { 
            background: #f9f9f9; 
            padding: 30px; 
            border-radius: 0 0 10px 10px; 
          }
          .button { 
            display: inline-block; 
            padding: 15px 30px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white !important; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0; 
            font-weight: bold; 
          }
          .warning { 
            background: #fff3cd; 
            border-left: 4px solid #ffc107; 
            padding: 15px; 
            margin: 20px 0; 
            border-radius: 5px; 
          }
          .footer { 
            text-align: center; 
            margin-top: 20px; 
            font-size: 12px; 
            color: #666; 
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Réinitialisation de mot de passe</h1>
        </div>
        <div class="content">
          <p>Bonjour <strong>${name}</strong>,</p>
          
          <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
          </div>
          
          <p>Ou copiez-collez ce lien dans votre navigateur :</p>
          <p style="word-break: break-all; background: #fff; padding: 10px; border-radius: 5px;">
            ${resetUrl}
          </p>
          
          <div class="warning">
            <strong>⚠️ Important :</strong>
            <ul style="margin: 10px 0;">
              <li>Ce lien est valide pendant 1 heure</li>
              <li>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email</li>
              <li>Votre mot de passe actuel reste valide tant que vous ne le changez pas</li>
            </ul>
          </div>
          
          <p>Cordialement,<br>L'équipe ShipperTrip</p>
        </div>
        <div class="footer">
          <p>© 2025 ShipperTrip. Tous droits réservés.</p>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${email}`);
  } catch (error) {
    console.error(`❌ Error sending password reset email to ${email}:`, error);
    throw new Error('Failed to send password reset email');
  }
};
