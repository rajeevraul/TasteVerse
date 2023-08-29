const passport=require('passport')
const localStrategy=require('passport-local').Strategy
const bcrypt=require('bcrypt')



function initialize(passport){

const authUser=(username,password,done)=>{
// const user=getUserByUserName(username)
// if(user==null){
//     return done(null,false, {message:'User name is invalid'})
// }

global.db.get("SELECT * FROM users where user_name=?",[username],async function(err,data){
  if(err){
    return done(err);
  }
  else{
   let userAuth={
      username:data.user_name,
      password:data.user_password,
      id:data.user_id
    }
    
    try{
      if (await bcrypt.compare(password,userAuth.password)){
        console.log({message:"logged in", user:userAuth})
      return done(null,{message:"logged in", user:userAuth})
      }
      else{
          return done(null,false,{message:'Incorrect password'})
      }
      
        }
      catch(error){
      return done(error)
        }

  }
})



}


passport.use(new localStrategy({usernameField:'username'},authUser))


passport.serializeUser((authUser,done)=>{
  console.log(authUser)
  let user=authUser.user.username
  
  global.db.get("SELECT * FROM users WHERE user_name = ?", [user], function(err, data) {
if(err){
  return done(error)
}else{
  console.log(data)
  done(null,data.user_id)
}
})
  })


passport.deserializeUser((id, done) => {
 
 
  global.db.get("SELECT * FROM users WHERE user_id = ?", [id], function(err, data) {
    if (err) {
      return console.log("passport failed to get user by ID");
    } else {
      done(null, data);
    }
  });
});

}

module.exports=initialize
