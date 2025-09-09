const express = require('express');
const getDynamicCollection=require('../models/user');
const jwt=require('jsonwebtoken');
const bcrypt=require('bcryptjs');
const { ObjectId } = require('mongodb'); // Import ObjectId
const { check, validationResult } = require('express-validator'); // Import express-validator
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Import fs for creating directories
const { v4: uuidv4 } = require('uuid'); // Import uuid for unique filenames

const router = express.Router();

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, _file, cb) => { // Renamed 'file' to '_file' to indicate it's unused
    // Extract user ID from the token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return cb(new Error('Authentication token missing.'), null);
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;
      req.userId = userId; // Attach userId to the request object
      const uploadPath = path.join(__dirname, '../public', userId.toString());

      // Create directory if it doesn't exist
      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (err) {
      cb(new Error('Invalid token or user ID missing.'), null);
    }
  },
  filename: (_req, file, cb) => { // Renamed 'req' to '_req' to indicate it's unused
    const uniqueSuffix = uuidv4();
    const fileExtension = path.extname(file.originalname);
    cb(null, uniqueSuffix + fileExtension);
  }
});

// Multer upload middleware
const upload = multer({
  storage: storage,
  // Removed fileFilter to allow all file types, as per user's request for general uploads.
  // File type validation will be handled by the frontend and backend logic for specific fields (csv, excel).
  limits: { fileSize: 1024 * 1024 * 25 } // 25MB file size limit (increased from 5MB for general files)
}).array('files', 10); // 'files' is the name of the form field for the uploaded files, max 10 files

