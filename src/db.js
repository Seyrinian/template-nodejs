const sqlite3 = require('sqlite3');

const db = new sqlite3.Database('db/database.sqlite', (err) => {
    if (err) {
        throw err.message;
    }
});

module.exports = { db };
