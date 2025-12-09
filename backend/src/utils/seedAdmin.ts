import { User } from '../models/User';
import bcrypt from 'bcryptjs';

export const seedAdminUser = async () => {
  try {
    // Check if super admin already exists
    const superAdminExists = await User.findOne({ 
      email: 'superadmin@travelship.com',
      adminRole: 'superadmin' 
    });

    if (!superAdminExists) {
      // Create super admin user (password will be hashed automatically by the User model)
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

      console.log('✅ Super Admin user created successfully');
      console.log('   Email: superadmin@travelship.com');
      console.log('   Password: SuperAdmin@123');
      console.log('   Role: superadmin');
    } else {
      console.log('✅ Super Admin user already exists');
    }

    // Check if regular admin already exists
    const adminExists = await User.findOne({ email: 'admin@travelship.com' });

    if (!adminExists) {
      // Create regular admin user
      await User.create({
        name: 'Administrator',
        email: 'admin@travelship.com',
        password: 'Admin@123',
        role: 'admin',
        adminRole: 'moderator',
        verified: true,
        status: 'active',
        badges: ['admin', 'verified'],
        stats: {
          matches: 0,
          rating: 5,
          completed: 0,
          totalReviews: 0,
        },
      });

      console.log('✅ Admin user created successfully');
      console.log('   Email: admin@travelship.com');
      console.log('   Password: Admin@123');
      console.log('   Role: moderator');
    } else {
      console.log('✅ Admin user already exists');
    }

  } catch (error) {
    console.error('❌ Error creating admin users:', error);
  }
};
