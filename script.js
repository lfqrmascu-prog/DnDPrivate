document.addEventListener('DOMContentLoaded', () => {
    // --- Referencias a los elementos del DOM ---
    const welcomeScreen = document.getElementById('welcome-screen');
    const searchScreen = document.getElementById('search-screen');
    const contentScreen = document.getElementById('content-screen');
    const languageBtnWelcome = document.getElementById('language-btn-welcome');
    const languageBtnSearch = document.getElementById('language-btn-search');
    const welcomeTitle = document.getElementById('welcome-title');
    const searchTitle = document.getElementById('search-title');
    const contentTitle = document.getElementById('content-title');
    const searchBtn = document.getElementById('search-btn');
    const createBtn = document.getElementById('create-btn');
    const manageBtn = document.getElementById('manage-btn');
    const backBtn = document = document.getElementById('back-btn');
    const backToSearchBtn = document.getElementById('back-to-search-btn');
    const menuBtns = document.querySelectorAll('.menu-btn');
    const contentListContainer = document.getElementById('content-list-container');
    const contentFilterInput = document.getElementById('content-filter-input');
    
    // --- Variables de estado de la aplicación ---
    let currentLang = 'en';
    let allContent = [];
    let currentDataType = '';
    
    // --- URL base de tu repositorio en GitHub ---
    const baseUrl = 'https://raw.githubusercontent.com/lfqrmascu-prog/DnDPrivate/main/data/';

    // --- Mapeo de archivos de datos y las claves en cada JSON ---
    const dataInfo = {
        'races': { file: 'races.json', key: 'race', name: {en: "Species", es: "Especies"} },
        'classes': { file: 'classes.json', key: 'class', name: {en: "Classes", es: "Clases"} },
        'feats': { file: 'feats.json', key: 'feat', name: {en: "Feats", es: "Dotes"} },
        'options-features': { file: 'classfeatures.json', key: 'classFeature', name: {en: "Options & Features", es: "Opciones y Rasgos"} },
        'backgrounds': { file: 'backgrounds.json', key: 'background', name: {en: "Backgrounds", es: "Trasfondos"} },
        'items': { file: 'items.json', key: 'item', name: {en: "Items", es: "Objetos"} },
        'spells-phb': { file: 'spells-phb.json', key: 'spell', name: {en: "Spells", es: "Conjuros"} }
    };

    // --- Traducciones ---
    const translations = {
        en: {
            titles: { welcome: "Welcome<br>Adventurer!", search: "Search" },
            mainMenu: { search: "Search", create: "Create Character", manage: "Manage Characters" },
            searchMenu: {
                'races': "Species", 'classes': "Classes", 'feats': "Feats",
                'options-features': "Options & Features", 'backgrounds': "Backgrounds",
                'items': "Items", 'spells-phb': "Spells", 'adventures': "Adventures",
                'books': "Books", 'rules-glossary': "Rules Glossary", 'conditions': "Conditions",
                'dm-options': "DM Options"
            },
            back: "Back",
            flagSrc: "assets/es-flag.png",
            flagAlt: "Switch to Spanish",
            filterPlaceholder: (type) => `Filter ${type}...`,
            noResults: "No results found."
        },
        es: {
            titles: { welcome: "¡Bienvenido<br>Aventurero!", search: "Buscar" },
            mainMenu: { search: "Buscar", create: "Crear Personaje", manage: "Gestionar Personajes" },
            searchMenu: {
                'races': "Especies", 'classes': "Clases", 'feats': "Dotes",
                'options-features': "Opciones y Rasgos", 'backgrounds': "Trasfondos",
                'items': "Objetos", 'spells-phb': "Conjuros", 'adventures': "Aventuras",
                'books': "Libros", 'rules-glossary': "Glosario de Reglas", 'conditions': "Condiciones",
                'dm-options': "Opciones de DM"
            },
            back: "Volver",
            flagSrc: "assets/en-flag.png",
            flagAlt: "Switch to English",
            filterPlaceholder: (type) => `Filtrar ${type}...`,
            noResults: "No se encontraron resultados."
        }
    };
    
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
        
        if (screenId === 'welcome-screen') {
            welcomeTitle.innerHTML = lang.titles.welcome;
            searchBtn.textContent = lang.mainMenu.search;
            document.getElementById('flag-img-welcome').src = lang.flagSrc;
            document.getElementById('flag-img-welcome').alt = lang.flagAlt;
        } 
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
        else if (screenId === 'content-screen') {
            const translatedKey = lang.searchMenu[currentDataType] || currentDataType;
            contentTitle.textContent = translatedKey;
            backToSearchBtn.textContent = lang.back;
            const placeholder = lang.filterPlaceholder(translatedKey.toLowerCase());
            contentFilterInput.placeholder = placeholder;
            if (allContent.length > 0) {
                displayContent(allContent);
            }
        }
    }

    async function fetchAndDisplayContent(dataType) {
        currentDataType = dataType;
        contentListContainer.innerHTML = `<p>${translations[currentLang].noResults}</p>`;
        
        const fileInfo = dataInfo[dataType];
        if (!fileInfo) {
            console.error('Data info not found for:', dataType);
            return;
        }

        const dataUrl = baseUrl + fileInfo.file;

        try {
            const response = await fetch(dataUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            allContent = data[fileInfo.key].sort((a, b) => a.name.localeCompare(b.name));
            displayContent(allContent);
        } catch (error) {
            console.error("Error al obtener los datos de la API:", error);
            contentListContainer.innerHTML = `<p><b>Error de conexión.</b> No se pudieron cargar los datos.</p>`;
        }
    }

    function displayContent(content) {
        contentListContainer.innerHTML = '';
        if (content.length === 0) {
            contentListContainer.innerHTML = `<p>${translations[currentLang].noResults}</p>`;
            return;
        }
        content.forEach(item => {
            const itemElement = document.createElement('button');
            itemElement.className = 'content-item';
            itemElement.textContent = item.name;
            contentListContainer.appendChild(itemElement);
        });
    }

    function filterContent() {
        const filterValue = contentFilterInput.value.toLowerCase();
        const filteredContent = allContent.filter(item => item.name.toLowerCase().includes(filterValue));
        displayContent(filteredContent);
    }

    // --- Event Listeners ---
    searchBtn.addEventListener('click', () => showScreen('search-screen'));
    backBtn.addEventListener('click', () => showScreen('welcome-screen'));
    backToSearchBtn.addEventListener('click', () => showScreen('search-screen'));
    
    menuBtns.forEach(button => {
        button.addEventListener('click', () => {
            const dataType = button.dataset.lang;
            showScreen('content-screen');
            fetchAndDisplayContent(dataType);
        });
    });

    contentFilterInput.addEventListener('input', filterContent);
    
    document.querySelectorAll('.language-btn-style').forEach(btn => {
        btn.addEventListener('click', () => {
            currentLang = currentLang === 'en' ? 'es' : 'en';
            showScreen(document.querySelector('.screen.active').id);
        });
    });

    // --- Inicialización ---
    updateScreenTexts('welcome-screen');
});