const generateToken = (id, mobile_number, role) => {
    const token = jwt.sign({ id, mobile_number, role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    return token;
  };

router.post('/:api', async (req, res) => {
    const { api } = req.params;

    

    if (api == 'creatadmineaccount') {
        // Apply validation checks
        await Promise.all([
            check('username').notEmpty().trim().matches(/^[a-zA-Z]+$/).withMessage('Username is required').run(req),
            check('email').isEmail().withMessage('Invalid email address').run(req),
            check('mobile_number').isMobilePhone('any').isLength({ min: 10, max: 10 }).withMessage('Mobile number must be exactly 10 digits').run(req),
            check('role').notEmpty().withMessage('Role is required').run(req),
            check('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/).withMessage('Password must be at least 8 characters long').run(req),
            check('confirmPassword').custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error('Password confirmation does not match password');
                }
                return true;
            }).run(req)
        ]);

        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { username, email, mobile_number , role, password } = req.body; // Add confirmPassword to destructuring
            const hashpassword = await bcrypt.hash(password, 15);

            let referanceid = null;
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                const token = authHeader.split(' ')[1];
                try {
                    const decoded = jwt.verify(token, process.env.JWT_SECRET);
                    // Check if 'id' exists in the decoded token, otherwise use mobile_number to find the user's _id
                    if (decoded.id) {
                        referanceid = decoded.id;
                    } else if (decoded.mobile_number) {
                        const usersCollection = getDynamicCollection("admin");
                        const loggedInUser = await usersCollection.findOne({ mobile_number: decoded.mobile_number });
                        if (loggedInUser) {
                            referanceid = loggedInUser._id;
                        } else {
                            console.log("Logged-in user not found in 'users' collection with mobile number:", decoded.mobile_number);
                        }
                    }
                } catch (err) {
                    console.log("Invalid token for referanceid extraction:", err.message);
                }
            }

            const collection = getDynamicCollection("admin"); // Get the dynamic collection
            const collection_credentials = getDynamicCollection("admincredentials"); // Get the dynamic collection
            const newUser = {
                username,
                email,
                mobile_number, // Keep mobile_number in the main user object
                role,
                creationdate: new Date(),
                lastchangedate: new Date(),
                credits: 0,
                referanceid: referanceid ? new ObjectId(referanceid) : null, // Store the logged-in user's ID as ObjectId
                profileid: null    // Or handle as needed
            };
            const usercredentials = {
                mobile_number,
                password: hashpassword
            };
            const result = await collection.insertOne(newUser); // Insert the new user
            await collection_credentials.insertOne(usercredentials); // Insert the new user credentials
            const token = generateToken(result.insertedId, mobile_number, role); // Generate token with the inserted ID, mobile number, and role
            res.status(201).json({ token });
        }
        catch (err) {
            console.log("error in signup");
            res.status(400).json({ error: err.message });
        }
    }
    
    if (api == 'createaccount') {
        // Apply validation checks
        await Promise.all([
            check('username').notEmpty().trim().matches(/^[a-zA-Z]+$/).withMessage('Username is required').run(req),
            check('email').isEmail().withMessage('Invalid email address').run(req),
            check('mobile_number').isMobilePhone('any').isLength({ min: 10, max: 10 }).withMessage('Mobile number must be exactly 10 digits').run(req),
            check('role').notEmpty().withMessage('Role is required').run(req),
            check('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/).withMessage('Password must be at least 8 characters long').run(req),
            check('confirmPassword').custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error('Password confirmation does not match password');
                }
                return true;
            }).run(req)
        ]);

        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { username, email, mobile_number , role, password } = req.body; // Add confirmPassword to destructuring
            const hashpassword = await bcrypt.hash(password, 15);

            let referanceid = null;
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                const token = authHeader.split(' ')[1];
                try {
                    const decoded = jwt.verify(token, process.env.JWT_SECRET);
                    // Check if 'id' exists in the decoded token, otherwise use mobile_number to find the user's _id
                    if (decoded.id) {
                        referanceid = decoded.id;
                    } else if (decoded.mobile_number) {
                        const usersCollection = getDynamicCollection("users");
                        const loggedInUser = await usersCollection.findOne({ mobile_number: decoded.mobile_number });
                        if (loggedInUser) {
                            referanceid = loggedInUser._id;
                        } else {
                            console.log("Logged-in user not found in 'users' collection with mobile number:", decoded.mobile_number);
                        }
                    }
                } catch (err) {
                    console.log("Invalid token for referanceid extraction:", err.message);
                }
            }

            const collection = getDynamicCollection("users"); // Get the dynamic collection
            const collection_credentials = getDynamicCollection("usercredentials"); // Get the dynamic collection
            const newUser = {
                username,
                email,
                mobile_number, // Keep mobile_number in the main user object
                role,
                creationdate: new Date(),
                lastchangedate: new Date(),
                credits: 0,
                referanceid: referanceid ? new ObjectId(referanceid) : null, // Store the logged-in user's ID as ObjectId
                profileid: null    // Or handle as needed
            };
            const usercredentials = {
                mobile_number,
                password: hashpassword
            };
            const result = await collection.insertOne(newUser); // Insert the new user
            await collection_credentials.insertOne(usercredentials); // Insert the new user credentials
            const token = generateToken(result.insertedId, mobile_number, role); // Generate token with the inserted ID, mobile number, and role
            res.status(201).json({ token });
        }
        catch (err) {
            console.log("error in signup");
            res.status(400).json({ error: err.message });
        }
    }
    if (api == 'login') {
        try {
            const { mobile_number, password } = req.body;
            const collection = getDynamicCollection("usercredentials"); // Get the dynamic collection
            const user = await collection.findOne({ mobile_number });
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Fetch the user from the 'users' collection to get their actual _id
            const usersCollection = getDynamicCollection("users");
            const mainUser = await usersCollection.findOne({ mobile_number });

            if (!mainUser) {
                return res.status(404).json({ error: 'Main user record not found' });
            }

            const token = generateToken(mainUser._id, mainUser.mobile_number, mainUser.role); // Generate token with the main user's _id, mobile number, and role
            res.status(200).json({ token });
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
    if (api == 'admin-login') {
        try {
            const { mobile_number, password } = req.body;
            const collection = getDynamicCollection("admincredentials"); // Get the dynamic collection
            const user = await collection.findOne({ mobile_number });
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Fetch the user from the 'users' collection to get their actual _id
            const usersCollection = getDynamicCollection("users");
            const mainUser = await usersCollection.findOne({ mobile_number });

            if (!mainUser) {
                return res.status(404).json({ error: 'Main user record not found' });
            }

            const token = generateToken(mainUser._id, mainUser.mobile_number, mainUser.role); // Generate token with the main user's _id, mobile number, and role
            res.status(200).json({ token });
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
    if (api == 'createcampaign_withbutton') {
      upload(req, res, async (err) => {
        if (err) {
          return res.status(400).json({ error: err.message });
        }
        const { campaignname, mobienumbers, message, button_title, button_url, button_number } = req.body;
        const collection = getDynamicCollection("campaigns");

        const fileUrls = req.files ? req.files.map(file => {
          const userId = req.userId; // userId is attached to req in multer destination
          const fileName = path.basename(file.path);
          return `${process.env.VITE_API_URL}/public/${userId}/${fileName}`;
        }) : [];
        const fileNames = req.files ? req.files.map(file => file.originalname) : [];

        let userId = null;
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                userId = decoded.id;
            } catch (err) {
                console.log("Invalid token for userId extraction in createcampaign/withbutton:", err.message);
            }
        }

        const newCampaign = {
          campaignname,
          userid: userId ? new ObjectId(userId) : null,
          mobienumbers, 
          message,
          startdate: new Date(),
          enddate: null,
          button_title,
          button_url,
          button_number,
          status: "pending",
          fileUrls: fileUrls, // Store URLs instead of local paths
          fileNames: fileNames,
          campaign_type: "with_button",
          deductedCredits: 0 // Initialize deducted credits
        };
        await collection.insertOne(newCampaign);
        res.status(201).json({ message: 'Campaign with button created successfully', fileUrls: fileUrls });
      });
    }
    if (api == 'createcampaign_withoutbutton') {
      upload(req, res, async (err) => {
        if (err) {
          return res.status(400).json({ error: err.message });
        }
        const { campaignname, mobienumbers, message } = req.body;
        const collection = getDynamicCollection("campaigns");

        const fileUrls = req.files ? req.files.map(file => {
          const userId = req.userId; // userId is attached to req in multer destination
          const fileName = path.basename(file.path);
          return `${process.env.VITE_API_URL}/public/${userId}/${fileName}`;
        }) : [];
        const fileNames = req.files ? req.files.map(file => file.originalname) : [];

        let userId = null;
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                userId = decoded.id;
            } catch (err) {
                console.log("Invalid token for userId extraction in createcampaign/withoutbutton:", err.message);
            }
        }

        const newCampaign = {
          campaignname,
          userid: userId ? new ObjectId(userId) : null,
          mobienumbers, 
          message,
          startdate: new Date(),
          enddate: null,
          fileUrls: fileUrls, // Store URLs instead of local paths
          fileNames: fileNames,
          status: "pending",
          campaign_type: "without_button",
          deductedCredits: 0 // Initialize deducted credits
        };
        await collection.insertOne(newCampaign);
        res.status(201).json({ message: 'Campaign without button created successfully', fileUrls: fileUrls });
      });
    }
    if (api == 'suspiciousactivity') {
      try {
        const { campaignname, mobile_number, typed_numbers, pasted_numbers } = req.body;
        const collection = getDynamicCollection("suspicious_activities");

        let userId = null;
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                userId = decoded.id;
            } catch (err) {
                console.log("Invalid token for userId extraction in suspiciousactivity:", err.message);
            }
        }

        const newSuspiciousActivity = {
          campaignname,
          userid: userId ? new ObjectId(userId) : null,
          mobile_number,
          typed_numbers,
          pasted_numbers,
          timestamp: new Date(),
        };
        await collection.insertOne(newSuspiciousActivity);
        res.status(201).json({ message: 'Suspicious activity logged successfully' });
      } catch (err) {
        console.error("Error logging suspicious activity:", err);
        res.status(400).json({ error: err.message });
      }
    }
});

