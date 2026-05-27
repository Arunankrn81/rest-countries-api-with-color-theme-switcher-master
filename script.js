// ===========================
//   REST COUNTRIES APP
// ===========================

const API_ALL = 'https://restcountries.com/v3.1/all?fields=name,flags,population,region,capital,cca3,borders';
const API_CODE = 'https://restcountries.com/v3.1/alpha/';

// --- DOM References ---
const body = document.body;
const darkToggle = document.getElementById('darkToggle');
const searchInput = document.getElementById('searchInput');
const filterBtn = document.getElementById('filterBtn');
const filterDropdown = document.getElementById('filterDropdown');
const filterMenu = document.getElementById('filterMenu');
const filterLabel = document.getElementById('filterLabel');
const filterItems = filterMenu.querySelectorAll('.filter-dropdown__item');
const countriesGrid = document.getElementById('countriesGrid');
const statusMsg = document.getElementById('statusMsg');
const homepage = document.getElementById('homepage');
const detailPage = document.getElementById('detailPage');
const detailContent = document.getElementById('detailContent');
const backBtn = document.getElementById('backBtn');

// --- State ---
let allCountries = [];
let currentRegion = '';
let currentSearch = '';
let isDark = false;

// ===========================
//   DARK MODE
// ===========================

function initDarkMode() {
    const saved = localStorage.getItem('darkMode');
    if (saved === 'true') {
        enableDark();
    }
}

function enableDark() {
    isDark = true;
    body.classList.replace('light-mode', 'dark-mode');
    darkToggle.querySelector('.dark-toggle__icon').textContent = '☀️';
    darkToggle.querySelector('.dark-toggle__label').textContent = 'Light Mode';
    localStorage.setItem('darkMode', 'true');
}

function disableDark() {
    isDark = false;
    body.classList.replace('dark-mode', 'light-mode');
    darkToggle.querySelector('.dark-toggle__icon').textContent = '🌙';
    darkToggle.querySelector('.dark-toggle__label').textContent = 'Dark Mode';
    localStorage.setItem('darkMode', 'false');
}

darkToggle.addEventListener('click', () => {
    isDark ? disableDark() : enableDark();
});

// ===========================
//   FILTER DROPDOWN
// ===========================

filterBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = filterDropdown.classList.toggle('open');
    filterBtn.setAttribute('aria-expanded', isOpen);
});

document.addEventListener('click', () => {
    filterDropdown.classList.remove('open');
    filterBtn.setAttribute('aria-expanded', 'false');
});

filterItems.forEach(item => {
    item.addEventListener('click', () => {
        filterItems.forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');

        currentRegion = item.dataset.value;
        filterLabel.textContent = currentRegion || 'Filter by Region';

        filterDropdown.classList.remove('open');
        filterBtn.setAttribute('aria-expanded', 'false');

        renderCountries();
    });
});

// ===========================
//   SEARCH
// ===========================

searchInput.addEventListener('input', () => {
    currentSearch = searchInput.value.trim().toLowerCase();
    renderCountries();
});

// ===========================
//   FETCH ALL COUNTRIES
// ===========================

async function fetchAllCountries() {
    statusMsg.textContent = 'Loading countries…';

    try {
        const res = await fetch(API_ALL);
        if (!res.ok) throw new Error('Network error');
        allCountries = await res.json();

        // Sort alphabetically
        allCountries.sort((a, b) =>
            a.name.common.localeCompare(b.name.common)
        );

        statusMsg.textContent = '';
        renderCountries();
    } catch (err) {
        statusMsg.textContent = '⚠️ Failed to load countries. Please try again later.';
        console.error(err);
    }
}

// ===========================
//   RENDER COUNTRIES GRID
// ===========================

function renderCountries() {
    let countries = allCountries;

    // Apply region filter
    if (currentRegion) {
        countries = countries.filter(c => c.region === currentRegion);
    }

    // Apply search filter
    if (currentSearch) {
        countries = countries.filter(c =>
            c.name.common.toLowerCase().includes(currentSearch)
        );
    }

    // Clear grid
    countriesGrid.innerHTML = '';

    if (countries.length === 0) {
        statusMsg.textContent = 'No countries found.';
        return;
    }

    statusMsg.textContent = '';

    const fragment = document.createDocumentFragment();

    countries.forEach(country => {
        const card = createCard(country);
        fragment.appendChild(card);
    });

    countriesGrid.appendChild(fragment);
}

// ===========================
//   CREATE CARD ELEMENT
// ===========================

function createCard(country) {
    const name = country.name.common;
    const flag = country.flags?.svg || country.flags?.png || '';
    const population = formatNumber(country.population);
    const region = country.region || 'N/A';
    const capital = country.capital?.[0] || 'N/A';

    const card = document.createElement('article');
    card.className = 'country-card';
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `View details for ${name}`);

    card.innerHTML = `
    <img
      class="country-card__flag"
      src="${escapeHtml(flag)}"
      alt="Flag of ${escapeHtml(name)}"
      loading="lazy"
    />
    <div class="country-card__body">
      <h2 class="country-card__name">${escapeHtml(name)}</h2>
      <div class="country-card__info">
        <p><span>Population:</span> ${escapeHtml(population)}</p>
        <p><span>Region:</span> ${escapeHtml(region)}</p>
        <p><span>Capital:</span> ${escapeHtml(capital)}</p>
      </div>
    </div>
  `;

    // Click / keyboard handlers
    card.addEventListener('click', () => showDetail(country.cca3));
    card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            showDetail(country.cca3);
        }
    });

    return card;
}

