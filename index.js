const express = require('express');
const app = express();
const port = 3000;
const sqlite3 = require('sqlite3').verbose();
const bcrypt= require('bcrypt');
const passport=require('passport')
const session=require('express-session')
const flash=require('express-flash')

const {ifAuthenticated}=require('./routes/auth')

const initializePassport=require('./passportSetting')
initializePassport(passport)


//items in the global namespace are accessible throught out the node application
global.db = new sqlite3.Database('./database.db',function(err){
  if(err){
    console.error(err);
    process.exit(1); //Bail out we can't connect to the DB
  }else{
    console.log("Database connected");
    global.db.run("PRAGMA foreign_keys=ON"); //This tells SQLite to pay attention to foreign key constraints
  }
});

app.use(session({
  secret:"HierachyOrder",
  resave:false,
  saveUninitialized:false
}))

app.use(flash())

app.use(passport.initialize())
app.use(passport.session())

app.use(express.urlencoded({extended: true}));
app.use(express.json());


const userRoutes = require('./routes/user');


//set the app to use ejs for rendering
app.set('view engine', 'ejs');



//this adds all the userRoutes to the app under the path /user
app.use('/user', userRoutes);

app.use(express.static('css'));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

app.use('/assets', express.static('assets'));


//login function


app.get('/register',ifLoggedIn, (req,res)=>{
  res.render('register.ejs',{errorMessage:null})
})

app.get('/',ifLoggedIn,(req,res)=>{
  res.render('loginpage')
})

//send a request for session after authenticatating that the username and password is in the database
app.post('/login',passport.authenticate('local',{
  failureRedirect:'/',
   failureFlash:true
}),function(req,res){
  req.session.user_id=req.user.id
  console.log("this is user id "+req.session.user_id)
  res.redirect('/user/main')
}
)




//check if username is already in database
const usernameAvailable=async (username)=>{ 
  try{
    return new Promise((resolve,reject)=>{
      global.db.get("SELECT COUNT(*) as count FROM users WHERE user_name=?",[username],function(err,data){
        if(err){
          console.log("error in checking availibility")
          reject(err)
        }
        else{
          console.log(data)
        console.log(data.count==0)
        resolve(data.count===0)
        }
      })
    }
    )}
catch(error){
  console.log("error for data")
  return false
}
}


// if username is in database already send an error message, if not add the username and password to the database
app.post('/register',async (req,res)=>{

  try{
    const isAvailable= await usernameAvailable(req.body.username)
    console.log("isAvailable " +isAvailable)
    if(isAvailable){
    const hashedPassword=await bcrypt.hash(req.body.password, 10)

   
   global.db.run("INSERT INTO users(user_name,user_password) VALUES (?,?)",[req.body.username,hashedPassword],function(err){
    if(err){
      console.log("register error")
    }
    else{
      res.redirect('/')
    }
   })
  
}
else{
   res.render('register.ejs',{errorMessage:"Username not available"})
}
  }
catch{
    console.log ("error")
  }
})


//deserialise the session,thus logging out
app.post('/logout',(req,res,next)=>{
  req.logOut(function(err){
    if(err){
      return next(err);
    }
    res.redirect('/')
  })
 
})


//if the user is already logged in prevent them from going back to pages with this function by redirecting them to another page, example:loginPage
function ifLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return res.redirect('/user/main')
   }
   next()
}



