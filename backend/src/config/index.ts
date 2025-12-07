export const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/travelship',
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_change_in_production',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'your_refresh_secret_change_in_production',
  jwtExpire: process.env.JWT_EXPIRE || '15m',
  jwtRefreshExpire: process.env.JWT_REFRESH_EXPIRE || '7d',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  redisHost: process.env.REDIS_HOST || 'localhost',
  redisPort: parseInt(process.env.REDIS_PORT || '6379'),
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
}
