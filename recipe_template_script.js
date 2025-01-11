document.addEventListener('DOMContentLoaded', () => {
    const getParameterByName = (name, url = window.location.href) => {
      name = name.replace(/[\[\]]/g, '\\$&');
      const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
      const results = regex.exec(url);
      if (!results) return null;
      if (!results[2]) return '';
      return decodeURIComponent(results[2].replace(/\+/g, ' '));
    };
  
    const recipeTitle = getParameterByName('title');
  
    const fetchAndDisplayRecipe = async () => {
      try {
        const response = await fetch('http://localhost:3000/recipes');
        if (!response.ok) {
          const errorMessage = await response.json();
          throw new Error(errorMessage.message);
        }
        const recipes = await response.json();
        const recipe = recipes.find(recipe => recipe.title === recipeTitle);
  
        if (recipe) {
          document.getElementById('recipe_title').textContent = recipe.title;
          document.getElementById('author_name').textContent = `By ${recipe.author}`;
          document.getElementById('category_name').textContent = `Category: ${recipe.category}`;
          document.getElementById('recipe_image').src = recipe.imageUrl || '/img/recipe_placeholder.jfif';
          document.getElementById('description').textContent = recipe.description;
  
          const ingredientList = document.getElementById('ingredient_list');
          if (recipe.ingredients) {
             recipe.ingredients.split('\n').forEach(ingredient => {
                  const listItem = document.createElement('li');
                 listItem.textContent = ingredient.trim();
                  ingredientList.appendChild(listItem);
              });
          }
          const directionList = document.getElementById('direction_list');
          if(recipe.instructions){
               recipe.instructions.split('\n').forEach(step => {
                  const listItem = document.createElement('li');
                  listItem.textContent = step.trim();
                  directionList.appendChild(listItem);
               });
           }
        } else {
          document.getElementById('intro').innerHTML = "<h2>Recipe not found</h2>";
          console.error("Recipe not found");
        }
      } catch (error) {
        console.error('Error fetching recipes:', error);
        alert(`Error fetching recipes: ${error.message}`);
      }
    };
  
    fetchAndDisplayRecipe();
  });