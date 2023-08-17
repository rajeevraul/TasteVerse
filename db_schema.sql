
-- This makes sure that foreign_key constraints are observed and that errors will be thrown for violations
PRAGMA foreign_keys=ON;

BEGIN TRANSACTION;

--create your tables with SQL commands here (watch out for slight syntactical differences with SQLite)

CREATE TABLE IF NOT EXISTS testUsers (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_name TEXT NOT NULL,
    user_password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS shoppingRecord(
    shopping_id INTEGER PRIMARY KEY AUTOINCREMENT,
    shopping_item TEXT NOT NULL, 
    shopping_quantity INTEGER
);

CREATE TABLE IF NOT EXISTS recipePage(
    recipe_id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipe_title TEXT NOT NULL,
    recipe_ingridients TEXT NOT NULL,
    recipe_instructions TEXT NOT NULL,
    recipe_dateCreated DATETIME
);    

CREATE TABLE IF NOT EXISTS modifiedRecipe(
    modifiedRecipe_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    recipe_id INTEGER,
    modifiedRecipe_title TEXT NOT NULL,
    modifiedRecipe_ingridients TEXT NOT NULL,
    modifiedRecipe_instructions TEXT NOT NULL,
    modifiedRecipe_dateModified DATETIME
);

CREATE TABLE IF NOT EXISTS favouriteRecipe(
    favouriteRecipe_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    recipe_id INTEGER
);

--insert data here

 


COMMIT;

