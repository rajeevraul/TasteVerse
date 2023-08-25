const express = require('express');
const app = express();
const port = 3000;
const sqlite3 = require('sqlite3').verbose();
const bcrypt= require('bcrypt');
const passport=require('passport')
const session=require('express-session')
const flash=require('express-flash')

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

app.use(express.urlencoded({extended: true}));

const userRoutes = require('./routes/user');


//set the app to use ejs for rendering
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render("loginpage");
});


//this adds all the userRoutes to the app under the path /user
app.use('/user', userRoutes);

app.use(express.static('css'));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

app.use('/assets', express.static('assets'));


//login function 


app.use(session({
  secret:"HierachyOrder",
  resave:false,
  saveUninitialized:false
}))

app.use(flash())

app.use(passport.initialize())
app.use(passport.session())

app.get('/register', (req,res)=>{
  res.render('register.ejs')
})

app.get('/login', (req,res)=>{
  res.render('loginpage')
})


app.post('/login',passport.authenticate('local',{
  successRedirect:'/user/myRecipe',
  failureRedirect:'/register',
   failureFlash:true
}))


app.post('/registered',async (req,res)=>{
  try{
    const hashedPassword=await bcrypt.hash(req.body.password, 10)
    
   global.db.run("INSERT INTO users(user_name,user_password) VALUES (?,?)",[req.body.username,hashedPassword],function(err){
    if(err){
      console.log("register error")
    }
    else{
      res.redirect('/login')
    }
   })
  }catch{
    console.log ("error")
  }

})

app.post('/logout',(req,res,next)=>{
  req.logOut(function(err){
    if(err){
      return next(err);
    }
    res.redirect('register')
  })
 
})

