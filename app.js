const express = require('express');
const Sequelize = require('sequelize');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'Recipes_table.db'
});

const Recipe = sequelize.define('Recipe', {
    recipe_name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    username: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    category: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    imageUrl: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    ingredients: {
        type: Sequelize.TEXT,
        allowNull: false,
    },
    directions: {
        type: Sequelize.TEXT,
        allowNull: false,
    },
}, {
    tableName: 'Recipes'
});

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection to the database successful!');
        await sequelize.sync({ alter: true });
        console.log('Database and table synced successfully');

        const allRecipes = await Recipe.findAll();
        console.log('Retrieved Recipes:', allRecipes.map(recipe => recipe.toJSON()));
    } catch (error) {
        console.error('Error connecting to or using the database: ', error);
    }
})();


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });

app.get('/recipes', async (req, res) => {
    try {
        const recipes = await Recipe.findAll();
        res.status(200).json(recipes.map(recipe => ({
            title: recipe.recipe_name,
            author: recipe.username,
            category: recipe.category,
            description: recipe.description,
            ingredients: recipe.ingredients,
            instructions: recipe.directions,
            imageUrl: recipe.imageUrl
        })));
    } catch (error) {
        console.error('Error fetching recipes:', error);
        res.status(500).json({ message: 'Error fetching recipes', error: error.message });
    }
});

app.post('/recipes', upload.single('recipeImage'), async (req, res) => {
    try {
        console.log('Received POST request to /recipes', req.body);
        const { title, author, category, description, ingredients, steps } = req.body;

        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
       

        const newRecipe = await Recipe.create({
            recipe_name: title,
            username: author,
            category: category,
            description: description,
            ingredients: ingredients,
            directions: steps,
            imageUrl: imageUrl
        });
       console.log("Created Recipe", newRecipe.toJSON())
       res.status(201).json({ message: 'Recipe created successfully', recipe: {
        title: newRecipe.recipe_name,
        author: newRecipe.username,
        category: newRecipe.category,
        description: newRecipe.description,
        ingredients: newRecipe.ingredients,
        instructions: newRecipe.directions,
        imageUrl: newRecipe.imageUrl
    } });
    } catch (error) {
        console.error('Error creating recipe: ', error);
        res.status(500).json({ message: 'Error creating recipe', error: error.message, details: error.toString()});
    }
});

app.use('/uploads', express.static('uploads'));

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});