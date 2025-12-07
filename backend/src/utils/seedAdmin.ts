import { User } from '../models/User';
import bcrypt from 'bcryptjs';

export const seedAdminUser = async () => {
  try {
    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'admin@travelship.com' });

    if (adminExists) {
      console.log('✅ Admin user already exists');
      return;
    }

    // Create admin user (password will be hashed automatically by the User model)
    const adminUser = await User.create({
      name: 'Administrator',
      email: 'admin@travelship.com',
      password: 'admin123',
      role: 'admin',
      verified: true,
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
    console.log('   Password: admin123');
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
};
