document.addEventListener('DOMContentLoaded', () => {
    const recipeForm = document.getElementById('recipeForm');
    const recipeContainer = document.getElementById('recipeContainer');
    const searchBar = document.getElementById('search_bar');
    const categoryLists = {
        'Appetizer': document.getElementById('appetizer_recipes_list'),
        'Entree': document.getElementById('entree_recipes_list'),
        'Side': document.getElementById('side_recipes_list'),
        'Dessert': document.getElementById('dessert_recipes_list'),
        'Drink': document.getElementById('drink_recipes_list'),
        'Snack': document.getElementById('snack_recipes_list'),
    };

    let allRecipes = [];

    // Helper function to get URL parameters
    const getParameterByName = (name, url = window.location.href) => {
        name = name.replace(/[\[\]]/g, '\\$&');
        const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
        const results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    };

    const populateFormFromUrl = () => {
        const params = ['id', 'title', 'author', 'category', 'description', 'ingredients', 'steps', 'imageUrl'];
        const values = params.reduce((acc, param) => {
            acc[param] = getParameterByName(param);
            return acc;
        }, {});

        const imagePreview = document.createElement('img');
        imagePreview.id = 'imagePreview';
        imagePreview.style.maxWidth = '200px';
        const imageContainer = document.getElementById('recipeImage').parentNode;

        if (values.imageUrl) {
            imagePreview.src = values.imageUrl;
            imageContainer.insertBefore(imagePreview, document.getElementById('recipeImage'));
        }

        ['title', 'author', 'category', 'description', 'ingredients', 'steps'].forEach(key => {
            if (values[key]) {
                document.getElementById(`recipe_${key.replace('recipe','')}`).value = values[key];
            }
        });

        if (values.id) {
            recipeForm.dataset.id = values.id;
        }
    };

    const displayImagePreview = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                let imagePreview = document.getElementById('imagePreview');
                if (imagePreview) {
                    imagePreview.src = e.target.result;
                } else {
                    imagePreview = document.createElement('img');
                    imagePreview.id = 'imagePreview';
                    imagePreview.style.maxWidth = '200px';
                    imagePreview.src = e.target.result;
                    const imageContainer = document.getElementById('recipeImage').parentNode;
                    imageContainer.insertBefore(imagePreview, document.getElementById('recipeImage'));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const imageInput = document.getElementById('recipeImage');
    if (imageInput) {
        imageInput.addEventListener('change', displayImagePreview);
    }

    if (recipeForm) {
        populateFormFromUrl();

        recipeForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(recipeForm);
            const recipeId = recipeForm.dataset.id;

            if (recipeId) {
                formData.append('id', recipeId);
            }

            try {
                const response = await fetch('http://localhost:3000/recipes', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    const responseData = await response.json();
                    throw new Error(responseData.message);
                }

                const responseData = await response.json();
                const recipe = responseData.recipe;
                displayRecipe(recipe, recipeContainer);
                fetchAndDisplayRecipes();
                window.location.href = recipeId ? 'admin.html' : 'All_recipes.html';

            } catch (error) {
                console.error('Error creating recipe:', error);
                alert(`Error creating recipe: ${error.message}`);
            }
        });
    }

    function displayRecipe(recipe, container) {
        if (!recipe) {
            console.error("Recipe data is undefined in displayRecipe");
            return;
        }
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
                    ${recipe.ingredients ? recipe.ingredients.split('\n').map(ingredient => `<li>${ingredient}</li>`).join('') : ''}
                </ul>
            </div>
            <div id="steps">
                <h5>Directions</h5>
                <ol>
                    ${recipe.instructions ? recipe.instructions.split('\n').map(step => `<li>${step}</li>`).join('') : ''}
                </ol>
            </div>
        `;

        container.appendChild(recipeDiv);
    }

    
    const fetchAndDisplayRecipes = async () => {
        try {
            const response = await fetch('http://localhost:3000/recipes');

            if (!response.ok) {
                const errorMessage = await response.json();
                throw new Error(errorMessage.message);
            }

            allRecipes = await response.json();
            displayRecipes(allRecipes);

        } catch (error) {
            console.error('Error fetching recipes:', error);
            alert(`Error fetching recipes: ${error.message}`);
        }
    };

    const displayRecipes = (recipes) => {
        for (const key in categoryLists) {
            if (categoryLists.hasOwnProperty(key) && categoryLists[key]) {
                categoryLists[key].innerHTML = '';
            }
        }

        recipes.forEach(recipe => {
            const categoryList = categoryLists[recipe.category];
            if (categoryList) {
                const listItem = document.createElement('li');
                const link = document.createElement('a');
                link.href = `recipe_template.html?title=${encodeURIComponent(recipe.title)}`;
                link.target = "_blank";
                link.textContent = recipe.title
                listItem.appendChild(link);
                categoryList.appendChild(listItem);
            }
        });
    };

    const filterRecipes = (searchTerm) => {
        if (!searchTerm) {
            displayRecipes(allRecipes);
            return;
        }
        const lowerSearchTerm = searchTerm.toLowerCase();

        const filtered = allRecipes.filter(recipe =>
                Object.values(recipe).some(value => typeof value === 'string' && value.toLowerCase().includes(lowerSearchTerm))
            );
         displayRecipes(filtered);
    };

    if (searchBar) {
        searchBar.addEventListener('input', (event) => {
            filterRecipes(event.target.value);
        });
    }

    const addRecipeToPage = (recipe) => {
        if (!recipe) {
            console.error("Recipe data is undefined in addRecipeToPage");
            return;
        }
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
                     ${recipe.ingredients ? recipe.ingredients.split('\n').map(ingredient => `<li>${ingredient}</li>`).join('') : ''}
                  </ul>
              </div>
    
              <div id="steps">
                  <h5>Directions</h5>
                  <ol>
                       ${recipe.instructions ? recipe.instructions.split('\n').map(step => `<li>${step}</li>`).join('') : ''}
                  </ol>
              </div>
          `;

        recipeContainer.appendChild(recipeDiv);
    };

    if (document.getElementById('appetizer_recipes_list') || document.getElementById('entree_recipes_list') || document.getElementById('side_recipes_list') || document.getElementById('dessert_recipes_list') || document.getElementById('drink_recipes_list') || document.getElementById('snack_recipes_list')) {
        fetchAndDisplayRecipes();
    }
});