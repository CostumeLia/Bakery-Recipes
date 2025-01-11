document.addEventListener('DOMContentLoaded', () => {
    // Function to get URL parameters (from https://www.sitepoint.com/get-url-parameters-with-javascript/)
      const getParameterByName = (name, url = window.location.href) => {
      name = name.replace(/[\[\]]/g, '\\$&');
      const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
          results = regex.exec(url);
      if (!results) return null;
      if (!results[2]) return '';
      return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }
    
      // Get the recipe title from the URL
      const recipeTitle = getParameterByName('title');
      
       // Retrieve all recipes from local storage
       const fetchRecipes = async () => {
          try{
              const response = await fetch('http://localhost:3000/recipes');
               if (!response.ok) {
                  const errorMessage = await response.json();
                   throw new Error(errorMessage.message);
               }
              const recipes = await response.json();
              console.log("Retrieved recipes:", recipes);
              return recipes;
          }
          catch (error) {
              console.error('Error fetching recipes:', error);
               alert(`Error fetching recipes: ${error.message}`);
               return [];
          }
      }
      
       fetchRecipes().then(recipes => {
            //find the matching recipe
      const recipe = recipes.find(recipe => recipe.title === recipeTitle);
      
       if (recipe) {
        // Populate HTML elements with the recipe details
          document.getElementById('recipe_title').textContent = recipe.title;
          document.getElementById('author_name').textContent = `By ${recipe.author}`;
           document.getElementById('category_name').textContent = `Category: ${recipe.category}`;
          document.getElementById('recipe_image').src = recipe.imageUrl; //Note: images will only be able to be displayed if stored as a URL in the local storage.
          document.getElementById('description').textContent = recipe.description;
        
        //populate ingredients list
        const ingredientList = document.getElementById('ingredient_list')
       recipe.ingredients ?  recipe.ingredients.split('\n').forEach(ingredient => {
            const listItem = document.createElement('li');
            listItem.textContent = ingredient;
            ingredientList.appendChild(listItem);
        }) : null;
  
  
         //populate the directions list
         const directionList = document.getElementById('direction_list')
        recipe.instructions ? recipe.instructions.split('\n').forEach(step => {
             const listItem = document.createElement('li');
             listItem.textContent = step;
             directionList.appendChild(listItem);
         }) : null;
      }
      else {
          document.getElementById('intro').innerHTML = "<h2>Recipe not found</h2>"
          console.log("Recipe not found")
      }
      })
    
  });