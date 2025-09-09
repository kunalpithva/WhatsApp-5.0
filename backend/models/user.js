const mongoose = require('mongoose');

const getDynamicCollection = (collectionName) => {
  // Ensure mongoose is connected before trying to access the database
  if (mongoose.connection.readyState !== 1) {
    throw new Error('Mongoose is not connected to the database.');
  }
  return mongoose.connection.db.collection(collectionName);
};

module.exports = getDynamicCollection;
