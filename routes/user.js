const express = require("express");
const router = express.Router();
const assert = require('assert');
const passport=require('passport')
const session=require('express-session')
const bcrypt= require('bcrypt');
const flash=require('express-flash')

const {ifAuthenticated}=require('./auth.js'); 
const { resolve } = require("path");
const { error } = require("console");
const { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth } = require('date-fns');


// Protected route - dashboard  TO ADD BACK
// router.get('/main',ifAuthenticated, (req, res) => {
router.get('/main', (req, res) => {
  res.render('mainpage.ejs');
  }
);


// var shoppingList=[];


/**
 * @desc Renders to shoppinglist page WORKING
 */
// router.get('/list', ifAuthenticated, (req, res) => { //WORKING DO NOT DELETE 
router.get('/list', (req, res) => { //WORKING DO NOT DELETE 
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
// router.get('/myRecipe',ifAuthenticated, async(req,res) => {
router.get('/myRecipe',ifAuthenticated, async(req,res) => {
  try{
  const userId=req.session.user_id

  const modifiedRecipe=await new Promise((resolve,reject)=>
   global.db.all("SELECT * FROM modifiedRecipe where user_id=?",[userId],function(err,modified){
    if(err){
    reject(err)
    }else{
      console.log("modified:"+modified)
      resolve (modified)
    }
  })
  )


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

 
  console.log("data:" + data);
  res.render("myRecipe.ejs", { myRecipe: data, modifiedRecipe:modifiedRecipe })
 

}
catch(error){
console.error(error)
res.status(500).send("Internal Server Error");

}

}) 
 





// /**
//  * @desc Renders to mealplanner page WORKING
//  */
// router.get('/planner',ifAuthenticated, (req, res) => {
//   const today = new Date();

//   let year = parseInt(req.query.year) || today.getFullYear();
//   let month = parseInt(req.query.month) || today.getMonth();
  
//   if (month < 0) {
//     month = 11; // Wrap to December of the previous year
//     year--;
//   } else if (month > 11) {
//     month = 0; // Wrap to January of the next year
//     year++;
//   }

//   const firstDay = new Date(year, month, 1).getDay();
//   const daysInMonth = new Date(year, month + 1, 0).getDate();

//   const selectedDate = req.query.date || null;


//   res.render('mealplanner', { year, month, firstDay, daysInMonth, selectedDate });
// });




// /**
//  * @desc When a user saves data for the calendar, saves into table and redirects back to planner with the data
//  */
// router.post('/save-calendar-data', (req, res) => {
//   const user_id = req.session.user_id;
//   const meal_id = req.body.meal_id;
//   const dayOfMonth = req.query.date;
//   const breakfast = req.body.breakfast;
//   const breakfastCalories = parseInt(req.body.breakfast_calories) || 0;
//   const lunch = req.body.lunch;
//   const lunchCalories = parseInt(req.body.lunch_calories) || 0;
//   const dinner = req.body.dinner;
//   const dinnerCalories = parseInt(req.body.dinner_calories) || 0;

//   const totalCalories = breakfastCalories + lunchCalories + dinnerCalories;

//   // Insert the data into the calendar table
//   db.run(
//     "INSERT OR REPLACE INTO calendar (meal_id, user_id, breakfast, breakfast_calories, lunch, lunch_calories, dinner, dinner_calories, total_calories, dayOfMonth) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
//     [meal_id, user_id, breakfast, breakfastCalories, lunch, lunchCalories, dinner, dinnerCalories, totalCalories, dayOfMonth],
//     function (err) {
//       if (err) {
//         console.error('Error saving calendar data:', err);
//         res.status(500).send('Error saving calendar data');
//       } else {
//         // res.status(200).send('Calendar data saved successfully');
//         res.redirect('/user/planner');
//       }
//     }
//   );
// });

// router.get('/get-calendar-data',ifAuthenticated, (req, res) => {
//   const user_id = req.session.user_id;
//   const dayOfMonth = req.query.date || null;
//   // const selectedDate = req.query.date || null;
//   db.get(
//     "SELECT * FROM calendar WHERE user_id=? AND dayOfMonth=?",
//     [user_id, dayOfMonth],
//     function(err, row){
//       if(err){
//         console.error('Error fetching calendar data:', err);
//         res.status(500).send('Error fetching calendar data');
//       }else{
//         if(row){
//           res.json(row);
//         } else{
//           res.status(404).json({message: 'No data found for the selected date' });
//         }
//       }
//     }
//   );
// });

/**
 * @desc Renders to meal planner page WORKING
 */
router.get('/planner', (req, res) => {
  const selectedDate = new Date(req.query.date || new Date());
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const firstDayOfMonth = startOfMonth(selectedDate);
  const lastDayOfMonth = endOfMonth(selectedDate);

  const startOfWeekDate = startOfWeek(firstDayOfMonth);
  const endOfWeekDate = endOfWeek(lastDayOfMonth);

  var calendar = [];
  let currentDate = startOfWeekDate;
  while (currentDate <= endOfWeekDate) {
    const week = [];
    for(let i = 0; i < 7; i++){
      week.push({
        date: currentDate,
        day: format(currentDate, 'd'),
        isCurrentMonth: isSameMonth(currentDate, selectedDate),
      });
      currentDate = addDays(currentDate, 1);
    }
    calendar.push(week);
  }
  res.render('mealplanner', { calendar, year, month});
});

/**
 * @desc When a user saves data for the calendar, saves into table and redirects back to planner with the data
 */
router.post('/save-calendar-data', (req, res) => {
  const {
    breakfast,
    breakfast_calories,
    lunch,
    lunch_calories,
    dinner,
    dinner_calories,
    totalCalories,
    dayOfMonth,
  } = req.body;
  console.log('Received Request Body:', req.body);
  // const totalCalories = document.getElementById('totalCalories').value;
  // const totalCalories = req.body.totalCalories;

  if (!totalCalories || isNaN(totalCalories)) {
    console.error('Invalid total calories value');
    return res.sendStatus(400);
  }

  db.run('INSERT INTO calendar (user_id, breakfast, breakfast_calories, lunch, lunch_calories, dinner, dinner_calories, total_calories, dayOfMonth) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', 
    [1, breakfast, breakfast_calories, lunch, lunch_calories, dinner, dinner_calories, totalCalories, dayOfMonth],
    (err) => {
      if(err){
        console.error('Error inserting data into the calendar table:', err);
        res.sendStatus(500);
      }else{
        console.log('Data inserted successfully');
        // res.sendStatus(200);
        res.redirect('/user/planner');
      }
    }
  );
});

function retrievedDataFromDatabase(selectedDate, callback){
  db.get(
    'SELECT breakfast, breakfast_calories, lunch, lunch_calories, dinner, dinner_calories, total_calories FROM calendar WHERE dayOfMonth = ?',
    [selectedDate],
    (err, row) => {
      if(err){
        console.error('Error querying the database:', err);
        callback(err, null);
      }else{
        callback(null, row);
      }
    }
  );
}

/**
 * @desc Retrieves the data about the specific data and displays it on the form 
 */
router.get('/get-calendar-data', (req, res) => {
  const selectedDate = req.query.date;
  retrievedDataFromDatabase(selectedDate, (err, data) => {
    if(err){
      res.status(500).json({error: 'Error retrieving data from the database'});
    }else{
      res.json(data);
    }
  });
});












// recipe page WORKING 
router.get('/recipe', ifAuthenticated, (req, res) => {
  const { id } = req.query;
  const sqlite = 'SELECT * FROM recipes WHERE id = ?';
  const message=req.flash('message')
  
  db.all(sqlite, [id], (err,data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Internal Server Error');
    }

    data[0].ingredients = data[0].ingredients.replace(/'/g, '"');
    //data[0].ingredients = data[0].ingredients.replace(/'/g, "'");
    // Parse the JSON string into an array
    const parsedArray = JSON.parse(data[0].ingredients);

    //console.log(data[0].ingredients);

    data[0].ingredients = parsedArray;
    req.flash('message', 'This is an error message');
    res.render('recipe', { recipeData: data,message});
  });
});

// recipe page WORKING 
router.get('/modifiedRecipe', ifAuthenticated, (req, res) => {
  const { modifiedRecipe_id } = req.query;
  const sqlite = 'SELECT * FROM modifiedRecipe WHERE modifiedRecipe_id = ?';
  const message=req.flash('message')
  
  db.all(sqlite, [modifiedRecipe_id], (err,data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Internal Server Error');
    }

    data[0].modifiedRecipe_ingredients = data[0].modifiedRecipe_ingredients.replace(/'/g, '"');
    //data[0].ingredients = data[0].ingredients.replace(/'/g, "'");
    // Parse the JSON string into an array
    const parsedArray = JSON.parse(data[0].modifiedRecipe_ingredients);

    console.log(data[0].modifiedRecipe_ingredients);

    data[0].modifiedRecipe_ingredients = parsedArray;
    req.flash('message', 'This is an error message');
    res.render('modifiedRecipe', { recipeData: data,message});
  });
});

router.post('/modify',(req, res) => {
  const userId=req.session.user_id
  const { id, title, ingredients, instructions, image} = req.body;

  const ingredientsArray = ingredients.split(',').map((ingredient) => ingredient.trim());
  const ingredientsJSON = JSON.stringify(ingredientsArray);

  const sql = 'INSERT INTO modifiedRecipe (user_id, recipe_id, modifiedRecipe_title, modifiedRecipe_ingredients, modifiedRecipe_instructions, image_name) VALUES (?, ?, ?, ?, ?, ?)';
  db.run(sql, [userId, id, title, ingredientsJSON, instructions, image], (err) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send('Internal Server Error');
    }

    res.redirect("/user/modifyRecipe?id=" + id);
  });
  
});