router.get('/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const collection = getDynamicCollection("users");
    const user = await collection.findOne({ _id: new ObjectId(id) });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ reseller: user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/:api', async (req, res) => {
  const { api } = req.params;

 

  if (api == 'profile') {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      // Decode the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const mobile_number = decoded.mobile_number;

      if (!mobile_number) {
        return res.status(400).json({ error: 'No mobile_number in token' });
      }

      // Fetch user by mobile_number
      const collection = getDynamicCollection("users");
      const user = await collection.findOne({ mobile_number: mobile_number });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json({ user });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  if(api=='manageusers'){
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const mobile_number = decoded.mobile_number;

      if (!mobile_number) {
        return res.status(400).json({ error: 'No mobile_number in token' });
      }

      const usersCollection = getDynamicCollection("users");
      const loggedInUser = await usersCollection.findOne({ mobile_number: mobile_number });

      if (!loggedInUser) {
        return res.status(404).json({ error: 'Logged-in user not found' });
      }

      const referenceId = loggedInUser._id;
      // Ensure referenceId is an ObjectId for the query
      const managedUsers = await usersCollection.find({ referanceid: new ObjectId(referenceId) }).toArray();

      return res.status(200).json({ users: managedUsers });

    } catch (err) {
      console.error("Error in manageusers:", err);
      return res.status(400).json({ error: err.message });
    }
  }
  if(api=='campaigns'){
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;

      if (!userId) {
        return res.status(400).json({ error: 'No user ID in token' });
      }

      const campaignsCollection = getDynamicCollection("campaigns");
      const userCampaigns = await campaignsCollection.find({ userid: new ObjectId(userId) }).toArray();

      return res.status(200).json({ campaigns: userCampaigns });

    } catch (err) {
      console.error("Error in mycampaigns:", err);
      return res.status(400).json({ error: err.message });
    }
  }
  if(api=='a_campaigns'){
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;

      if (!userId) {
        return res.status(400).json({ error: 'No user ID in token' });
      }

      const campaignsCollection = getDynamicCollection("campaigns");
      const userCampaigns = await campaignsCollection.find().toArray();

      return res.status(200).json({ campaigns: userCampaigns });

    } catch (err) {
      console.error("Error in mycampaigns:", err);
      return res.status(400).json({ error: err.message });
    }
  }

  if(api=='allusers'){
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id; // This is the ID of the logged-in user

      if (!userId) {
        return res.status(400).json({ error: 'No user ID in token' });
      }

      const usersCollection = getDynamicCollection("users");
      const loggedInUser = await usersCollection.findOne({ _id: new ObjectId(userId) });

      if (!loggedInUser) {
        return res.status(404).json({ error: 'Logged-in user not found' });
      }

      let query = {};
      if (loggedInUser.role === 'reseller') {
        query = { referanceid: new ObjectId(userId) };
      } else if (loggedInUser.role === 'admin') {
        query = {};
      } else {
        return res.status(403).json({ error: 'Access denied for this role.' });
      }

      const allUsers = await usersCollection.aggregate([
          { $match: query },
          {
              $lookup: {
                  from: "users",
                  localField: "referanceid",
                  foreignField: "_id",
                  as: "resellerInfo"
              }
          },
          {
              $unwind: {
                  path: "$resellerInfo",
                  preserveNullAndEmptyArrays: true
              }
          },
          {
              $addFields: {
                  resellerName: { $ifNull: ["$resellerInfo.username", null] }
              }
          },
          {
              $project: {
                  resellerInfo: 0 // Exclude the temporary resellerInfo field
              }
          }
      ]).toArray();
      return res.status(200).json({ users: allUsers });

    } catch (err) {
      console.error("Error in allusers:", err);
      return res.status(400).json({ error: err.message });
    }
  }
  if (api == 'suspiciousactivity') {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;

      const usersCollection = getDynamicCollection("users");
      const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Only administrators can view suspicious activities.' });
      }

      const suspiciousActivitiesCollection = getDynamicCollection("suspicious_activities");
      const activities = await suspiciousActivitiesCollection.find({}).toArray();

      return res.status(200).json({ activities });

    } catch (err) {
      console.error("Error in fetching suspicious activities:", err);
      return res.status(400).json({ error: err.message });
    }
  }

  if (api == 'credits') {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const mobile_number = decoded.mobile_number;

      if (!mobile_number) {
        return res.status(400).json({ error: 'No mobile_number in token' });
      }

      const collection = getDynamicCollection("users");
      const user = await collection.findOne({ mobile_number: mobile_number }, { projection: { credits: 1, _id: 0 } });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json({ credits: user.credits });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  if(api=='resellercreditsummary'){
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;

      if (!userId) {
        return res.status(400).json({ error: 'No user ID in token' });
      }

      const usersCollection = getDynamicCollection("users");
      const loggedInUser = await usersCollection.findOne({ _id: new ObjectId(userId) });

      if (!loggedInUser || loggedInUser.role !== 'reseller') {
        return res.status(403).json({ error: 'Access denied. Only resellers can view this summary.' });
      }

      const referredUsers = await usersCollection.find({ referanceid: new ObjectId(userId) }).toArray();
      const totalCredits = referredUsers.reduce((sum, user) => sum + user.credits, 0);

      return res.status(200).json({ totalCredits, referredUsersCount: referredUsers.length });

    } catch (err) {
      console.error("Error in resellercreditsummary:", err);
      return res.status(400).json({ error: err.message });
    }
  }

  if (api === 'dashboard-stats') {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;

      if (!userId) {
        return res.status(400).json({ error: 'No user ID in token' });
      }

      const campaignsCollection = getDynamicCollection("campaigns");
      const usersCollection = getDynamicCollection("users");

      // Fetch campaign counts
      const totalCampaigns = await campaignsCollection.countDocuments();
      const runningCampaigns = await campaignsCollection.countDocuments({  status: 'running' });
      const pendingCampaigns = await campaignsCollection.countDocuments({ status: 'pending' });


      let accountCount = 0;
          accountCount = await usersCollection.countDocuments({});
      let resellerCount = 0;
          resellerCount = await usersCollection.countDocuments({ role: 'reseller' });
      let userCount = 0;
          userCount = await usersCollection.countDocuments({ role: 'user' });    
          
      return res.status(200).json({
        runningCampaign: runningCampaigns,
        pendingCampaign: pendingCampaigns,
        totalCampaigns: totalCampaigns,
        userCount :  userCount, 
        resellerCount : resellerCount,
        accountCount: accountCount,
      });

    } catch (err) {
      console.error("Error in dashboard-stats:", err);
      return res.status(400).json({ error: err.message });
    }
  }

  // Always return something for non-matching routes
  return res.status(404).json({ error: 'Invalid endpoint' });
});

