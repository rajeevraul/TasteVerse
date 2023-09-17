const express = require("express");
const router = express.Router();
const assert = require('assert');
const passport = require('passport')
const session = require('express-session')
const bcrypt = require('bcrypt');
const flash = require('express-flash')

const { ifAuthenticated } = require('./auth.js');
const { resolve } = require("path");
const { error } = require("console");
const { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth } = require('date-fns');


function areStringsSimilar(string1, string2, threshold = 0.7) {
  function calculateJaccardSimilarity(set1, set2) {
    const intersection = new Set([...set1].filter((char) => set2.has(char)));
    const union = new Set([...set1, ...set2]);
    return intersection.size / union.size;
  }

  const set1 = new Set(string1);
  const set2 = new Set(string2);

  const similarity = calculateJaccardSimilarity(set1, set2);

  return similarity >= threshold;
}

// Protected route - dashboard  TO ADD BACK
router.get('/main', ifAuthenticated, async (req, res) => {
  const userId = req.session.user_id;
  const recipes = await new Promise((resolve, reject) => {
    global.db.all(
      'SELECT title, image_name, id, ingredients FROM recipes LIMIT 20',
      function (err, recipe) {
        if (err) {
          reject(err);
        } else {
          resolve(recipe);
        }
      }
    );
  });
  const favList = await new Promise((resolve, reject) => {
    global.db.all(
      'SELECT * FROM favouriteRecipe WHERE user_id=?',
      [userId],
      function (err, favData) {
        if (err) {
          console.log('error in getting favList');
          reject(err);
        } else {
          resolve(favData);
        }
      }
    );
  });

  let favouriteRecipesExpanded = [];
  for (let i = 0; i < favList.length; i++) {
    filteredRecipe = recipes.find(
      (recipe) => recipe.id == favList[i].recipe_id
    );
    favouriteRecipesExpanded.push(filteredRecipe);
  }

  let recommededRecipe = [];
  for (let i = 0; i < favouriteRecipesExpanded.length; i++) {
    for (let j = 0; j < recipes.length; j++) {
      if (
        areStringsSimilar(
          favouriteRecipesExpanded[i].ingredients,
          recipes[j].ingredients
        )
      ) {
        recommededRecipe.push(recipes[j]);
      }
    }
  }
  console.log('recommendedRecipe: ', recommededRecipe);
  res.render('mainpage.ejs', {
    latestRecipe: recipes,
    recommededRecipes: recommededRecipe,
  });
});


/**
 * @desc Renders to shoppinglist page WORKING
 */
