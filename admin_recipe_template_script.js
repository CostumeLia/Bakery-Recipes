document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const recipeId = urlParams.get('id');

    const recipeTitle = document.getElementById('recipe_title');
    const authorName = document.getElementById('author_name');
    const categoryName = document.getElementById('category_name');
    const recipeImage = document.getElementById('recipe_image');
    const description = document.getElementById('description');
    const ingredientList = document.getElementById('ingredient_list');
    const directionList = document.getElementById('direction_list');

    const publishButton = createButton("Publish", () => publishRecipe(recipeId));
    const editButton = createButton("Edit", () => fetchAndEditRecipe());
    const rejectButton = createButton("Reject", () => rejectRecipe(recipeId));


    const fetchAndDisplayRecipe = async () => {
        try {
            const response = await fetch(`http://localhost:3000/admin/recipes`);
             if (!response.ok) {
                 const errorMessage = await response.json();
                 throw new Error(errorMessage.message);
            }
            const recipes = await response.json();
            const recipe = recipes.find(r => r.id === parseInt(recipeId));

            if (!recipe) {
                throw new Error('Recipe not found');
            }

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


            const main = document.querySelector('main');
            main.append(publishButton, editButton, rejectButton);


        } catch (error) {
            console.error('Error fetching recipe:', error);
            alert(`Error fetching recipe: ${error.message}`);
        }
    };
   const fetchAndEditRecipe = async () => {
    try {
            const response = await fetch(`http://localhost:3000/admin/recipes`);
             if (!response.ok) {
                 const errorMessage = await response.json();
                 throw new Error(errorMessage.message);
            }
            const recipes = await response.json();
            const recipe = recipes.find(r => r.id === parseInt(recipeId));
           if (!recipe) {
                throw new Error('Recipe not found');
           }
              editRecipe(recipe);

        } catch (error) {
             console.error('Error fetching recipe:', error);
             alert(`Error fetching recipe: ${error.message}`);
        }
   }

    const editRecipe = (recipe) => {
        const params = new URLSearchParams({
            id: recipe.id,
            title: recipe.title,
            author: recipe.author,
            category: recipe.category,
            description: recipe.description,
            ingredients: recipe.ingredients,
            steps: recipe.instructions,
            imageUrl: recipe.imageUrl
        });

        window.location.href = `submit.html?${params.toString()}`;
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
     function createButton(text, onClick) {
        const button = document.createElement('button');
        button.textContent = text;
        button.addEventListener('click', onClick);
         return button;
    }
    fetchAndDisplayRecipe();
});