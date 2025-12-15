import nodemailer from 'nodemailer';

// Email configuration
export const emailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.shippertrip.com',
  port: parseInt(process.env.EMAIL_PORT || '465'),
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || 'admin@shippertrip.com',
    pass: process.env.EMAIL_PASS || 'TESTTEST1212'
  }
};

// Create reusable transporter
export const transporter = nodemailer.createTransport(emailConfig);

// Verify connection configuration
export const verifyEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log('✅ Email service is ready to send messages');
    return true;
  } catch (error) {
    console.error('❌ Email service error:', error);
    return false;
  }
};
