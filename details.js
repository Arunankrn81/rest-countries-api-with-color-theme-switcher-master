const countryDetails = document.querySelector(".country-details");
const backBtn = document.querySelector(".back-btn");
const themeToggle = document.getElementById("theme-toggle");
const toggleCircle = document.querySelector(".toggle-circle");

/* BACK BUTTON */

backBtn.addEventListener("click", function () {
    window.location.href = "index.html";
});

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

/* COUNTRY DETAILS */

async function getCountryDetails() {

    const params = new URLSearchParams(window.location.search);

    const countryName = params.get("name");

    if (!countryName) {

        countryDetails.innerHTML = `
      <p>Please go back and select a country.</p>
    `;

        return;
    }

    try {

        const response = await fetch(
            `https://restcountries.com/v3.1/name/${countryName}?fullText=true`
        );

        const data = await response.json();

        const country = data[0];

        /* CURRENCIES */

        const currencies = country.currencies
            ? Object.values(country.currencies)
                .map(currency => currency.name)
                .join(", ")
            : "N/A";

        /* LANGUAGES */

        const languages = country.languages
            ? Object.values(country.languages).join(", ")
            : "N/A";

        /* BORDER COUNTRIES */

        const borders = country.borders
            ? country.borders.join(", ")
            : "No Borders";

        countryDetails.innerHTML = `

      <div class="details-image">

        <img src="${country.flags.svg}" alt="${country.name.common} flag">

      </div>

      <div class="details-content">

        <h2>${country.name.common}</h2>

        <p>
          <strong>Native Name:</strong>
          ${Object.values(country.name.nativeName || {})[0]?.common || "N/A"}
        </p>

        <p>
          <strong>Population:</strong>
          ${country.population.toLocaleString()}
        </p>

        <p>
          <strong>Region:</strong>
          ${country.region}
        </p>

        <p>
          <strong>Sub Region:</strong>
          ${country.subregion || "N/A"}
        </p>

        <p>
          <strong>Capital:</strong>
          ${country.capital ? country.capital[0] : "N/A"}
        </p>

        <p>
          <strong>Top Level Domain:</strong>
          ${country.tld ? country.tld[0] : "N/A"}
        </p>

        <p>
          <strong>Currencies:</strong>
          ${currencies}
        </p>

        <p>
          <strong>Languages:</strong>
          ${languages}
        </p>

        <p>
          <strong>Border Countries:</strong>
          ${borders}
        </p>

      </div>

    `;

    } catch (error) {

        countryDetails.innerHTML = `
      <p>Country details could not load.</p>
    `;
    }
}

getCountryDetails();
