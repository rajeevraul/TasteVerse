
-- This makes sure that foreign_key constraints are observed and that errors will be thrown for violations
PRAGMA foreign_keys=ON;

BEGIN TRANSACTION;

--create your tables with SQL commands here (watch out for slight syntactical differences with SQLite)

CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_name TEXT NOT NULL,
    user_password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS shoppingRecord(
    shopping_id INTEGER PRIMARY KEY AUTOINCREMENT,
    shopping_item TEXT NOT NULL, 
    shopping_quantity INTEGER
);


CREATE TABLE IF NOT EXISTS modifiedRecipe(
    modifiedRecipe_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    recipe_id INTEGER,
    modifiedRecipe_title TEXT NOT NULL,
    modifiedRecipe_ingridients TEXT NOT NULL,
    modifiedRecipe_instructions TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS favouriteRecipe(
    favouriteRecipe_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    recipe_id INTEGER
);

CREATE TABLE IF NOT EXISTS calendar(
    meal_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    breakfast TEXT NOT NULL,
    breakfast_calories INTEGER NOT NULL,
    lunch TEXT NOT NULL,
    lunch_calories INTEGER NOT NULL,
    dinner TEXT NOT NULL,
    dinner_calories INTEGER NOT NULL,
    total_calories INTEGER NOT NULL,
    dayOfMonth TEXT NOT NULL
    
);

--insert data here



 


COMMIT;