router.put('/:api', async (req, res) => {
  const { api } = req.params; 
  //allow to change password and changes are stored to respective data base 
  if(api=='profile'){
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const mobile_number = decoded.mobile_number;

      if (!mobile_number) {
        return res.status(400).json({ error: 'No mobile_number in token' });
      }

      const { oldPassword, newPassword } = req.body;

      if (oldPassword && newPassword) {
        const userCredentialsCollection = getDynamicCollection("usercredentials");
        const user = await userCredentialsCollection.findOne({ mobile_number });

        if (!user) {
          return res.status(404).json({ error: 'User credentials not found' });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
          return res.status(401).json({ error: 'Invalid old password' });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 15);
        await userCredentialsCollection.updateOne(
          { mobile_number },
          { $set: { password: hashedNewPassword, lastchangedate: new Date() } }
        );
        return res.status(200).json({ message: 'Password updated successfully' });
      } else {
        // Handle other profile updates here if needed in the future
        return res.status(400).json({ error: 'No password change data provided' });
      }
    } catch (err) {
      console.error("Error in profile update:", err);
      return res.status(400).json({ error: err.message });
    }
  }

  if (api == 'manageusers') {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      // Verify the token to ensure the user is logged in
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const resellerId = decoded.id;

      const usersCollection = getDynamicCollection("users");
      const resellerUser = await usersCollection.findOne({ _id: new ObjectId(resellerId) });

      if (!resellerUser) {
        return res.status(404).json({ error: 'Reseller user not found' });
      }

      // Restrict access to only 'reseller' and 'admin' roles
      if (resellerUser.role !== 'reseller' && resellerUser.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Only resellers and administrators can manage credits.' });
      }

      const { userId, creditChange } = req.body;
      const amount = parseInt(creditChange, 10);

      if (!userId || isNaN(amount) || amount === 0) {
        return res.status(400).json({ error: 'User ID and a valid non-zero credit change value are required' });
      }

      const targetUser = await usersCollection.findOne({ _id: new ObjectId(userId) });

      if (!targetUser) {
        return res.status(404).json({ error: 'Target user not found' });
      }

      // Specific authorization check based on role
      if (resellerUser.role === 'reseller') {
        // Resellers can only manage credits for users they referred
        if (!targetUser.referanceid || !targetUser.referanceid.equals(new ObjectId(resellerId))) {
          return res.status(403).json({ error: 'Access denied. Resellers can only manage credits for users they referred.' });
        }
      }
      // Admins can manage credits for any user, so no further check needed for admin role here.

      let newResellerCredits = resellerUser.credits;
      let newTargetUserCredits = targetUser.credits;

      if (amount > 0) { // Reseller is giving credits to the target user
        if (resellerUser.credits < amount) {
          return res.status(400).json({ error: 'Insufficient credits in your account to transfer.' });
        }
        newResellerCredits -= amount;
        newTargetUserCredits += amount;
      } else { // Reseller is cutting credits from the target user
        const absoluteAmount = Math.abs(amount);
        if (targetUser.credits < absoluteAmount) {
          return res.status(400).json({ error: 'Target user does not have enough credits to deduct.' });
        }
        newResellerCredits += absoluteAmount;
        newTargetUserCredits -= absoluteAmount;
      }

      // Update reseller's credits
      await usersCollection.updateOne(
        { _id: new ObjectId(resellerId) },
        { $set: { credits: newResellerCredits, lastchangedate: new Date() } }
      );

      // Update target user's credits
      await usersCollection.updateOne(
        { _id: new ObjectId(userId) },
        { $set: { credits: newTargetUserCredits, lastchangedate: new Date() } }
      );

      res.status(200).json({
        message: 'User credits updated successfully',
        newCredits: newTargetUserCredits, // Credits of the target user
        resellerNewCredits: newResellerCredits // Credits of the reseller
      });

    } catch (err) {
      console.error("Error in manageusercredits:", err);
      return res.status(400).json({ error: err.message });
    }
  }
});

