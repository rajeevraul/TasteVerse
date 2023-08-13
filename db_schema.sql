
-- This makes sure that foreign_key constraints are observed and that errors will be thrown for violations
PRAGMA foreign_keys=ON;

BEGIN TRANSACTION;

--create your tables with SQL commands here (watch out for slight syntactical differences with SQLite)

CREATE TABLE IF NOT EXISTS testUsers (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS shoppingRecord(
    shopping_id INTEGER PRIMARY KEY AUTOINCREMENT,
    shopping_item TEXT NOT NULL, 
    shopping_quantity INTEGER
);

--insert data here
 


COMMIT;

