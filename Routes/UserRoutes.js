const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { jwtAuthMiddleware, generateToken } =  require('../jwt');


//new way with async await
router.post('/signup', async (req,res) => {

  try{

    const UserData = req.body; // assuming request body contains user data in JSON format coming from client in POST request
    const newPerson = new User(UserData); // creating new User instance using mongoose model.
    const response = await newPerson.save();

    const payload = {
        id : response.id, // we are only including ID in the payload for generating token, not the aadhar card data
        
    }

    console.log('Payload for JWT:', payload);
    
    const token = generateToken(payload); // generating JWT token for the newly created user
    console.log('Generated JWT Token:', token);
    res.status(200).send({ response : response, token : token}); // sending response along with token to client
    console.log('Person saved successfully:', response);

  }
  catch(error){
    console.log('Error saving person:', error);
    return res.status(500).send('Error saving person to database');
  }

  
})

//login route 
router.post('/login', async(req,res) => {
    try
    {
        
        //extracting username and password from request body
        const {aadharCardNumber,password} = req.body;

        //finding user in database based on username
        const user = await User.findOne({aadharCardNumber : aadharCardNumber});

        //if user does not exist or password does not match, send error response
        if(!user && !user.comparePassword(password))
        {
            return res.status(401).json({message : 'Invalid aadhar card number or password'});
        } 
        
        //if user exists and password matches, generate JWT token
        const payload = {
            id : user.id,
            
        }
        const token = generateToken (payload);

        //send response with token
        res.status(200).json({message : 'Login successful', token : token, user : user});
    }
    catch(error)
    {
       console.log('Error during login:', error);
       res.status(500).json({message : 'Internal server error during login'});
    }
})

//Profile route to get details of logged in user
router.get('/profile', jwtAuthMiddleware, async(req, res) => {
    try
    {
        const userdata = req.user; // getting user data from JWT payload
        console.log('User data from JWT payload:', userdata);

        const userId = userdata.id; // extracting user id from payload
        const user = await User.findById(userId); // fetching user details from database based on id
        
        res.status(200).json(user); // sending user details as response
    }
    catch(error)
    {
        console.log('Error fetching user profile:', error);
        res.status(500).json({message : 'Error fetching user profile || Internal server error'});
    }
})

//to update/change password 
router.put('/profile/password', jwtAuthMiddleware,async (req,res) => {
    try
    {
        const UserID = req.user.id; // extracting user id from JWT payload
        const {currentPassword, newPassword} = req.body; // extracting current and new password from request body

        const user =  await User.findById(UserID); // fetching user details from database based on id

         //check if current password enter by user is valid or not
        if(! await(user.comparePassword(currentPassword)))
        {
            return res.status(401).json({message : 'Invalid current password'});
        } 

        // since current password is valid, update to new password
        user.password = newPassword;
        await user.save(); // saving updated user details to database


        console.log('Pasword updated successfully:', user);
        res.status(200).json({message : 'Password updated successfully', user : user});
    }
    catch(error)
    {
        console.log('Error updating password :', error);
        res.status(500).json({error : 'Error updating password in database || Internal server error'});
    }
})


// to fetch deatils of person with specific work role
// router.get('/:worktype', async(req, res) => {
//   try
//   {
//      const worktype = req.params.worktype; // getting work type from url parameter fow which data is to be fetched.
//      if(worktype == 'chef' || worktype == 'waiter' || worktype == 'manager') // validating work type check to avoid invalid queries
//      {
//        const data = await Person.find({work : worktype});
//        console.log('Persons data retrieved successfully:', data);
//        res.status(200).json(data);     
//      }
//      else
//      {
//         res.status(400).json({error : 'Invalid work type parameter'});
//      }

//   }
//   catch(error)
//   {
//       console.log('Error fetching menu items:', error);
//       res.status(500).json({error : 'Error fetching person from database || Internal server error'});
//   }
// })





module.exports = router;