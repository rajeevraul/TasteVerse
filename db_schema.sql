
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
    modifiedRecipe_instructions TEXT NOT NULL,
);

CREATE TABLE IF NOT EXISTS favouriteRecipe(
    favouriteRecipe_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    recipe_id INTEGER
);

CREATE TABLE IF NOT EXISTS calendar(
    meal_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    date TEXT NOT NULL,
    breakfast TEXT NOT NULL,
    breakfast_calories INTEGER NOT NULL,
    lunch TEXT NOT NULL,
    lunch_calories INTEGER NOT NULL,
    dinner TEXT NOT NULL,
    dinner_calories INTEGER NOT NULL,
    total_calories INTEGER NOT NULL 
);

--insert data here
INSERT INTO recipePage(recipe_title, recipe_ingridients, recipe_instructions) VALUES ('chicken rice', '1 rice, 1 chicken, 1 salt', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc posuere at neque aliquet tristique. Suspendisse sed fringilla orci. Nullam eros est, ultrices sit amet tincidunt eget, dapibus in dolor. Pellentesque cursus leo et nibh faucibus ornare. Etiam tempus dictum tortor, pharetra tincidunt mauris consectetur at. Suspendisse eget nisl viverra nisl aliquam blandit. Aenean a tellus vitae odio iaculis porttitor. Nunc feugiat in felis at pretium. Donec malesuada lorem at magna volutpat, in ullamcorper sapien ultrices. Nulla id posuere est, sed mattis tellus. Nullam vestibulum nibh et justo accumsan, et convallis lacus bibendum.'), 
                                                                                             ('ice milo', '1 ice, 1 water, 1 milo', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc posuere at neque aliquet tristique. Suspendisse sed fringilla orci. Nullam eros est, ultrices sit amet tincidunt eget, dapibus in dolor. Pellentesque cursus leo et nibh faucibus ornare. Etiam tempus dictum tortor, pharetra tincidunt mauris consectetur at. Suspendisse eget nisl viverra nisl aliquam blandit. Aenean a tellus vitae odio iaculis porttitor. Nunc feugiat in felis at pretium. Donec malesuada lorem at magna volutpat, in ullamcorper sapien ultrices. Nulla id posuere est, sed mattis tellus. Nullam vestibulum nibh et justo accumsan, et convallis lacus bibendum.'), 
                                                                                             ('steak', '1 meat, 1 pepper, 1 salt', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc posuere at neque aliquet tristique. Suspendisse sed fringilla orci. Nullam eros est, ultrices sit amet tincidunt eget, dapibus in dolor. Pellentesque cursus leo et nibh faucibus ornare. Etiam tempus dictum tortor, pharetra tincidunt mauris consectetur at. Suspendisse eget nisl viverra nisl aliquam blandit. Aenean a tellus vitae odio iaculis porttitor. Nunc feugiat in felis at pretium. Donec malesuada lorem at magna volutpat, in ullamcorper sapien ultrices. Nulla id posuere est, sed mattis tellus. Nullam vestibulum nibh et justo accumsan, et convallis lacus bibendum.'), 
                                                                                             (' ice water', '1 ice, 1 water', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc posuere at neque aliquet tristique. Suspendisse sed fringilla orci. Nullam eros est, ultrices sit amet tincidunt eget, dapibus in dolor. Pellentesque cursus leo et nibh faucibus ornare. Etiam tempus dictum tortor, pharetra tincidunt mauris consectetur at. Suspendisse eget nisl viverra nisl aliquam blandit. Aenean a tellus vitae odio iaculis porttitor. Nunc feugiat in felis at pretium. Donec malesuada lorem at magna volutpat, in ullamcorper sapien ultrices. Nulla id posuere est, sed mattis tellus. Nullam vestibulum nibh et justo accumsan, et convallis lacus bibendum.'), 
                                                                                             ('scrambled egg', '1 egg, 1 oil, 1 salt, 1 pepper', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc posuere at neque aliquet tristique. Suspendisse sed fringilla orci. Nullam eros est, ultrices sit amet tincidunt eget, dapibus in dolor. Pellentesque cursus leo et nibh faucibus ornare. Etiam tempus dictum tortor, pharetra tincidunt mauris consectetur at. Suspendisse eget nisl viverra nisl aliquam blandit. Aenean a tellus vitae odio iaculis porttitor. Nunc feugiat in felis at pretium. Donec malesuada lorem at magna volutpat, in ullamcorper sapien ultrices. Nulla id posuere est, sed mattis tellus. Nullam vestibulum nibh et justo accumsan, et convallis lacus bibendum.'), 
                                                                                             ('ramen', '1 noodle, 1 soyu, 1 water', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc posuere at neque aliquet tristique. Suspendisse sed fringilla orci. Nullam eros est, ultrices sit amet tincidunt eget, dapibus in dolor. Pellentesque cursus leo et nibh faucibus ornare. Etiam tempus dictum tortor, pharetra tincidunt mauris consectetur at. Suspendisse eget nisl viverra nisl aliquam blandit. Aenean a tellus vitae odio iaculis porttitor. Nunc feugiat in felis at pretium. Donec malesuada lorem at magna volutpat, in ullamcorper sapien ultrices. Nulla id posuere est, sed mattis tellus. Nullam vestibulum nibh et justo accumsan, et convallis lacus bibendum.'), 
                                                                                             ('miso soup', '1 water, 1 seaweed, 1 miso paste', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc posuere at neque aliquet tristique. Suspendisse sed fringilla orci. Nullam eros est, ultrices sit amet tincidunt eget, dapibus in dolor. Pellentesque cursus leo et nibh faucibus ornare. Etiam tempus dictum tortor, pharetra tincidunt mauris consectetur at. Suspendisse eget nisl viverra nisl aliquam blandit. Aenean a tellus vitae odio iaculis porttitor. Nunc feugiat in felis at pretium. Donec malesuada lorem at magna volutpat, in ullamcorper sapien ultrices. Nulla id posuere est, sed mattis tellus. Nullam vestibulum nibh et justo accumsan, et convallis lacus bibendum.');

INSERT INTO users(user_name, user_password) VALUES ('a', 'abc');
 


COMMIT;

