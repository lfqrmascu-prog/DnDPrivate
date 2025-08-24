document.addEventListener('DOMContentLoaded', () => {
    // --- Referencias a los elementos del DOM ---
    const welcomeScreen = document.getElementById('welcome-screen');
    const searchScreen = document.getElementById('search-screen');
    const speciesScreen = document.getElementById('species-screen');

    const languageBtnWelcome = document.getElementById('language-btn-welcome');
    const languageBtnSearch = document.getElementById('language-btn-search');
    
    const welcomeTitle = document.getElementById('welcome-title');
    const searchTitle = document.getElementById('search-title');

    const searchBtn = document.getElementById('search-btn');
    const createBtn = document.getElementById('create-btn');
    const manageBtn = document.getElementById('manage-btn');
    const backBtn = document.getElementById('back-btn');
    const backToSearchBtn = document.getElementById('back-to-search-btn');

    const menuBtns = document.querySelectorAll('.menu-btn');
    const speciesMenuBtn = document.querySelector('.menu-btn[data-lang="species"]');
    
    const speciesFilterInput = document.getElementById('species-filter-input');
    const speciesListContainer = document.getElementById('species-list-container');

    // --- Variables de estado de la aplicación ---
    let currentLang = 'en';
    let allSpecies = [];

    // --- Datos para la traducción y URLs ---
    const translations = {
        en: {
            titles: { welcome: "Welcome<br>Adventurer!", search: "Search" },
            mainMenu: { search: "Search", create: "Create Character", manage: "Manage Characters" },
            searchMenu: {
                'species': "Species", 'classes': "Classes", 'feats': "Feats",
                'options-features': "Options & Features", 'backgrounds': "Backgrounds",
                'items': "Items", 'spells': "Spells", 'adventures': "Adventures",
                'books': "Books", 'rules-glossary': "Rules Glossary", 'conditions': "Conditions",
                'dm-options': "DM Options"
            },
            back: "Back",
            flagSrc: "assets/es-flag.png",
            flagAlt: "Switch to Spanish",
            filterPlaceholder: "Filter species...",
            noResults: "No results found."
        },
        es: {
            titles: { welcome: "¡Bienvenido<br>Aventurero!", search: "Buscar" },
            mainMenu: { search: "Buscar", create: "Crear Personaje", manage: "Gestionar Personajes" },
            searchMenu: {
                'species': "Especie", 'classes': "Clases", 'feats': "Dotes",
                'options-features': "Opciones y Rasgos", 'backgrounds': "Trasfondos",
                'items': "Objetos", 'spells': "Conjuros", 'adventures': "Aventuras",
                'books': "Libros", 'rules-glossary': "Glosario de Reglas", 'conditions': "Condiciones",
                'dm-options': "Opciones de DM"
            },
            back: "Volver",
            flagSrc: "assets/en-flag.png",
            flagAlt: "Switch to English",
            filterPlaceholder: "Filtrar especies...",
            noResults: "No se encontraron resultados."
        }
    };
    
    // URL de tu archivo races.json en GitHub
    const speciesUrl = 'https://raw.githubusercontent.com/lfqrmascu-prog/DnDPrivate/main/data/races.json'; 

    // --- Funciones principales ---
    function showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
        updateScreenTexts(screenId);
    }

    function updateScreenTexts(screenId) {
        const lang = translations[currentLang];
        
        // Actualizar pantalla de bienvenida
        if (screenId === 'welcome-screen') {
            welcomeTitle.innerHTML = lang.titles.welcome;
            searchBtn.textContent = lang.mainMenu.search;
            createBtn.textContent = lang.mainMenu.create;
            manageBtn.textContent = lang.mainMenu.manage;
            document.getElementById('flag-img-welcome').src = lang.flagSrc;
            document.getElementById('flag-img-welcome').alt = lang.flagAlt;
        } 
        
        // Actualizar pantalla de búsqueda
        else if (screenId === 'search-screen') {
            searchTitle.textContent = lang.titles.search;
            backBtn.textContent = lang.back;
            document.getElementById('flag-img-search').src = lang.flagSrc;
            document.getElementById('flag-img-search').alt = lang.flagAlt;
            menuBtns.forEach(button => {
                const key = button.dataset.lang;
                button.textContent = lang.searchMenu[key];
            });
        }
        
        // Actualizar pantalla de especies
        else if (screenId === 'species-screen') {
            document.getElementById('species-title').textContent = lang.searchMenu.species;
            document.getElementById('back-to-search-btn').textContent = lang.back;
            speciesFilterInput.placeholder = lang.filterPlaceholder;
        }
    }

    async function fetchAndDisplaySpecies() {
        speciesListContainer.innerHTML = `<p>${translations[currentLang].noResults}</p>`;
        try {
            const response = await fetch(speciesUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            allSpecies = data.race.sort((a, b) => a.name.localeCompare(b.name));
            displaySpecies(allSpecies);
        } catch (error) {
            console.error("Error al obtener los datos de especies:", error);
            speciesListContainer.innerHTML = `<p><b>Error de conexión.</b> No se pudieron cargar los datos.</p>`;
        }
    }

    function displaySpecies(species) {
        speciesListContainer.innerHTML = '';
        if (species.length === 0) {
            speciesListContainer.innerHTML = `<p>${translations[currentLang].noResults}</p>`;
            return;
        }
        species.forEach(s => {
            const speciesElement = document.createElement('button');
            speciesElement.className = 'species-item';
            speciesElement.textContent = s.name;
            speciesListContainer.appendChild(speciesElement);
        });
    }

    function filterSpecies() {
        const filterValue = speciesFilterInput.value.toLowerCase();
        const filteredSpecies = allSpecies.filter(s => s.name.toLowerCase().includes(filterValue));
        displaySpecies(filteredSpecies);
    }

    // --- Event Listeners ---
    searchBtn.addEventListener('click', () => showScreen('search-screen'));
    backBtn.addEventListener('click', () => showScreen('welcome-screen'));
    backToSearchBtn.addEventListener('click', () => showScreen('search-screen'));
    
    speciesMenuBtn.addEventListener('click', () => {
        showScreen('species-screen');
        if (allSpecies.length === 0) {
            fetchAndDisplaySpecies();
        } else {
            displaySpecies(allSpecies);
        }
    });

    speciesFilterInput.addEventListener('input', filterSpecies);
    
    document.querySelectorAll('.language-btn-style').forEach(btn => {
        btn.addEventListener('click', () => {
            currentLang = currentLang === 'en' ? 'es' : 'en';
            showScreen(document.querySelector('.screen.active').id);
        });
    });

    // --- Inicialización ---
    updateScreenTexts('welcome-screen');
});
