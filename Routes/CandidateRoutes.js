const express = require('express');
const router = express.Router();
const Candidate = require('../models/Candidate');
const { jwtAuthMiddleware, generateToken } =  require('../jwt');
const User = require('../models/User');
const mongoose = require("mongoose");


// Function to check if user is admin
const checkAdminRole = async (userID) => {
  try 
  {
    const user = await User.findById(userID);
    console.log(user);

    if (!user) return false;

    return user.role === "admin";
  } 
  catch (err)
 {
    console.log("Role check error:", err.message);
    return false;
  }
};


//Post route to create/add new candidate
router.post('/', jwtAuthMiddleware, async(req, res) => {
    try
    {

        console.log("Decoded Token Payload:", req.user);
        console.log("UserID from Token:", req.user.userdata.id);

        if(!await checkAdminRole(req.user.userdata.id))
        {
            const output = await checkAdminRole(req.user.userdata.id);
            console.log(output);
            return res.status(403).json({message : 'Access denied. User is not an admin'});
        }



        const CandidateData = req.body; // getting candidate data from request body
        console.log('Candidate data:', CandidateData); 

        const newCandidateData = new Candidate(CandidateData); // creating new Candidate instance using mongoose model.

        const response = await newCandidateData.save(); // saving candidate data to database


        console.log('Candidate saved successfully:', response);
        
        res.status(200).send(response); // sending candidate details as response
    }
    catch(error)
    {
        console.log('Error saving candidate:', error);
        res.status(500).json({message : 'Error saving candidate || Internal server error'});
    }
})

//to update/change password 
router.put('/:candidateID', jwtAuthMiddleware,async (req,res) => {
    try
    {
        if(!await checkAdminRole(req.user.id))
        {
            return res.status(403).json({message : 'Access denied. User is not an admin'});
        }

        const CandidateID = req.params.candidateID; // getting candidate ID from request params
        const updatedCandidateData = req.body; // getting updated candidate data from request body

        

        const response = await Candidate.findByIdAndUpdate(CandidateID, updatedCandidateData,{
            new : true, // to return the updated document after update is applied 
            runValidators : true, // to run schema validators before applying update
        })

        if(!response) 
        { 
            res.status(404).json({error : 'Candidate ID not found'});
        }

        console.log('Candidate data updated successfully:', response);
        res.status(200).json(response);
    }
    catch(error)
    {
        console.log('Error updating candidate data :', error);
        res.status(500).json({error : 'Error updating candidate data in database || Internal server error'});
    }
})

//to delete a candidate
router.delete('/:candidateID', jwtAuthMiddleware,async (req,res) => {
    try
    {
        if(!await checkAdminRole(req.user.id))
        {
            return res.status(403).json({message : 'Access denied. User is not an admin'});
        }

        const CandidateID = req.params.candidateID; // getting candidate ID from request params
        
        

        const response = await Candidate.findByIdAndDelete(CandidateID); // deleting candidate from database

        if(!response) 
        { 
            res.status(404).json({error : 'Candidate ID not found'});
        }

        console.log('Candidate data deleted successfully:', response);
        res.status(200).json(response);
    }
    catch(error)
    {
        console.log('Error deleting candidate data :', error);
        res.status(500).json({error : 'Error deleting candidate data in database || Internal server error'});
    }
})


//Lets start voting now !!!!!!!

// route for voting by a user for a candidate
router.post("/vote/:candidateID", jwtAuthMiddleware, async (req, res) => {
  try {
    // ✅ Clean Candidate ID
    const candidateID = req.params.candidateID.trim(); // by trimming we remove any leading or trailing spaces

    // ✅ Correct User ID from JWT
    const userID = req.user.userdata.id;

    // ✅ Validate Candidate ID
    if (!mongoose.Types.ObjectId.isValid(candidateID)) {
      return res.status(400).json({ message: "Invalid Candidate ID format" });
    }

    // ✅ Candidate exists?
    const candidate = await Candidate.findById(candidateID);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    // ✅ User exists?
    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Admin cannot vote
    if (user.role === "admin") {
      return res.status(403).json({ message: "Admins are not allowed to vote" });
    }

    // ✅ User can vote only once
    if (user.isVoted) {
      return res.status(400).json({ message: "User has already voted" });
    }

    // ✅ Proceed Vote

    candidate.votes.push({ users: userID });
    candidate.votesCount++;
    await candidate.save();

    user.isVoted = true;
    await user.save();

    res.status(200).json({ message: "Vote cast successfully" });

  } catch (error) {
    console.log("Error while voting:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});



// Route to show the live vote count
router.get('/vote/count', async (req,res) => {
    try
    {
        //Let fetch all candidates data with their votes count
        const candidate = await Candidate.find().sort({votesCount : 'desc'}); // sorting in descending order of votes count
        console.log('Candidates with vote counts:', candidate);

        // Mapping the candidate data for showing only party name and vote count
        const voteRecord = candidate.map((data) => {
            return {
                party : data.party,
                votesCount : data.votesCount
            }
        });

        res.status(200).json(voteRecord);
        
    } 
    catch(error)
    {
        console.log('Error fetching vote count:', error);
        res.status(500).json({error : 'Error fetching vote count || Internal server error'});
    }
})

// Get List of all candidates with only name and party fields
router.get('/', async (req, res) => {
    try {
        // Find all candidates and select only the name and party fields, excluding _id
        const candidates = await Candidate.find({}, 'name party -_id');

        // Return the list of candidates
        res.status(200).json(candidates);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



module.exports = router;