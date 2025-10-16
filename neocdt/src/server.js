const mongoose = require('mongoose');
const app = require('./app');
require('dotenv').config();

const PORT = process.env.PORT || 4000;

if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI no definida en .env');
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Mongo conectado');
    app.listen(PORT, () => console.log('🚀 Server en puerto', PORT));
  })
  .catch(err => {
    console.error('❌ Error conectando a Mongo:', err.message);
    process.exit(1);
  });


