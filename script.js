const countriesContainer = document.querySelector(".countries-container");
const searchInput = document.querySelector(".search-input");
const filterSelect = document.querySelector(".filter-select");
const themeToggle = document.getElementById("theme-toggle");
const toggleCircle = document.querySelector(".toggle-circle");

let allCountries = [];

/* GET COUNTRIES */

async function getCountries() {

    const response = await fetch(
        "https://restcountries.com/v3.1/all?fields=name,capital,population,region,flags"
    );

    const countries = await response.json();

    allCountries = countries;

    displayCountries(allCountries);
}

/* DISPLAY COUNTRIES */

function displayCountries(countries) {

    countriesContainer.innerHTML = "";

    countries.forEach(function (country) {

        const countryCard = document.createElement("div");

        countryCard.className = "country-card";

        countryCard.innerHTML = `
    
      <img src="${country.flags.svg}" alt="${country.name.common} flag">

      <div class="country-info">

        <h2>${country.name.common}</h2>

        <p>
          <strong>Population:</strong>
          ${country.population.toLocaleString()}
        </p>

        <p>
          <strong>Region:</strong>
          ${country.region}
        </p>

        <p>
          <strong>Capital:</strong>
          ${country.capital ? country.capital[0] : "N/A"}
        </p>

      </div>
    `;

        /* CLICK COUNTRY */

        countryCard.addEventListener("click", function () {

            window.location.href =
                `details.html?name=${country.name.common}`;

        });

        countriesContainer.appendChild(countryCard);
    });
}

/* SEARCH + FILTER */

function filterCountries() {

    const searchValue =
        searchInput.value.toLowerCase();

    const regionValue =
        filterSelect.value;

    const filteredCountries =
        allCountries.filter(function (country) {

            const matchesSearch =
                country.name.common
                    .toLowerCase()
                    .includes(searchValue);

            const matchesRegion =
                regionValue === "" ||
                country.region === regionValue;

            return matchesSearch && matchesRegion;
        });

    displayCountries(filteredCountries);
}

searchInput.addEventListener(
    "input",
    filterCountries
);

filterSelect.addEventListener(
    "change",
    filterCountries
);

/* DARK MODE */

themeToggle.addEventListener("click", function () {

    document.body.classList.toggle("dark-mode");

    themeToggle.classList.toggle("active");

    if (document.body.classList.contains("dark-mode")) {

        toggleCircle.innerHTML = "☀️";

    } else {

        toggleCircle.innerHTML = "🌙";
    }
});

/* START */

getCountries();