router.put('/campaigns/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    if (!userId) {
      return res.status(400).json({ error: 'No user ID in token' });
    }

    const campaignId = req.params.id;
    const { status } = req.body;

    if (!campaignId || !status) {
      return res.status(400).json({ error: 'Campaign ID and status are required' });
    }

    const campaignsCollection = getDynamicCollection("campaigns");
    const campaign = await campaignsCollection.findOne({ _id: new ObjectId(campaignId) });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Ensure the user trying to update the campaign is the owner or an admin
    if (!campaign.userid.equals(new ObjectId(userId))) {
      const usersCollection = getDynamicCollection("users");
      const requestingUser = await usersCollection.findOne({ _id: new ObjectId(userId) });
      if (!requestingUser || requestingUser.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. You can only update your own campaigns.' });
      }
    }

    const updateResult = await campaignsCollection.updateOne(
      { _id: new ObjectId(campaignId) },
      { $set: { status: status, lastchangedate: new Date() } }
    );

    if (updateResult.modifiedCount === 0) {
      return res.status(400).json({ error: 'Campaign status not updated. It might already be set to the new status.' });
    }

    res.status(200).json({ message: `Campaign status updated to ${status} successfully` });

  } catch (err) {
    console.error("Error in updating campaign status:", err);
    return res.status(400).json({ error: err.message });
  }
});

