const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connecté à MongoDB Atlas');
    app.listen(process.env.PORT, () => {
      console.log(`🚀 Serveur lancé sur le port ${process.env.PORT}`);
    });
  })
  .catch(error => {
    console.error('❌ Erreur de connexion à MongoDB :', error.message);
  });
