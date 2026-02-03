const express = require('express');
const db = require('./db.js');
require('dotenv').config(); // Load environment variables from .env file in our server.js file
const passport = require('./auth.js');

const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

const UserRoutes = require('./Routes/UserRoutes');
app.use('/user',UserRoutes)

const CandidateRoutes = require('./Routes/CandidateRoutes.js');
app.use('/candidate',CandidateRoutes)

app.listen(PORT , () => {
    console.log(`Server is running on port ${PORT}`);
})