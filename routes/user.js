const express = require("express");
const router = express.Router();
const assert = require('assert');
const passport=require('passport')
const session=require('express-session')
const bcrypt= require('bcrypt');

const {ifAuthenticated}=require('./auth.js'); 
const { resolve } = require("path");
const { error } = require("console");


// Protected route - dashboard  TO ADD BACK
router.get('/main',ifAuthenticated, (req, res) => {
  res.render('mainpage.ejs');
  }
);


// var shoppingList=[];


/**
 * @desc Renders to shoppinglist page WORKING
 */
router.get('/list', ifAuthenticated, (req, res) => { //WORKING DO NOT DELETE 
  db.all('SELECT * FROM shoppingRecord', (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send('Internal Server Error');
    }

    res.render('shoppinglist', { shoppingList: rows });
  });
});


/**
 * @desc When a new item is added to the shopping list  WORKING
 */
router.post('/list', (req, res) => { //WORKING DO NOT DELETE
  const newItem = req.body.item;
  const quantity = req.body.quantity;

  if (newItem.trim() !== '') {
    db.run('INSERT INTO shoppingRecord (shopping_item, shopping_quantity) VALUES (?, ?)', [newItem, quantity], (err) => {
      if (err) {
        console.error(err.message);
        return res.status(500).send('Internal Server Error');
      }

      res.redirect('/user/list');
    });
  } else {
    // Handle empty item name, if needed.
    res.redirect('/user/list');
  }
});



/**
 * @desc handles the checkboxes in shoppinglist page WORKING
 */
router.post('/handle-checkboxes', (req, res) => { //WORKING DO NOT DELETE
  const checkedIndexes = req.body.done;

  if (checkedIndexes) {
    checkedIndexes.forEach((index) => {
      db.run('DELETE FROM shoppingRecord WHERE shopping_id = ?', [index], (err) => {
        if (err) {
          console.error(err.message);
          return res.status(500).send('Internal Server Error');
        }
      });
    });
  }

  res.redirect('/user/list');
});


/**
 * @desc Renders to myRecipe page WORKING
 */
router.get('/myRecipe',ifAuthenticated, async(req,res) => {

  try{
  const userId=req.session.user_id
 const favList=await new Promise((resolve, reject)=>{
  global.db.all("SELECT * FROM favouriteRecipe WHERE user_id=?",[userId],function(err,favData){
    if(err){
      console.log("error in getting favList")
      reject(err)
    }
    else{
    resolve(favData)
    }
  })
 })

 const data=[]

 for(i=0;i<favList.length;i++){
 const recipes=await new Promise((resolve,reject)=>{
global.db.get("SELECT * FROM recipes WHERE id=?",[favList[i].recipe_id],function(err,recipe){
  if(err){
    reject(err)
  }else{
    resolve(recipe)
  }
})

 })

if(recipes){
  console.log("recipe: "+recipes.title)
  data.push(recipes)
}

 }

 if(!data.length){
  console.log("error in retrieving data")
 }else{
  console.log("data:" + data);
  res.render("myRecipe.ejs", { myRecipe: data })
 }

}
catch(error){
console.error(error)
}

})
 





/**
 * @desc Renders to mealplanner page WORKING
 */
router.get('/planner',ifAuthenticated, (req, res) => {
  const today = new Date();

  let year = parseInt(req.query.year) || today.getFullYear();
  let month = parseInt(req.query.month) || today.getMonth();
  
  if (month < 0) {
    month = 11; // Wrap to December of the previous year
    year--;
  } else if (month > 11) {
    month = 0; // Wrap to January of the next year
    year++;
  }

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const selectedDate = req.query.date || null;

  res.render('mealplanner', { year, month, firstDay, daysInMonth, selectedDate });
});


/**
 * @desc When a user saves data for the calendar, saves into table and redirects back to planner WORKING
 */
router.post('/save-calendar-data', (req, res) => {
  const user_id = req.session.user_id;
  const date = req.body.date;
  const breakfast = req.body.breakfast;
  const breakfastCalories = parseInt(req.body.breakfast_calories) || 0;
  const lunch = req.body.lunch;
  const lunchCalories = parseInt(req.body.lunch_calories) || 0;
  const dinner = req.body.dinner;
  const dinnerCalories = parseInt(req.body.dinner_calories) || 0;

  const totalCalories = breakfastCalories + lunchCalories + dinnerCalories;

  // Insert the data into the calendar table
  db.run(
    "INSERT OR REPLACE INTO calendar (user_id, date, breakfast, breakfast_calories, lunch, lunch_calories, dinner, dinner_calories, total_calories) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [user_id, date, breakfast, breakfastCalories, lunch, lunchCalories, dinner, dinnerCalories, totalCalories],
    function (err) {
      if (err) {
        console.error('Error saving calendar data:', err);
        res.status(500).send('Error saving calendar data');
      } else {
        // res.status(200).send('Calendar data saved successfully');
        res.redirect('/user/planner');
      }
    }
  );
});


// recipe page WORKING 
router.get('/recipe', (req, res) => {
  const { id } = req.query;
  const sqlite2 = 'SELECT * FROM recipes WHERE id = ?';
  
  db.all(sqlite2, [id], (err,data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Internal Server Error');
    }

    data[0].ingredients = data[0].ingredients.replace(/'/g, '"');
    // Parse the JSON string into an array
    const parsedArray = JSON.parse(data[0].ingredients);

    data[0].ingredients = parsedArray;

    res.render('recipe', { recipeData: data,message:null });
  });
}
);

router.post("/toFavourite",async(req,res)=>{

 try{
const userId=req.session.user_id

const idExistAlr=await new Promise((resolve,reject)=>{
global.db.get("SELECT * FROM favouriteRecipe where recipe_id=?",[req.body.id],function(err,recipe){
  if(err){
    reject(err)
  }else{
    resolve(recipe)
  }
})
})

 if(!idExistAlr){
  global.db.get("SELECT * FROM recipes WHERE id=?",[req.body.id],function(err,data){
    if(err){
      console.log("Error: Failed to get data from provided id")
    }
    else{
      if(!data){
        console.log("NoData: Failed to get data from provided id")
      }
      else{
         global.db.run("INSERT INTO favouriteRecipe(user_id,recipe_id) VALUES (?,?)",[userId,req.body.id],function(err){
          if(err){
            console.log("Fail to insert to favourite")
           }
           else{
            console.log("checkpt" + userId)
           }
         })
      
        res.redirect("back")
      }
    }
  })
}
else{
  res.render("/user/recipe?id="+req.body.id,{message:"This is already in favourite"})
}
 }
 catch(error){
  console.error(error)
 }
  

})

































///////////////////////////////////////////// HELPERS ///////////////////////////////////////////

// /**
//  * @desc A helper function to generate a random string
//  * @returns a random lorem ipsum string
//  */
// function generateRandomData(numWords = 5) {
//   const str =
//     "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum";

//   const words = str.split(" ");

//   let output = "";

//   for (let i = 0; i < numWords; i++) {
//     output += choose(words);
//     if (i < numWords - 1) {
//       output += " ";
//     }
//   }

//   return output;
// }

// /**
//  * @desc choose and return an item from an array
//  * @returns the item
//  */
// function choose(array) {
//   assert(Array.isArray(array), "Not an array");
//   const i = Math.floor(Math.random() * array.length);
//   return array[i];
// }



module.exports = router;
