document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const recipeContainer = document.getElementById('recipe-container');
    const loginContainer = document.getElementById('login-container');
    const errorContainer = document.getElementById('error-container');
    const logoutButton = document.createElement('button');
    logoutButton.textContent = "Logout"


    const categoryLists = {
        'Appetizer': document.getElementById('appetizer_recipes_list'),
        'Entree': document.getElementById('entree_recipes_list'),
        'Side': document.getElementById('side_recipes_list'),
        'Dessert': document.getElementById('dessert_recipes_list'),
        'Drink': document.getElementById('drink_recipes_list'),
        'Snack': document.getElementById('snack_recipes_list'),
    };

    const clearRecipeLists = () => {
        for (const category in categoryLists) {
            categoryLists[category].innerHTML = "";
        }
    };

    const fetchAndDisplayRecipes = async () => {
        clearRecipeLists();
        try {
            const response = await fetch('http://localhost:3000/admin/recipes');
            if (!response.ok) {
                const errorMessage = await response.json();
                throw new Error(errorMessage.message);
            }
            const recipes = await response.json();
            console.log("Retrieved recipes:", recipes);

            recipes.forEach(recipe => {
                const categoryList = categoryLists[recipe.category];
                if (categoryList) {
                    const listItem = document.createElement('li');
                    const link = document.createElement('a');
                    link.href = `admin_recipe_template.html?id=${encodeURIComponent(recipe.id)}`;
                    link.target = "_blank";
                    link.textContent = recipe.title;

                    listItem.appendChild(link);
                    categoryList.appendChild(listItem);
                }
            });
        } catch (error) {
            console.error('Error fetching recipes:', error);
            alert(`Error fetching recipes: ${error.message}`);
        }
    };


    // Check for existing login
    if (localStorage.getItem('isLoggedIn') === 'true') {
        loginContainer.style.display = 'none';
        recipeContainer.style.display = 'block';
        errorContainer.style.display = 'none';
        const main = document.querySelector('main'); // Append the button to your page.
        main.appendChild(logoutButton);
        fetchAndDisplayRecipes(); // Fetch data when logged in
    }


    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });
            if (!response.ok) {
                const responseData = await response.json();
                throw new Error(responseData.message);
            }
            localStorage.setItem('isLoggedIn', 'true'); // Save login
            loginContainer.style.display = 'none';
            recipeContainer.style.display = 'block';
            errorContainer.style.display = 'none';
            const main = document.querySelector('main'); // Append the button to your page.
            main.appendChild(logoutButton);
           fetchAndDisplayRecipes(); // Fetch data after logging in
        } catch (error) {
            errorContainer.style.display = 'block';
            errorContainer.textContent = `Login error: ${error.message}`;
            console.error(`Login error: ${error.message}`);
        }
    });

    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('isLoggedIn');
        loginContainer.style.display = 'block';
        recipeContainer.style.display = 'none';
        errorContainer.style.display = 'none';
        logoutButton.remove()
    });
});