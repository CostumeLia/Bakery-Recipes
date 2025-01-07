document.addEventListener('DOMContentLoaded', () => {
    const recipeForm = document.getElementById('recipeForm');
    const recipeContainer = document.getElementById('recipeContainer');

    if (recipeForm) {
        recipeForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(recipeForm);
           
            for (let [key, value] of formData.entries()) {
                console.log(key, value); //Log form data before sending
            }
            
            try {
                const response = await fetch('http://localhost:3000/recipes', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    const errorMessage = await response.json();
                    throw new Error(errorMessage.message);
                }

                const responseData = await response.json();
                console.log("Response data:", responseData)
                const recipe = responseData.recipe
              
                displayRecipe(recipe, recipeContainer);
                
                fetchAndDisplayRecipes();

            } catch (error) {
                console.error('Error creating recipe:', error);
                alert(`Error creating recipe: ${error.message}`);
            }
        });
    }

    function displayRecipe(recipe, container) {
        const recipeDiv = document.createElement('div');
        recipeDiv.classList.add('recipe');
        recipeDiv.innerHTML = `
            <div id="intro">
                <h3>${recipe.title}</h3>
                <h4>${recipe.author}</h4>
                <p>${recipe.category}</p>
                <img src="${recipe.imageUrl ? recipe.imageUrl : '/img/recipe_placeholder.jfif'}" alt="Image of Recipe" style="max-width: 200px"/>
                <p id="description">${recipe.description}</p>
            </div>
           <div id="ingredients">
                <h5>Ingredients</h5>
                <ul>
                    ${recipe.ingredients.split('\n').map(ingredient => `<li>${ingredient}</li>`).join('')}
                </ul>
            </div>
            <div id="steps">
                <h5>Directions</h5>
                <ol>
                    ${recipe.instructions.split('\n').map(step => `<li>${step}</li>`).join('')}
                </ol>
            </div>
        `;

        container.appendChild(recipeDiv);
    }

    const categoryLists = {
        'Appetizer': document.getElementById('appetizer_recipes_list'),
        'Entree': document.getElementById('entree_recipes_list'),
        'Side': document.getElementById('side_recipes_list'),
        'Dessert': document.getElementById('dessert_recipes_list'),
        'Drink': document.getElementById('drink_recipes_list'),
        'Snack': document.getElementById('snack_recipes_list'),
    };

    const fetchAndDisplayRecipes = async () => {
        try {
            const response = await fetch('http://localhost:3000/recipes');

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
                    link.href = `#${recipe.title.replace(/ /g, '_')}`;
                    link.textContent = recipe.title;
                    listItem.appendChild(link);
                    categoryList.appendChild(listItem);
                    addRecipeToPage(recipe);
                }
            });

        } catch (error) {
            console.error('Error fetching recipes:', error);
            alert(`Error fetching recipes: ${error.message}`);
        }
    };

    const addRecipeToPage = (recipe) => {
        const recipeContainer = document.querySelector('main');
        const recipeDiv = document.createElement('div');
        recipeDiv.classList.add('recipe');
        recipeDiv.id = `${recipe.title.replace(/ /g, '_')}`;
        recipeDiv.innerHTML = `
             <div id="intro">
                  <h3>${recipe.title}</h3>
                  <h4>${recipe.author}</h4>
                  <p>${recipe.category}</p>
                  <img src="${recipe.imageUrl ? recipe.imageUrl : '/img/recipe_placeholder.jfif'}" alt="Image of Recipe" style="max-width: 200px"/>
                  <p id="description">${recipe.description}</p>
              </div>
    
              <div id="ingredients">
                  <h5>Ingredients</h5>
                  <ul>
                      ${recipe.ingredients.split('\n').map(ingredient => `<li>${ingredient}</li>`).join('')}
                  </ul>
              </div>
    
              <div id="steps">
                  <h5>Directions</h5>
                  <ol>
                       ${recipe.instructions.split('\n').map(step => `<li>${step}</li>`).join('')}
                  </ol>
              </div>
          `;
    
           recipeContainer.appendChild(recipeDiv);
    };
     if (document.getElementById('appetizer_recipes_list') || document.getElementById('entree_recipes_list') || document.getElementById('side_recipes_list') || document.getElementById('dessert_recipes_list') || document.getElementById('drink_recipes_list') || document.getElementById('snack_recipes_list')) {
         fetchAndDisplayRecipes();
      }
});