router.get('/list', ifAuthenticated, (req, res) => { 
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
router.post('/list', (req, res) => { 
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
router.post('/handle-checkboxes', (req, res) => {
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
router.get('/myRecipe', ifAuthenticated, async (req, res) => {
  try {
    const userId = req.session.user_id

    // get all the data in modifiedRecipe belonging to the userId
    const modifiedRecipe = await new Promise((resolve, reject) =>
      global.db.all("SELECT * FROM modifiedRecipe where user_id=?", [userId], function (err, modified) {
        if (err) {
          reject(err)
        } else {
          console.log("modified:" + modified)
          resolve(modified)
        }
      })
    )

    // get all the data in favouriteRecipe belonging to the userId which is just recipe_id
    const favList = await new Promise((resolve, reject) => {
      global.db.all("SELECT * FROM favouriteRecipe WHERE user_id=?", [userId], function (err, favData) {
        if (err) {
          console.log("error in getting favList")
          reject(err)
        }
        else {
          resolve(favData)
        }
      })
    })

    const data = []

    // Based on array size of favList run multiple GET request to find all the recipes in the "recipes" database that has the same recipe_id in favList  
    for (i = 0; i < favList.length; i++) {
      const recipes = await new Promise((resolve, reject) => {
        global.db.get("SELECT * FROM recipes WHERE id=?", [favList[i].recipe_id], function (err, recipe) {
          if (err) {
            reject(err)
          } else {
            resolve(recipe)
          }
        })
      })
      // if recipes exist push it to data
      if (recipes) {
        console.log("recipe: " + recipes.title)
        data.push(recipes)
      }
    }
    //render the myRecipe page
    res.render("myRecipe.ejs", { favRecipe: data, modifiedRecipe: modifiedRecipe })
  }
  catch (error) {
    res.sendStatus(500);

  }
});

/**
 * @desc Renders to meal planner page WORKING
 */
router.get('/planner', ifAuthenticated, (req, res) => {
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
    for (let i = 0; i < 7; i++) {
      week.push({
        date: currentDate,
        day: format(currentDate, 'd'),
        isCurrentMonth: isSameMonth(currentDate, selectedDate),
      });
      currentDate = addDays(currentDate, 1);
    }
    calendar.push(week);
  }
  res.render('mealplanner', { calendar, year, month });
});


/**
 * @desc When a user saves data for the calendar, saves into table and redirects back to planner with the data
 */
router.post('/save-calendar-data', ifAuthenticated, (req, res) => {
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
  const currentUserId = req.userId;

  if (!totalCalories || isNaN(totalCalories)) {
    console.error('Invalid total calories value');
    return res.sendStatus(400);
  }

  db.run('INSERT INTO calendar (user_id, breakfast, breakfast_calories, lunch, lunch_calories, dinner, dinner_calories, total_calories, dayOfMonth) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [currentUserId, breakfast, breakfast_calories, lunch, lunch_calories, dinner, dinner_calories, totalCalories, dayOfMonth],
    (err) => {
      if (err) {
        console.error('Error inserting data into the calendar table:', err);
        res.sendStatus(500);
      } else {
        console.log('Data inserted successfully');
        res.redirect('/user/planner');
      }
    }
  );
});


function retrievedDataFromDatabase(selectedDate, userId, callback) {
  db.get(
    'SELECT breakfast, breakfast_calories, lunch, lunch_calories, dinner, dinner_calories, total_calories FROM calendar WHERE dayOfMonth=? AND user_id=?',
    [selectedDate, userId],
    (err, row) => {
      if (err) {
        console.error('Error querying the database:', err);
        callback(err, null);
      } else {
        callback(null, row);
      }
    }
  );
}


/**
 * @desc Retrieves the data about the specific data and displays it on the form 
 */
router.get('/get-calendar-data', ifAuthenticated, (req, res) => {
  const selectedDate = req.query.date;
  const currentUserId = req.userId; 
  retrievedDataFromDatabase(selectedDate, currentUserId, (err, data) => {
    if (err) {
      res.status(500).json({ error: 'Error retrieving data from the database' });
    } else {
      res.json(data);
    }
  });
});


function saveOrUpdateUserMetrics(req, res, next) {
  const { age, gender, height, weight } = req.body;
  const currentUserId = req.userId;

  if (!age || !gender || !height || !weight) {
    return res.status(400).json({ error: 'Missing required user metrics' });
  }

  db.get(
    'SELECT * FROM user_metrics WHERE user_id = ?',
    [currentUserId],
    (err, row) => {
      if (err) {
        console.error('Error querying the database:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      if (row) {
        // Update existing record
        db.run(
          'UPDATE user_metrics SET age = ?, gender = ?, height = ?, weight = ? WHERE user_id = ?',
          [age, gender, height, weight, currentUserId],
          function (err) {
            if (err) {
              console.error('Error updating user_metrics:', err);
              return res.status(500).json({ error: 'Internal Server Error' });
            }
            console.log(`User metrics updated with rowid ${this.lastID}`);
            next();
          }
        );
      } else {
        // Insert new record
        db.run(
          'INSERT INTO user_metrics (user_id, age, gender, height, weight) VALUES (?, ?, ?, ?, ?)',
          [currentUserId, age, gender, height, weight],
          function (err) {
            if (err) {
              console.error('Error inserting into user_metrics:', err);
              return res.status(500).json({ error: 'Internal Server Error' });
            }
            console.log(`User metrics inserted with rowid ${this.lastID}`);
            next();
          }
        );
      }
    }
  );
}


router.post('/save-user-metrics', ifAuthenticated, saveOrUpdateUserMetrics, (req, res) => {
  console.log('Received Request Body:', req.body);
  res.status(200).json({ message: 'User metrics saved successfully' });
});


/**
 * @desc recipe page 
 */
router.get('/recipe', ifAuthenticated, (req, res) => {
  const { id } = req.query;
  const sqlite = 'SELECT * FROM recipes WHERE id = ?';
  const message = req.flash('message')

  db.all(sqlite, [id], (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Internal Server Error');
    }

    data[0].ingredients = data[0].ingredients.replace(/'/g, '"');
    // Parse the JSON string into an array
    const parsedArray = JSON.parse(data[0].ingredients);

    data[0].ingredients = parsedArray;
    req.flash('message', 'This is an error message');
    res.render('recipe', { recipeData: data, message });
  });
});


/**
 * @desc modified recipe page
 */
router.get('/modifiedRecipe', ifAuthenticated, (req, res) => {
  const { modifiedRecipe_id } = req.query;
  const sqlite = 'SELECT * FROM modifiedRecipe WHERE modifiedRecipe_id = ?';
  const message = req.flash('message')

  db.all(sqlite, [modifiedRecipe_id], (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Internal Server Error');
    }
    data[0].modifiedRecipe_ingredients = data[0].modifiedRecipe_ingredients.replace(/'/g, '"');
    // Parse the JSON string into an array
    const parsedArray = JSON.parse(data[0].modifiedRecipe_ingredients);

    data[0].modifiedRecipe_ingredients = parsedArray;
    req.flash('message', 'This is an error message');
    res.render('modifiedRecipe', { recipeData: data, message });
  });
});

/**
 * @desc Make a new records to modifiedRecipe table
 */
router.post('/modify', (req, res) => {
  const userId = req.session.user_id
  const { id, title, ingredients, instructions, image } = req.body; //get the original recipe title, ingredients, instructions, and image_name 
  const ingredientsArray = ingredients.split(',').map((ingredient) => ingredient.trim());
  const ingredientsJSON = JSON.stringify(ingredientsArray);

  const sql = 'INSERT INTO modifiedRecipe (user_id, recipe_id, modifiedRecipe_title, modifiedRecipe_ingredients, modifiedRecipe_instructions, image_name) VALUES (?, ?, ?, ?, ?, ?)';
  db.run(sql, [userId, id, title, ingredientsJSON, instructions, image], function (err) {
    if (err) {
      console.error(err.message);
      return res.status(500).send('Internal Server Error');
    }
    const modifiedRecipe_id = this.lastID;
    res.redirect('/user/modifyRecipe?modifiedRecipe_id=' + modifiedRecipe_id);
  });
});


/**
 * @desc modifying a recipe page
 */
router.get('/modifyRecipe', ifAuthenticated, (req, res) => {
  const { modifiedRecipe_id } = req.query;
  const sqlite = 'SELECT * FROM modifiedRecipe WHERE modifiedRecipe_id = ?';
  const message = req.flash('message')

  db.all(sqlite, [modifiedRecipe_id], (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Internal Server Error');
    }

    data[0].modifiedRecipe_ingredients = data[0].modifiedRecipe_ingredients.replace(/'/g, '"');
    // Parse the JSON string into an array
    const parsedArray = JSON.parse(data[0].modifiedRecipe_ingredients);

    data[0].modifiedRecipe_ingredients = parsedArray;
    req.flash('message', 'This is an error message');
    res.render('modifyRecipe', { modifyRecipeData: data, message });
  });
});


/**
 * @desc Remove a recipe from the modifiedRecipe table
 */
router.post("/modified/:modifiedRecipe_id", (req, res) => {
  const { modified_title, modified_ingredient, modified_instructions, modifiedRecipe_id } = req.body;
  const sqlite = 'UPDATE modifiedRecipe SET modifiedRecipe_title = ?, modifiedRecipe_ingredients = ?, modifiedRecipe_instructions = ? WHERE modifiedRecipe_id = ?';
  const ingredientsJSON = JSON.stringify(modified_ingredient);
  db.run(sqlite, [modified_title, ingredientsJSON, modified_instructions, modifiedRecipe_id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Internal Server Error');
    }
    res.redirect('/user/main');
  });
});

/**
 * @desc Add a recipe to favouriteRecipe table 
*/

// This code is to add a recipe to the favouriteRecipe table in the database
router.post("/toFavourite", async (req, res) => {
  try {
    //get the current userId
    const userId = req.session.user_id

    //check if the user has already added the current recipe to favouriteRecipe in the database
    const idExistAlr = await new Promise((resolve, reject) => {
      global.db.get("SELECT * FROM favouriteRecipe where recipe_id=?", [req.body.id], function (err, recipe) {
        if (err) {
          reject(err)
        } else {
          resolve(recipe)
        }
      })
    })

    // if the recipe is not in the database run this code to add the recipe to the favourite database
    if (!idExistAlr) {
      global.db.get("SELECT * FROM recipes WHERE id=?", [req.body.id], function (err, data) {
        if (err) {
          console.log("Error: Failed to get data from provided id")
        }
        else {
          if (!data) {
            console.log("NoData: Failed to get data from provided id")
          }
          else {
            global.db.run("INSERT INTO favouriteRecipe(user_id,recipe_id) VALUES (?,?)", [userId, req.body.id], function (err) {
              if (err) {
                console.log("Fail to insert to favourite")
              }
              else {
                console.log("checkpt" + userId)
              }
            })
            req.flash("message", "Added to Favourite")
            res.redirect("back")
          }
        }
      })
    }
    // if the recipe is in the database show a flash message and redirect them to their current recipe page
    else {
      req.flash("message", "In Favourite Already")
      res.redirect('/user/recipe?id=' + req.body.id)
    }
  }
  catch (error) {
    res.sendStatus(500);
  }
});


/**
 * @desc Remove a recipe from favouriteRecipe table in the database
 */
router.post("/deleteFavourite", (req, res) => {
  global.db.run("DELETE FROM favouriteRecipe where recipe_id=?", [req.body.recipe_id], function (err) {
    if (err) {
      res.sendStatus(500);
    }
    else { console.log("success") }
    res.redirect("back")
  })
});


/**
 * @desc Remove a recipe from modifiedRecipe table in the database
 */
router.post("/deleteModified", (req, res) => {
  global.db.run("DELETE FROM modifiedRecipe where modifiedRecipe_id=?", [req.body.recipe_id], function (err) {
    if (err) {
      console.log("error in deleting from favouriteList")
    }
    else { console.log("success") }
    res.redirect("back")
  })
});

// Find recipe page and search bar
router.get('/search-result', ifAuthenticated, (req, res) => {
  const searchTerm = req.query.searchTerm;
  const sqlite = 'SELECT title, image_name, id FROM recipes WHERE title LIKE ? LIMIT 45';

  // Perform a database query to retrieve data
  global.db.all(sqlite, [`%${searchTerm}%`], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Internal Server Error');
    }

    console.log(rows);
    const recipeNames = rows.map((row) => row.title);

    res.render('search', { items: rows });

  });
});

module.exports = router;
