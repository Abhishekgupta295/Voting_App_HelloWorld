const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');

const CandidateSchema = new mongoose.Schema({
  name: {
    type : String,
    required : true,
  },

  age: {
    type : Number,
    required : true,
  },

 
  aadharCardNumber : {
    type : Number,
    required : true,
    unique : true,
  },

  party : {
    type : String,
    required : true,
  },

  votes : [
    {
        users : {
                   type : mongoose.Schema.Types.ObjectId, // will store the id of the user who voted. here types means 
                   // Special predefined MongoDB types, and ObjectId is one of them. ObjectId is used as a unique identifier for each document
                   //  and also helps in creating references between collections.
                   ref : 'User', // reference to User model, means this id(objectId) is to be taken from User collection.
                   required : true,
        },
        votedAt : {
                   
                     type : Date,
                     default : Date.now(),
        }
    }
  ],

  votesCount : {
    type : Number,
    default : 0,
  }
 


});


const Candidate = mongoose.model('Candidate', CandidateSchema);

module.exports = Candidate;