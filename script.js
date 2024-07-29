document.addEventListener("DOMContentLoaded", () => {
  let recipes;
  let input = document.getElementById("searchBar");
  let searchBtn = document.querySelector(".btn");
  let msgPara = document.querySelector("#resPara");
  let recipesDiv = document.querySelector(".recipes");
  let loading = false;

  // Loading previous searchResults if any
  const savedResults = JSON.parse(sessionStorage.getItem("searchResults"));
  if (savedResults) {
    recipes = savedResults;
    displayRecipes();
  }

  async function fetchData() {
    recipes = [];
    loading = true;
    displayRecipes();
    try {
      let request = await fetch(
        `https://api.edamam.com/api/recipes/v2?type=public&q=${input.value}&app_id=f897c7e5&app_key=aab5f1b3e72ba0fd8a7f56c0d33128cf`
      );
      let response = await request.json();
      if (response) {
        let arr = Array.from(response.hits);
        arr.forEach((e) => {
          recipes.push(e.recipe);
        });
      }
      // Save the recipes to session storage
      sessionStorage.setItem("searchResults", JSON.stringify(recipes));
      // add the recipes to the localstorage
      localStorage.setItem("recipes", JSON.stringify(recipes));
    } catch (error) {
      console.log("Some error occured: ", error);
    } finally {
      loading = false;
      displayRecipes();
    }
  }
  searchBtn.addEventListener("click", () => {
    fetchData();
    const query = searchBar.value.trim();
    if (query && !searchHistory.includes(query)) {
      searchHistory.unshift(query);
      if (searchHistory.length > maxHistory) {
        searchHistory.pop();
      }
      localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
      updateDropdown();
    }
    searchDropDown.style.display = "none";
  });

  function displayRecipes() {
    recipesDiv.innerHTML = "";
    if (loading) {
      recipesDiv.innerHTML = "Loading please wait...";
    } else {
      recipes.forEach((recipe, index) => {
        recipesDiv.innerHTML += ` 
          <div class="recipe">
          <div class="content">
            <div class="info">
              <h4>Recipe</h4>
              <h2>${recipe.label}</h2>
              <p>
                ${recipe.mealType}, Serves: ${
          recipe.yield
        } (Not suitable for home freezing)
               calories: ${Math.floor(recipe.calories)}
              </p>
              <p class="desc">
               Make your meal special with our ${
                 recipe.label
               }, a tasty blend of fresh ingredients, perfectly seasoned to make your taste buds happy
              </p>
              <button class="infoBtn" data-recipe-index="${index}">Read More </button>
            </div>
      
            <div class="img">
              <img
               src = ${recipe.image}
               alt = "altText"
               id="dishImg"
              />
            </div>
          </div>
        </div>`;
      });
    }
  }

  searchBtn.addEventListener("click", async () => {
    const query = input.value;
    if (!query) {
      msgPara.innerText = "Please enter a dish name.";
      return;
    }
    try {
      await fetchData();
      msgPara.innerText = `There are ${recipes.length} result(s) for ${input.value}`;
      displayRecipes();
    } catch (error) {
      msgPara.innerText = "An error occurred while fetching recipes.";
    } finally {
      input.value = "";
    }
  });

  // event delegation
  recipesDiv.addEventListener("click", (e) => {
    if (e.target.classList.contains("infoBtn")) {
      const index = e.target.getAttribute("data-recipe-index");
      window.location.href = `aboutRecipe.html?index=${index}`;
    }
  });
  // displaying the previous search history
  const searchBar = document.getElementById("searchBar");
  const searchDropDown = document.getElementById("searchDropDown");
  const maxHistory = 5;
  let searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];
  // function to updatedropdown
  const updateDropdown = () => {
    searchDropDown.innerHTML = "";
    searchHistory.forEach((item) => {
      const historyPara = document.createElement("p");
      historyPara.innerText = item;
      historyPara.addEventListener("click", () => {
        searchBar.value = item;
        searchDropDown.style.display = "none";
      });
      searchDropDown.appendChild(historyPara);
    });
  };
  updateDropdown();
  // Handle searchBar
  searchBar.addEventListener("input", () => {
    if (searchBar.value) {
      searchDropDown.style.display = "block";
    } else {
      searchDropDown.style.display = "none";
    }
  });
  // Handle search submission
  function handleSubmission() {
    searchBar.addEventListener("keydown", (event) => {
      if (event.key == "Enter") {
        const query = searchBar.value.trim();
        if (query && !searchHistory.includes(query)) {
          searchHistory.unshift(query);
          if (searchHistory.length > maxHistory) {
            searchHistory.pop();
          }
          localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
          updateDropdown();
        }
        fetchData();
        searchBar.value = "";
        searchDropDown.style.display = "none";
      }
    });
  }
  handleSubmission();
  // Closing the dropdown when click outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".searchbox")) {
      searchDropDown.style.display = "none";
    }
  });
});