router.get('/modifyRecipe', ifAuthenticated, (req, res) => {
  const { id } = req.query;
  const sqlite = 'SELECT * FROM modifiedRecipe WHERE recipe_id = ?';
  const message=req.flash('message')
  
  db.all(sqlite, [id], (err,data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Internal Server Error');
    }

    data[0].modifiedRecipe_ingredients = data[0].modifiedRecipe_ingredients.replace(/'/g, '"');
    // Parse the JSON string into an array
    const parsedArray = JSON.parse(data[0].modifiedRecipe_ingredients);

    data[0].modifiedRecipe_ingredients = parsedArray;
    req.flash('message', 'This is an error message');
    res.render('modifyRecipe', { modifyRecipeData: data,message});
  });
});

router.post("/modified/:modifiedRecipe_id", (req, res) => { 
  
  const { modified_title, modified_ingredient, modified_instructions, modifiedRecipe_id } = req.body;
  const sqlite = 'UPDATE modifiedRecipe SET modifiedRecipe_title = ?, modifiedRecipe_ingredients = ?, modifiedRecipe_instructions = ? WHERE modifiedRecipe_id = ?';

  console.log(req.body);
  const ingredientsJSON = JSON.stringify(modified_ingredient);
  
  db.run(sqlite, [modified_title, ingredientsJSON, modified_instructions, modifiedRecipe_id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Internal Server Error');
    }
    res.redirect('/user/main');
  });
});


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
  req.flash("message","In Favourite Already")
  res.redirect('/user/recipe?id='+req.body.id)
}
 }
 catch(error){
  console.error(error)
 }
  

})

router.post("/deleteFavourite",(req,res)=>{
  global.db.run("DELETE FROM favouriteRecipe where recipe_id=?",[req.body.recipe_id],function(err){
    if(err){
      console.log("error in deleting from favouriteList")
    }
    else{console.log("success")}
    res.redirect("back")
  })
})


router.post("/deleteModified",(req,res)=>{
  global.db.run("DELETE FROM modifiedRecipe where recipe_id=?",[req.body.recipe_id],function(err){
    if(err){
      console.log("error in deleting from favouriteList")
    }
    else{console.log("success")}
    res.redirect("back")
  })
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
