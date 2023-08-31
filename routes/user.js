const express = require("express");
const router = express.Router();
const assert = require('assert');
const passport=require('passport')
const session=require('express-session')
const bcrypt= require('bcrypt');

const {ifAuthenticated}=require('./auth.js') 


// Protected route - dashboard  TO ADD BACK
router.get('/main',ifAuthenticated, (req, res) => {
  
    res.render('main');
 
  }
);


var shoppingList=[];

/**
 * @desc Renders to the shopping list page 
 */
router.get('/list',ifAuthenticated, (req,res) => {
  res.render('shoppinglist', {shoppingList});
});

router.post('/list', (req, res) =>{
  var newItem = req.body.item;
  if(newItem.trim() !== ''){
    shoppingList.push(newItem);
  }
  res.redirect('/user/list');
});

router.post('/handle-checkboxes', (req, res) =>{
  const checkedIndexes = req.body.done;
  if(checkedIndexes){
    shoppingList= shoppingList.filter((item, index) => !checkedIndexes.includes(index.toString()));
  }
  res.redirect('/user/list');
});


// myRecipe page 
router.get('/myRecipe',ifAuthenticated, (req,res) => {
  global.db.all("SELECT * FROM recipePage",function(err,data){
    if(err){
      console.log("error in myRecipe")
    }
    else{
      res.render("myRecipe.ejs",{myRecipe:data})
    }
  })
});



/**
 * @desc Renders to mealplanner page
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

  res.render('mealplanner', { year, month, firstDay, daysInMonth });
});


































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
