const express = require('express');
const Sequelize = require('sequelize');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 
app.use(express.static(path.join(__dirname, 'Pages')));

// Serve static HTML files
const pages = ['Submit.html', 'All_recipes.html', 'index.html', 'admin.html'];
pages.forEach(page => {
    app.get(`/${page}`, (req, res) => {
        res.sendFile(path.join(__dirname, 'Pages', page));
    });
});

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'Recipes_table.db'
});

const Recipe = sequelize.define('Recipe', {
    title: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    author: {
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
    description: {
        type: Sequelize.TEXT,
        allowNull: false,
    },
    ingredients: {
        type: Sequelize.TEXT,
        allowNull: false,
    },
    steps: {
        type: Sequelize.TEXT,
        allowNull: false,
    },
    published: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
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
        const recipes = await Recipe.findAll({ where: { published: true } });
        res.status(200).json(recipes.map(recipe => ({
            title: recipe.title,
            author: recipe.author,
            category: recipe.category,
            description: recipe.description,
            ingredients: recipe.ingredients,
            instructions: recipe.steps,
            imageUrl: recipe.imageUrl
        })));
    } catch (error) {
        console.error('Error fetching recipes:', error);
        res.status(500).json({ success: false, message: 'Error fetching recipes', error: error.message });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const adminUsername = 'admin';
    const adminPassword = 'password';

    if (username === adminUsername && password === adminPassword) {
        res.status(200).json({ success: true, message: 'Login successful' });
    } else {
        res.status(401).json({ success: false, message: 'Login Failed' });
    }
});

app.get('/admin/recipes', async (req, res) => {
    try {
        const recipes = await Recipe.findAll({ where: { published: false } });
        res.status(200).json(recipes.map(recipe => ({
            id: recipe.id,
            title: recipe.title,
            author: recipe.author,
            category: recipe.category,
            description: recipe.description,
            ingredients: recipe.ingredients,
            instructions: recipe.steps,
            imageUrl: recipe.imageUrl
        })));
    } catch (error) {
        console.error('Error fetching recipes:', error);
        res.status(500).json({ success: false, message: 'Error fetching recipes', error: error.message });
    }
});

app.post('/recipes', upload.single('recipeImage'), async (req, res) => {
    try {
        const { id, title, author, category, description, ingredients, steps } = req.body;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

        if (id) {
            const recipe = await Recipe.findByPk(id);
            if (!recipe) {
                return res.status(404).json({ success: false, message: 'Recipe not found' });
            }
            recipe.title = title;
            recipe.author = author;
            recipe.category = category;
            recipe.description = description;
            recipe.ingredients = ingredients;
            recipe.steps = steps;
            if (imageUrl) {
                recipe.imageUrl = imageUrl;
            }
            await recipe.save();
            res.status(200).json({
                success: true,
                message: 'Recipe updated successfully',
                recipe: {
                    title: recipe.title,
                    author: recipe.author,
                    category: recipe.category,
                    description: recipe.description,
                    ingredients: recipe.ingredients,
                    instructions: recipe.steps,
                    imageUrl: recipe.imageUrl
                }
            });
        } else {
            const newRecipe = await Recipe.create({
                title,
                author,
                category,
                description,
                ingredients,
                steps,
                imageUrl
            });
            res.status(201).json({
                success: true,
                message: 'Recipe created successfully',
                recipe: {
                    title: newRecipe.title,
                    author: newRecipe.author,
                    category: newRecipe.category,
                    description: newRecipe.description,
                    ingredients: newRecipe.ingredients,
                    instructions: newRecipe.steps,
                    imageUrl: newRecipe.imageUrl
                }
            });
        }
    } catch (error) {
        console.error('Error creating or updating recipe: ', error);
        res.status(500).json({ success: false, message: 'Error creating or updating recipe', error: error.message });
    }
});

app.post('/admin/publish/:id', async (req, res) => {
    try {
        const recipeId = req.params.id;
        const recipe = await Recipe.findByPk(recipeId);

        if (!recipe) {
            return res.status(404).json({ success: false, message: 'Recipe not found' });
        }

        recipe.published = true;
        await recipe.save();

        res.status(200).json({ success: true, message: 'Recipe published successfully' });
    } catch (error) {
        console.error('Error publishing recipe:', error);
        res.status(500).json({ success: false, message: 'Error publishing recipe', error: error.message });
    }
});

app.delete('/admin/recipes/:id', async (req, res) => {
    try {
        const recipeId = req.params.id;
        const recipe = await Recipe.findByPk(recipeId);

        if (!recipe) {
            return res.status(404).json({ success: false, message: 'Recipe not found' });
        }
        await recipe.destroy();
        res.status(200).json({ success: true, message: 'Recipe deleted successfully' });

    } catch (error) {
        console.error('Error deleting recipe:', error);
        res.status(500).json({ success: false, message: 'Error deleting recipe', error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});