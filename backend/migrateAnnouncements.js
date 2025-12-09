// Migration script for existing announcements
// Run this script to update existing announcements with new required fields

import mongoose from 'mongoose'
import { Announcement } from './src/models/Announcement'

const migrateAnnouncements = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/travelship')
    
    console.log('🔄 Starting migration...')
    
    // Get all announcements without userType
    const announcements = await Announcement.find({
      $or: [
        { userType: { $exists: false } },
        { weightRange: { $exists: false } }
      ]
    })
    
    console.log(`📊 Found ${announcements.length} announcements to migrate`)
    
    let migrated = 0
    let errors = 0
    
    for (const announcement of announcements) {
      try {
        // Set userType based on type (default to sender for package/shopping)
        if (!announcement.userType) {
          announcement.userType = 'sender'
        }
        
        // Set weightRange based on weight field
        if (!announcement.weightRange && announcement.weight) {
          const weight = announcement.weight
          if (weight <= 1) announcement.weightRange = '0-1'
          else if (weight <= 5) announcement.weightRange = '2-5'
          else if (weight <= 10) announcement.weightRange = '5-10'
          else if (weight <= 15) announcement.weightRange = '10-15'
          else if (weight <= 20) announcement.weightRange = '15-20'
          else if (weight <= 25) announcement.weightRange = '20-25'
          else if (weight <= 30) announcement.weightRange = '25-30'
          else announcement.weightRange = '30+'
        } else if (!announcement.weightRange) {
          // Default to 2-5 kg if no weight specified
          announcement.weightRange = '2-5'
        }
        
        // Set packageType based on type
        if (!announcement.packageType) {
          if (announcement.type === 'package') {
            announcement.packageType = 'personal'
          } else if (announcement.type === 'shopping') {
            announcement.packageType = 'purchase'
          }
        }
        
        // Set default values for optional fields
        if (!announcement.isUrgent) {
          announcement.isUrgent = false
        }
        
        // Save the updated announcement
        await announcement.save()
        migrated++
        
        if (migrated % 10 === 0) {
          console.log(`✅ Migrated ${migrated}/${announcements.length} announcements`)
        }
      } catch (error) {
        console.error(`❌ Error migrating announcement ${announcement._id}:`, error)
        errors++
      }
    }
    
    console.log('\n🎉 Migration completed!')
    console.log(`✅ Successfully migrated: ${migrated}`)
    console.log(`❌ Errors: ${errors}`)
    
    await mongoose.connection.close()
    process.exit(0)
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run migration
migrateAnnouncements()
