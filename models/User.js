const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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

//   username : {
//     type : String,
//     required : true,
//   },

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


//middleware provided by mongoose to hash password before saving to database
UserSchema.pre('save', async function() {

  const user = this; // getting current user document to be saved for every save operation(create or update)

  if(!user.isModified('password')) return; // if password is not modified then skip hashing and proceed to save.
  try
  {
     //salt generation
     const salt = await bcrypt.genSalt(10);
     //hashing password using generated salt by us
     const hashedPassword = await bcrypt.hash(user.password, salt);
     //overwriting the prexisting plain password with hashed password
     user.password = hashedPassword;
    //  next(); // proceed to save
  }
  catch(err)
  {
      return next(err);
  }
})

//method to compare password during login
UserSchema.methods.comparePassword = async function (candidatePassword)
{
  try
  {
    //used bcrypt to compare the provided password with hashed password stored in database
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
  }
  catch(err)
  {
    throw new Error(err);
  }
}


const User = mongoose.model('User', UserSchema);

module.exports = User;