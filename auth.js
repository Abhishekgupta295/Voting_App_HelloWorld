const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User =  require('./models/User');


passport.use(new LocalStrategy( async function(username, password, done){
  try 
  {
     
     const isClientusernameExist = await User.findOne({username : username});
     console.log(isClientusernameExist);
     if(!isClientusernameExist)
     {
      return done (null, false, {message : 'Incorrect username. please try again.'});
     }
     const isPasswordMatch =  isClientusernameExist.comparePassword(password);
     if(isPasswordMatch)
     {
       return done(null , isClientusernameExist);
     }
     else
     {
      return done (null, false, {message : 'Incorrect password. please try again.'});
     }
  }
  catch(err)
  { 
    return done (err);
  }
}
));

module.exports = passport;