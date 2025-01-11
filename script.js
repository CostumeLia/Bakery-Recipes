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

    let allRecipes = []; // Store all fetched recipes

     // Function to get URL parameters (from https://www.sitepoint.com/get-url-parameters-with-javascript/)
      const getParameterByName = (name, url = window.location.href) => {
          name = name.replace(/[\[\]]/g, '\\$&');
          const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
              results = regex.exec(url);
          if (!results) return null;
          if (!results[2]) return '';
          return decodeURIComponent(results[2].replace(/\+/g, ' '));
      }

      const populateFormFromUrl = () => {
          const id = getParameterByName('id');
          const title = getParameterByName('title');
          const author = getParameterByName('author');
          const category = getParameterByName('category');
          const description = getParameterByName('description');
          const ingredients = getParameterByName('ingredients');
          const steps = getParameterByName('steps');
          let imageUrl = getParameterByName('imageUrl'); // This has to be a url, not a file.
           
           const imagePreview = document.createElement('img');
           imagePreview.id = 'imagePreview'
           imagePreview.style.maxWidth = '200px'
           const imageContainer = document.getElementById('recipeImage').parentNode; // Get the parent of the file upload.
           

           if(imageUrl) {
               imagePreview.src = imageUrl
                imageContainer.insertBefore(imagePreview, document.getElementById('recipeImage')) // Insert before file upload field.
           }


          if (title) document.getElementById('recipe_name').value = title;
          if (author) document.getElementById('your_name').value = author;
          if (category) document.getElementById('category').value = category;
          if (description) document.getElementById('recipe_description').value = description;
          if (ingredients) document.getElementById('ingredients').value = ingredients;
          if (steps) document.getElementById('directions').value = steps;
          //Store the ID in a data attribute so we can retrieve it later.
          if(id) {
           recipeForm.dataset.id = id
        }
          console.log("Form Populated")
      };
    
        // Function to display a preview of the image before submission
       const displayImagePreview = (event) => {
           const file = event.target.files[0];
           if (file) {
               const reader = new FileReader();
               reader.onload = (e) => {
                   let imagePreview = document.getElementById('imagePreview')
                    if (imagePreview){
                        imagePreview.src = e.target.result;
                        console.log("Image Updated")
                   }
                   else{
                    imagePreview = document.createElement('img');
                   imagePreview.id = 'imagePreview'
                   imagePreview.style.maxWidth = '200px'
                       imagePreview.src = e.target.result;
                     const imageContainer = document.getElementById('recipeImage').parentNode
                    imageContainer.insertBefore(imagePreview, document.getElementById('recipeImage')) // Insert before file upload field.
                        console.log("Image Added")
                    }
               };
                reader.readAsDataURL(file);
          }
        };

        const imageInput = document.getElementById('recipeImage');
        if(imageInput) {
            imageInput.addEventListener('change', displayImagePreview);
        }


    if (recipeForm) {
        populateFormFromUrl(); // Populate form when loaded.

        recipeForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(recipeForm);
            const recipeId = recipeForm.dataset.id;
            
            if (recipeId) {
                 formData.append('id', recipeId)
             }
            for (let [key, value] of formData.entries()) {
                console.log(key, value); //Log form data before sending
            }

            try {
                const response = await fetch('http://localhost:3000/recipes', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                   const responseData = await response.json()
                    throw new Error(responseData.message);
                }

                const responseData = await response.json();
                console.log("Response data:", responseData)
                const recipe = responseData.recipe
              
                displayRecipe(recipe, recipeContainer);
                fetchAndDisplayRecipes();
                // Moved the redirect here, after successful fetch.
                if(recipeId) {
                   window.location.href = 'admin.html';
                }
                else {
                   window.location.href = 'All_recipes.html';
                }

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
                <h3>${convertNumbersToSpan(recipe.title)}</h3>
                <h4>${recipe.author}</h4>
                <p>${recipe.category}</p>
                <img src="${recipe.imageUrl ? recipe.imageUrl : '/img/recipe_placeholder.jfif'}" alt="Image of Recipe" style="max-width: 200px"/>
                <p id="description">${recipe.description}</p>
            </div>
           <div id="ingredients">
                <h5>Ingredients</h5>
                <ul>
                    ${recipe.ingredients ? recipe.ingredients.split('\n').map(ingredient => `<li>${convertNumbersToSpan(ingredient)}</li>`).join('') : ''}
                </ul>
            </div>
            <div id="steps">
                <h5>Directions</h5>
                <ol>
                    ${recipe.instructions ? recipe.instructions.split('\n').map(step => `<li>${convertNumbersToSpan(step)}</li>`).join('') : ''}
                </ol>
            </div>
        `;

        container.appendChild(recipeDiv);
    }
    function convertNumbersToSpan(text) {
       if (!text) {
           return text;
       }
       
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = text;
    
        const walker = document.createTreeWalker(tempDiv, NodeFilter.SHOW_TEXT, null, false);
    
        let node;
        while (node = walker.nextNode()) {
           let newHTML = node.textContent.replace(/(\d+)/g, '<span>$1</span>')
           node.parentElement.innerHTML = newHTML
       }
       return tempDiv.innerHTML;
    }
   


    const fetchAndDisplayRecipes = async () => {
        try {
            const response = await fetch('http://localhost:3000/recipes');

            if (!response.ok) {
                const errorMessage = await response.json();
                throw new Error(errorMessage.message);
            }
             
            allRecipes = await response.json();
           

            displayRecipes(allRecipes)

        } catch (error) {
            console.error('Error fetching recipes:', error);
            alert(`Error fetching recipes: ${error.message}`);
        }
    };

   const displayRecipes = (recipes) => {
    // Clear existing lists
        for (const key in categoryLists) {
            if (categoryLists.hasOwnProperty(key) && categoryLists[key]) { //check if the categoryList exists
             categoryLists[key].innerHTML = '';
            }
        }
        
        recipes.forEach(recipe => {
        const categoryList = categoryLists[recipe.category];
            if (categoryList) {
                const listItem = document.createElement('li');
                const link = document.createElement('a');
                link.href = `recipe_template.html?title=${encodeURIComponent(recipe.title)}`;
                    link.target = "_blank"
                 link.innerHTML = convertNumbersToSpan(recipe.title); //use innerHTML
                listItem.appendChild(link);
                categoryList.appendChild(listItem);
            }
        });
    }

     const filterRecipes = (searchTerm) => {
        if (!searchTerm) {
            displayRecipes(allRecipes); // Show all if search is empty
            return;
        }
        const lowerSearchTerm = searchTerm.toLowerCase();

        const filtered = allRecipes.filter(recipe => {
                return (
                    recipe.title.toLowerCase().includes(lowerSearchTerm) ||
                    recipe.author.toLowerCase().includes(lowerSearchTerm) ||
                    recipe.description.toLowerCase().includes(lowerSearchTerm) ||
                    recipe.ingredients.toLowerCase().includes(lowerSearchTerm)
                    )
        });
        displayRecipes(filtered);
     };

      if (searchBar){
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
                  <h3>${convertNumbersToSpan(recipe.title)}</h3>
                  <h4>${recipe.author}</h4>
                  <p>${recipe.category}</p>
                  <img src="${recipe.imageUrl ? recipe.imageUrl : '/img/recipe_placeholder.jfif'}" alt="Image of Recipe" style="max-width: 200px"/>
                  <p id="description">${recipe.description}</p>
              </div>
    
              <div id="ingredients">
                  <h5>Ingredients</h5>
                   <ul>
                     ${recipe.ingredients ? recipe.ingredients.split('\n').map(ingredient => `<li>${convertNumbersToSpan(ingredient)}</li>`).join('') : ''}
                  </ul>
              </div>
    
              <div id="steps">
                  <h5>Directions</h5>
                  <ol>
                       ${recipe.instructions ? recipe.instructions.split('\n').map(step => `<li>${convertNumbersToSpan(step)}</li>`).join('') : ''}
                  </ol>
              </div>
          `;
    
           recipeContainer.appendChild(recipeDiv);
        };
         if (document.getElementById('appetizer_recipes_list') || document.getElementById('entree_recipes_list') || document.getElementById('side_recipes_list') || document.getElementById('dessert_recipes_list') || document.getElementById('drink_recipes_list') || document.getElementById('snack_recipes_list')) {
             fetchAndDisplayRecipes();
          }
});