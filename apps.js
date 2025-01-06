const Sequelize = require('sequelize');
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'Recipes_table.db'
});

const sqlite3 = require('sqlite3');
const db = fetch ('Recipes_table.db');

  (async () => {
    try {
      await sequelize.authenticate();
      console.log('Connection to the database successful!');
    } catch (error) {
      console.error('Error connecting to the database: ', error);
    }
  })();
  
db.all('SELECT * FROM Recipes', (err, rows) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log(rows); // Print the retrieved rows
    }
  });