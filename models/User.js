const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  name: {
    type : String,
    required : true,
  },

  age: {
    type : Number,
    required : true,
  },

  city:{
    type : String,
  },
  
  mobile : {
    type : String,
    required : true,
  },
  email : {
    type : String,
    required : true,
    
  },
  address : {
    type : String,
  },

  aadharCardNumber : {
    type : Number,
    required : true,
    unique : true,
  },

  username : {
    type : String,
    required : true,
  },

  password : {
    type : String,
    required : true,
  },

  role : {
    type : String,
    enum : ['voter', 'admin'],
    required : true,
    default : 'voter',
  },

  isVoted : {
    type : Boolean,
    default : false,
  }

});


const User = mongoose.model('User', UserSchema);

module.exports = User;