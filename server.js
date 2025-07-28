const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const jwksClient = require('jwks-rsa');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = "mongodb+srv://pothiraju010:Pojo$007@cluster0.veaj4fk.mongodb.net/Event_Lens?retryWrites=true&w=majority&appName=Cluster0";
const JWT_SECRET = "1a8e7f9b2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9";

// Connect to MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB connected successfully.'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// User Schema
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});
const User = mongoose.model('User', UserSchema);

// --- API Routes ---

// Signup Route
app.post('/api/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ msg: 'Please enter all fields.' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ msg: 'User with this email already exists.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ msg: 'Signup successful! Please log in.' });
    } catch (error) {
        res.status(500).json({ msg: 'Server error during signup.' });
    }
});

// Login Route
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ msg: 'Please enter all fields.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials.' });
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user: { id: user._id, username: user.username } });

    } catch (error) {
        res.status(500).json({ msg: 'Server error during login.' });
    }
});

const azureClient = jwksClient({
  jwksUri: `https://login.microsoftonline.com/b0ee3479-d5ce-4105-91d7-171e7222c52a/discovery/v2.0/keys`
});

function getKey(header, callback){
  azureClient.getSigningKey(header.kid, function(err, key) {
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

// Azure AD Login/Signup Route
app.post('/api/auth/azure', (req, res) => {
    const { idToken } = req.body;

    const validationOptions = {
        audience: 'e1f98e1b-95e0-4da4-aa88-ae2f42cb2677', // Your Client ID
        issuer: `https://login.microsoftonline.com/b0ee3479-d5ce-4105-91d7-171e7222c52a/v2.0` // Your Tenant ID
    };

    jwt.verify(idToken, getKey, validationOptions, async (err, decoded) => {
        if (err) {
            return res.status(401).json({ msg: 'Invalid Azure token.' });
        }

        try {
            const { name, email } = decoded;

            let user = await User.findOne({ email });

            if (!user) {
                // If user doesn't exist, create them.
                // We store a placeholder password because our schema requires it.
                const placeholderPassword = await bcrypt.hash(require('crypto').randomBytes(20).toString('hex'), 10);
                user = new User({
                    username: name,
                    email: email,
                    password: placeholderPassword
                });
                await user.save();
            }

            // Create a JWT for our application session
            const appToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
            res.json({
                token: appToken,
                user: { id: user._id, username: user.username }
            });

        } catch (serverError) {
            res.status(500).json({ msg: 'Server error during Azure authentication.' });
        }
    });
});

// --- SERVER-SIDE AZURE AUTH ROUTES ---

const AZURE_CLIENT_ID = process.env.AZURE_CLIENT_ID;
const AZURE_CLIENT_SECRET = process.env.AZURE_CLIENT_SECRET;
const AZURE_TENANT_ID = process.env.AZURE_TENANT_ID;
// IMPORTANT: This MUST be registered in Azure Portal
const REDIRECT_URI = 'http://localhost:5000/auth/microsoft/callback';

// Route 1: User clicks the login link, we redirect them to Microsoft
app.get('/auth/microsoft/start', (req, res) => {
    const scope = 'openid profile email';
    const url = `https://login.microsoftonline.com/${AZURE_TENANT_ID}/oauth2/v2.0/authorize?` +
                `client_id=${AZURE_CLIENT_ID}` +
                `&response_type=code` +
                `&redirect_uri=${REDIRECT_URI}` +
                `&response_mode=query` +
                `&scope=${scope}`;
    res.redirect(url);
});

// Route 2: Microsoft redirects the user back here with a code
app.get('/auth/microsoft/callback', async (req, res) => {
    const code = req.query.code;

    try {
        // Exchange the code for an access token and ID token
        const tokenResponse = await axios.post(`https://login.microsoftonline.com/${AZURE_TENANT_ID}/oauth2/v2.0/token`, new URLSearchParams({
            client_id: AZURE_CLIENT_ID,
            scope: 'openid profile email',
            code: code,
            redirect_uri: REDIRECT_URI,
            grant_type: 'authorization_code',
            client_secret: AZURE_CLIENT_SECRET
        }));

        const idToken = tokenResponse.data.id_token;
        
        // Decode the ID token to get user info (no need for jwks-rsa, we trust the direct exchange)
        const decodedToken = jwt.decode(idToken);
        const { name, email } = decodedToken;

        // Find or create the user in your database
        let user = await User.findOne({ email });
        if (!user) {
            const placeholderPassword = await bcrypt.hash(require('crypto').randomBytes(20).toString('hex'), 10);
            user = new User({ username: name, email: email, password: placeholderPassword });
            await user.save();
        }

        // Create your application's own JWT
        const appToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
        const userPayload = JSON.stringify({ id: user._id, username: user.username });

        // ** THE FIX IS HERE **
        // Instead of sending HTML, redirect the user's browser to a frontend page.
        // We pass the token and user data in the URL hash.
        const frontendUrl = new URL('http://localhost:5500/auth-handler.html');
        frontendUrl.hash = `token=${appToken}&user=${encodeURIComponent(userPayload)}`;

        res.redirect(frontendUrl.toString());

    } catch (error) {
        console.error('Error during Microsoft auth callback:', error.response ? error.response.data : error.message);
        res.status(500).send('An error occurred during authentication.');
    }
});


app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));