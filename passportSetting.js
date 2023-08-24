const passport=require('passport')
const localStrategy=require('passport-local').Strategy
const bcrypt=require('bcrypt')



function initialize(passport,getUserByUserName,getUserById){

const authUser=async (username,password,done)=>{
const user=getUserByUserName(username)
if(user==null){
    return done(null,false, {message:'User name is invalid'})
}

try{
if (await bcrypt.compare(password,user.password)){

}
else{
    return done(null,false,{message:'Incorrect password'})
}

  }
catch(error){
return done(error)
  }

}

passport.use(new localStrategy({usernameField:'username'},authUser))
passport.serializeUser((user,done)=> done(null,user.id))
passport.deserializeUser((id,done)=>{
   return done(null,getUserById(id))
})
}

module.exports=initialize
