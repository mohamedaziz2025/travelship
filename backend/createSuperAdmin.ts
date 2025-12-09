import mongoose from 'mongoose';
import { User } from './src/models/User';
import dotenv from 'dotenv';

dotenv.config();

const createSuperAdmin = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/travelship';
    
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Vérifier si le super admin existe déjà
    const existingSuperAdmin = await User.findOne({ 
      email: 'superadmin@travelship.com',
      adminRole: 'superadmin'
    });

    if (existingSuperAdmin) {
      console.log('⚠️  Le super admin existe déjà!');
      console.log('📧 Email: superadmin@travelship.com');
      
      // Proposer de réinitialiser le mot de passe
      console.log('\n🔄 Réinitialisation du mot de passe...');
      existingSuperAdmin.password = 'SuperAdmin@123';
      await existingSuperAdmin.save();
      console.log('✅ Mot de passe réinitialisé à: SuperAdmin@123');
    } else {
      // Créer le super admin
      console.log('🔄 Création du super admin...');
      await User.create({
        name: 'Super Administrator',
        email: 'superadmin@travelship.com',
        password: 'SuperAdmin@123',
        role: 'admin',
        adminRole: 'superadmin',
        verified: true,
        status: 'active',
        badges: ['superadmin', 'verified'],
        stats: {
          matches: 0,
          rating: 5,
          completed: 0,
          totalReviews: 0,
        },
      });

      console.log('✅ Super admin créé avec succès!');
      console.log('📧 Email: superadmin@travelship.com');
      console.log('🔑 Mot de passe: SuperAdmin@123');
      console.log('👑 Rôle: superadmin');
    }

    console.log('\n⚠️  IMPORTANT: Changez le mot de passe après la première connexion!');
    
    await mongoose.connection.close();
    console.log('\n✅ Terminé!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
};

createSuperAdmin();
