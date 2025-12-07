const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/travelship')
  .then(async () => {
    console.log('Connected to MongoDB');
    const result = await mongoose.connection.db.collection('users').deleteOne({ email: 'admin@travelship.com' });
    console.log('Delete result:', result);
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
