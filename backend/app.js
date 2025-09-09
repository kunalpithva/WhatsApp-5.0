const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authrouter = require('./routes/authrouter');

dotenv.config();
const app = express();
//use cores
const cors = require('cors');
app.use(cors({
  // origin: ['http://localhost:5173','http://localhost:1574'], // Only allow requests from this origin
  // methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow specific methods
  // allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
}));

app.use(express.json()); // Middleware to parse JSON request bodies
app.use('/api/auth', authrouter);

// Serve static files from the 'public' directory, but restrict access
const path = require('path');
const jwt = require('jsonwebtoken'); // Assuming jwt is used for authentication
const getDynamicCollection = require('./models/user'); // Assuming this is how you get user collection

app.use('/public', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Authentication token missing.' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const usersCollection = getDynamicCollection("users");
    const user = await usersCollection.findOne({ _id: new mongoose.Types.ObjectId(userId) });

    if (!user || user.role !== 'admin') { // Assuming 'admin' is the role for authorized access
      return res.status(403).json({ error: 'Access denied. Only administrators can access files directly.' });
    }
    next(); // If authenticated as admin, proceed to serve the file
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}, express.static(path.join(__dirname, 'public')));


mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
  const port=3000
  app.listen(port, () => console.log(`Server running on http://localhost:${port}/`));
}).catch((err) => console.log(err));
