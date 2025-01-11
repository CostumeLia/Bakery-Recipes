document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const recipeId = urlParams.get('id');

    const recipeTitle = document.getElementById('recipe_title');
    const authorName = document.getElementById('author_name');
    const categoryName = document.getElementById('category_name');
    const recipeImage = document.getElementById('recipe_image');
    const description = document.getElementById('description')
    const ingredientList = document.getElementById('ingredient_list');
    const directionList = document.getElementById('direction_list');

    const publishButton = document.createElement('button');
    publishButton.textContent = "Publish";
    const editButton = document.createElement('button'); // Create the edit button.
    editButton.textContent = "Edit";
    const rejectButton = document.createElement('button');
    rejectButton.textContent = "Reject";

    const fetchAndDisplayRecipe = async () => {
        try {
            const response = await fetch(`http://localhost:3000/admin/recipes`); // Fetch the recipe data
            if (!response.ok) {
                const errorMessage = await response.json();
                throw new Error(errorMessage.message);
            }
             const recipes = await response.json();
              const recipe = recipes.find(r => r.id === parseInt(recipeId))
            if (!recipe) {
                throw new Error('Recipe not found');
            }
            console.log("Retrieved recipe:", recipe)
            recipeTitle.textContent = recipe.title;
            authorName.textContent = `By: ${recipe.author}`;
            categoryName.textContent = `Category: ${recipe.category}`;
            description.textContent = recipe.description;
            recipeImage.src = recipe.imageUrl || "/img/recipe_placeholder.jfif";

            const ingredients = recipe.ingredients.split('\n').filter(ingredient => ingredient.trim() !== '');
            ingredients.forEach(ingredient => {
                const listItem = document.createElement('li');
                listItem.textContent = ingredient.trim();
                ingredientList.appendChild(listItem);
            });

            const directions = recipe.instructions.split('\n').filter(step => step.trim() !== '');
            directions.forEach(step => {
                const listItem = document.createElement('li');
                listItem.textContent = step.trim();
                directionList.appendChild(listItem);
            });

            publishButton.addEventListener('click', () => publishRecipe(recipe.id)); // Add listener to handle publishing.
            editButton.addEventListener('click', () => editRecipe(recipe)); // Added listener for editing
            rejectButton.addEventListener('click', () => rejectRecipe(recipe.id)); // Add listener to handle publishing.

            const main = document.querySelector('main'); // Append the button to your page.
            main.appendChild(publishButton);
            main.appendChild(editButton); // Add the edit button
            main.appendChild(rejectButton);


        } catch (error) {
            console.error('Error fetching recipe:', error);
            alert(`Error fetching recipe: ${error.message}`);
        }
    };
      const editRecipe = (recipe) => {
        // Construct the URL with the recipe data as URL parameters.
          const params = new URLSearchParams({
            id: recipe.id, // Include the recipe ID to identify it during edits.
            title: recipe.title,
            author: recipe.author,
            category: recipe.category,
            description: recipe.description,
            ingredients: recipe.ingredients,
            steps: recipe.instructions,
            imageUrl: recipe.imageUrl // Use absolute path if necessary, check to make sure this works.
        });

       window.location.href = `submit.html?${params.toString()}`; // Redirect to the submit page.
    };
    const publishRecipe = async (recipeId) => {
        try {
            const response = await fetch(`http://localhost:3000/admin/publish/${recipeId}`, {
                method: 'POST'
            });
            if (!response.ok) {
                const errorMessage = await response.json();
                throw new Error(errorMessage.message);
            }
            alert('Recipe Published!');
            window.close();

        } catch (error) {
            console.error('Error publishing recipe:', error);
             alert(`Error publishing recipe: ${error.message}`);
        }
    };
     const rejectRecipe = async (recipeId) => {
        try {
            const response = await fetch(`http://localhost:3000/admin/recipes/${recipeId}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                const errorMessage = await response.json();
                throw new Error(errorMessage.message);
            }
            alert('Recipe Rejected and Deleted!');
            window.close();

        } catch (error) {
             console.error('Error rejecting recipe:', error);
              alert(`Error rejecting recipe: ${error.message}`);
        }
    };
    fetchAndDisplayRecipe();
});