router.put('/deduct-credits-from-campaign-user/:campaignId', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const requesterId = decoded.id;

    const usersCollection = getDynamicCollection("users");
    const requesterUser = await usersCollection.findOne({ _id: new ObjectId(requesterId) });

    if (!requesterUser || (requesterUser.role !== 'admin' && requesterUser.role !== 'reseller')) {
      return res.status(403).json({ error: 'Access denied. Only administrators and resellers can deduct credits.' });
    }

    const campaignId = req.params.campaignId;
    const { amount } = req.body;
    const deductionAmount = parseInt(amount, 10);

    if (!campaignId || isNaN(deductionAmount) || deductionAmount <= 0) {
      return res.status(400).json({ error: 'Campaign ID and a valid positive amount are required.' });
    }

    const campaignsCollection = getDynamicCollection("campaigns");
    const campaign = await campaignsCollection.findOne({ _id: new ObjectId(campaignId) });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found.' });
    }

    const targetUserId = campaign.userid;
    if (!targetUserId) {
      return res.status(404).json({ error: 'User associated with campaign not found.' });
    }

    const targetUser = await usersCollection.findOne({ _id: new ObjectId(targetUserId) });

    if (!targetUser) {
      return res.status(404).json({ error: 'Target user not found.' });
    }

    // Resellers can only deduct credits from users they referred
    

    if (targetUser.credits < deductionAmount) {
      return res.status(400).json({ error: `Insufficient credits. User has ${targetUser.credits} but ${deductionAmount} was requested.` });
    }

    const newCredits = targetUser.credits - deductionAmount;

    await usersCollection.updateOne(
      { _id: new ObjectId(targetUserId) },
      { $set: { credits: newCredits, lastchangedate: new Date() } }
    );

    // Update the deductedCredits in the campaign
    await campaignsCollection.updateOne(
      { _id: new ObjectId(campaignId) },
      { $inc: { deductedCredits: deductionAmount } } // Increment deductedCredits
    );

    res.status(200).json({ message: `Successfully deducted ${deductionAmount} credits from user ${targetUser.username}. New balance: ${newCredits}` });

  } catch (err) {
    console.error("Error in deduct-credits-from-campaign-user:", err);
    return res.status(400).json({ error: err.message });
  }
});

