const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('db/database.sqlite');

db.serialize().run('DROP TABLE IF EXISTS movies');

db.run(`CREATE TABLE IF NOT EXISTS movies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL, 
  director TEXT NOT NULL, 
  year INTEGER NOT NULL, 
  rating number NOT NULL)`);

db.all('SELECT * FROM movies', [], (err, rows) => {
    if (err) {
        throw err;
    }
    if (rows.length === 0) {
        db.run(
            `INSERT INTO movies (
    title, 
    director, 
    year, 
    rating) 
    VALUES (?, ?, ?, ?)`,
            ['The Dark Knight', 'Christopher Nolan', 2008, 5],
        );
    }
});