// ===========================
//   SHOW DETAIL PAGE
// ===========================

async function showDetail(code) {
    homepage.classList.add('hidden');
    detailPage.classList.remove('hidden');
    detailContent.innerHTML = '<p class="status-msg">Loading…</p>';

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
        const res = await fetch(`${API_CODE}${code}?fields=name,flags,population,region,subregion,capital,tld,currencies,languages,borders,cca3`);
        if (!res.ok) throw new Error('Network error');
        const country = await res.json();
        renderDetail(country);
    } catch (err) {
        detailContent.innerHTML = '<p class="status-msg">⚠️ Failed to load details.</p>';
        console.error(err);
    }
}

// ===========================
//   RENDER DETAIL
// ===========================

async function renderDetail(country) {
    const name = country.name.common;
    const nativeName = getNativeName(country.name.nativeName);
    const flag = country.flags?.svg || country.flags?.png || '';
    const population = formatNumber(country.population);
    const region = country.region || 'N/A';
    const subregion = country.subregion || 'N/A';
    const capital = country.capital?.[0] || 'N/A';
    const tld = country.tld?.[0] || 'N/A';
    const currencies = getCurrencies(country.currencies);
    const languages = getLanguages(country.languages);
    const borders = country.borders || [];

    let bordersHtml = '';
    if (borders.length > 0) {
        const borderNames = await fetchBorderNames(borders);
        const tags = borderNames.map(b => `
      <button class="border-tag" data-code="${escapeHtml(b.code)}">${escapeHtml(b.name)}</button>
    `).join('');
        bordersHtml = `
      <div class="borders-section">
        <span class="borders-section__label">Border Countries:</span>
        ${tags}
      </div>
    `;
    } else {
        bordersHtml = `
      <div class="borders-section">
        <span class="borders-section__label">Border Countries:</span>
        <span>None</span>
      </div>
    `;
    }

    detailContent.innerHTML = `
    <img
      class="detail-flag"
      src="${escapeHtml(flag)}"
      alt="Flag of ${escapeHtml(name)}"
    />
    <div class="detail-info">
      <h2 class="detail-info__name">${escapeHtml(name)}</h2>
      <div class="detail-info__columns">
        <div class="detail-info__col">
          <p><span>Native Name: </span>${escapeHtml(nativeName)}</p>
          <p><span>Population: </span>${escapeHtml(population)}</p>
          <p><span>Region: </span>${escapeHtml(region)}</p>
          <p><span>Sub Region: </span>${escapeHtml(subregion)}</p>
          <p><span>Capital: </span>${escapeHtml(capital)}</p>
        </div>
        <div class="detail-info__col">
          <p><span>Top Level Domain: </span>${escapeHtml(tld)}</p>
          <p><span>Currencies: </span>${escapeHtml(currencies)}</p>
          <p><span>Languages: </span>${escapeHtml(languages)}</p>
        </div>
      </div>
      ${bordersHtml}
    </div>
  `;

    // Attach border tag click events
    detailContent.querySelectorAll('.border-tag').forEach(tag => {
        tag.addEventListener('click', () => showDetail(tag.dataset.code));
    });
}

// ===========================
//   FETCH BORDER NAMES
// ===========================

async function fetchBorderNames(codes) {
    try {
        const codeList = codes.join(',');
        const res = await fetch(`https://restcountries.com/v3.1/alpha?codes=${codeList}&fields=name,cca3`);
        if (!res.ok) throw new Error('Border fetch failed');
        const data = await res.json();
        return data.map(c => ({ code: c.cca3, name: c.name.common }));
    } catch {
        return codes.map(c => ({ code: c, name: c }));
    }
}

// ===========================
//   BACK BUTTON
// ===========================

backBtn.addEventListener('click', () => {
    detailPage.classList.add('hidden');
    homepage.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===========================
//   HELPER FUNCTIONS
// ===========================

function formatNumber(num) {
    if (num == null) return 'N/A';
    return num.toLocaleString();
}

function getNativeName(nativeName) {
    if (!nativeName) return 'N/A';
    const keys = Object.keys(nativeName);
    if (keys.length === 0) return 'N/A';
    return nativeName[keys[0]].common || 'N/A';
}

function getCurrencies(currencies) {
    if (!currencies) return 'N/A';
    return Object.values(currencies)
        .map(c => c.name)
        .join(', ') || 'N/A';
}

function getLanguages(languages) {
    if (!languages) return 'N/A';
    return Object.values(languages).join(', ') || 'N/A';
}

function escapeHtml(str) {
    if (typeof str !== 'string') return str;
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// ===========================
//   INIT
// ===========================

initDarkMode();
fetchAllCountries();