router.delete('/deleteuser/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const requesterId = decoded.id;

    const usersCollection = getDynamicCollection("users");
    const requesterUser = await usersCollection.findOne({ _id: new ObjectId(requesterId) });

    if (!requesterUser) {
      return res.status(404).json({ error: 'Requester user not found' });
    }

    // Only admin and reseller roles can delete users
    if (requesterUser.role !== 'admin' && requesterUser.role !== 'reseller') {
      return res.status(403).json({ error: 'Access denied. Only administrators and resellers can delete users.' });
    }

    const userIdToDelete = req.params.id;
    if (!userIdToDelete) {
      return res.status(400).json({ error: 'User ID to delete is required' });
    }

    const targetUser = await usersCollection.findOne({ _id: new ObjectId(userIdToDelete) });

    if (!targetUser) {
      return res.status(404).json({ error: 'Target user not found' });
    }

    // Resellers can only delete users they referred
    if (requesterUser.role === 'reseller') {
      if (!targetUser.referanceid || !targetUser.referanceid.equals(new ObjectId(requesterId))) {
        return res.status(403).json({ error: 'Access denied. Resellers can only delete users they referred.' });
      }
    }

    // Delete user from 'users' collection
    const deleteResult = await usersCollection.deleteOne({ _id: new ObjectId(userIdToDelete) });

    if (deleteResult.deletedCount === 0) {
      return res.status(404).json({ error: 'User not found or already deleted' });
    }

    // Optionally, delete user credentials as well
    const userCredentialsCollection = getDynamicCollection("usercredentials");
    await userCredentialsCollection.deleteOne({ mobile_number: targetUser.mobile_number });

    res.status(200).json({ message: 'User deleted successfully' });

  } catch (err) {
    console.error("Error in deleteuser:", err);
    return res.status(400).json({ error: err.message });
  }
});

module.exports = router;
