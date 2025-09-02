document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const sidebarNav = document.getElementById('sidebar-nav');
    const contentTitle = document.getElementById('content-title');
    const contentDisplay = document.getElementById('content-display');

    let searchableData = [];
    let allRacesData = {};
    const defaultNavHTML = `
        <div class="nav-item dropdown" id="home-dropdown">
            <div class="dropdown-header">
                <i class="fas fa-home nav-icon"></i><span>Inicio</span><i class="fas fa-chevron-down dropdown-arrow"></i>
            </div>
            <div class="dropdown-menu">
                <div class="dropdown-item">Consultar</div>
                <div class="dropdown-item">Hojas de personaje</div>
                <div class="dropdown-item">Monstruario</div>
            </div>
        </div>
        <div class="nav-item dropdown" id="races-dropdown">
            <div class="dropdown-header">
                <i class="fas fa-dragon nav-icon"></i><span>Razas</span><i class="fas fa-chevron-down dropdown-arrow"></i>
            </div>
            <div class="dropdown-menu" id="races-menu"></div>
        </div>`;

    const DATA_URLS = [
        'https://raw.githubusercontent.com/lfqrmascu-prog/DnDPrivate/main/Data/01%20races.json',
        'https://raw.githubusercontent.com/lfqrmascu-prog/DnDPrivate/main/Data/02%20classes.json',
        'https://raw.githubusercontent.com/lfqrmascu-prog/DnDPrivate/main/Data/08%20spellcasting.json',
        'https://raw.githubusercontent.com/lfqrmascu-prog/DnDPrivate/main/Data/11%20monsters.json',
        'https://raw.githubusercontent.com/lfqrmascu-prog/DnDPrivate/main/Data/17%20backgrounds.json',
        'https://raw.githubusercontent.com/lfqrmascu-prog/DnDPrivate/main/Data/10%20magic%20items.json'
    ];

    const init = async () => {
        renderDefaultNav();
        await loadAllData();
        searchInput.addEventListener('input', handleSearch);
        sidebarNav.addEventListener('click', (event) => {
            const dropdownHeader = event.target.closest('.dropdown-header');
            if (dropdownHeader) {
                dropdownHeader.parentElement.classList.toggle('open');
            }
        });
    };

    const loadAllData = async () => {
        contentDisplay.innerHTML = '<p>Cargando toda la información, por favor espera...</p>';
        const promises = DATA_URLS.map(url => fetch(url).then(res => res.json()));
        
        try {
            const results = await Promise.all(promises);
            let combinedData = [];

            results.forEach((data, index) => {
                const url = DATA_URLS[index];
                if (url.includes('races')) {
                    allRacesData = data.Races;
                    combinedData.push(...parseGeneric(data.Races, 'Raza'));
                } else if (url.includes('classes')) {
                    combinedData.push(...parseGeneric(data, 'Clase'));
                } else if (url.includes('spellcasting')) {
                    combinedData.push(...parseGeneric(data.Spellcasting['Spell Descriptions'], 'Hechizo'));
                } else if (url.includes('monsters')) {
                    combinedData.push(...parseNestedCategory(data.Monsters, 'Monstruo'));
                } else if (url.includes('backgrounds')) {
                    combinedData.push(...parseBackgrounds(data.background, 'Trasfondo'));
                } else if (url.includes('magic%20items')) {
                    combinedData.push(...parseGeneric(data['Magic Items'], 'Objeto Mágico'));
                }
            });

            searchableData = combinedData;
            contentDisplay.innerHTML = '<p>¡Listo! Utiliza la barra de búsqueda para encontrar lo que necesites.</p>';
            renderRacesMenu(allRacesData);

        } catch (error) {
            console.error("Error al cargar los datos:", error);
            contentDisplay.innerHTML = '<p>Hubo un error al cargar la información. Revisa la consola para más detalles.</p>';
        }
    };

    const parseGeneric = (dataObject, category) => {
        const entries = [];
        for (const key in dataObject) {
            if (Object.prototype.hasOwnProperty.call(dataObject, key)) {
                entries.push({
                    title: key,
                    category: category,
                    content: JSON.stringify(dataObject[key]).toLowerCase(),
                    data: { name: key, details: dataObject[key], type: category }
                });
            }
        }
        return entries;
    };

    const parseNestedCategory = (dataObject, category) => {
        let entries = [];
        for (const key in dataObject) {
            if (typeof dataObject[key] === 'object' && dataObject[key] !== null) {
                entries = entries.concat(parseGeneric(dataObject[key], category));
            }
        }
        return entries;
    };
    
    const parseBackgrounds = (backgroundArray, category) => {
        return backgroundArray.map(bg => ({
            title: bg.name,
            category: category,
            content: JSON.stringify(bg).toLowerCase(),
            data: { name: bg.name, details: bg, type: category }
        }));
    };


    const handleSearch = (event) => {
        const searchTerm = event.target.value.toLowerCase().trim();

        if (searchTerm.length < 2) {
            renderDefaultNav();
            renderRacesMenu(allRacesData);
            return;
        }

        const filteredResults = searchableData.filter(item => 
            item.title.toLowerCase().includes(searchTerm) || item.content.includes(searchTerm)
        );

        renderSearchResults(filteredResults);
    };

    const renderDefaultNav = () => {
        sidebarNav.innerHTML = defaultNavHTML;
    };

    const renderRacesMenu = (races) => {
        const racesMenu = document.getElementById('races-menu');
        if (!racesMenu) return;
        
        racesMenu.innerHTML = '';
        const raceNames = Object.keys(races).filter(name => name !== "Racial Traits").sort();
        
        raceNames.forEach(raceName => {
            const menuItem = document.createElement('div');
            menuItem.className = 'dropdown-item';
            menuItem.textContent = raceName;
            menuItem.addEventListener('click', (e) => {
                e.stopPropagation();
                displayDetails({ name: raceName, details: races[raceName], type: 'Raza' });
                document.querySelectorAll('.dropdown-item').forEach(i => i.classList.remove('selected'));
                e.target.classList.add('selected');
            });
            racesMenu.appendChild(menuItem);
        });
    };

    const renderSearchResults = (results) => {
        sidebarNav.innerHTML = ''; 
        if (results.length === 0) {
            sidebarNav.innerHTML = '<div class="search-result-item"><div class="search-result-title">No se encontraron resultados.</div></div>';
            return;
        }

        results.slice(0, 100).forEach(item => {
            const resultEl = document.createElement('div');
            resultEl.className = 'search-result-item';
            resultEl.innerHTML = `
                <div class="search-result-title">${item.title}</div>
                <div class="search-result-category">${item.category}</div>
            `;
            resultEl.addEventListener('click', () => {
                displayDetails(item.data);
                searchInput.value = '';
                renderDefaultNav();
                renderRacesMenu(allRacesData);
            });
            sidebarNav.appendChild(resultEl);
        });
    };

    const displayDetails = (item) => {
        contentTitle.textContent = item.name;
        let htmlContent = `<h2>${item.name}</h2>`;

        // Función recursiva para renderizar contenido genérico
        const renderContent = (data) => {
            let html = '';
            if (Array.isArray(data)) {
                html += '<ul>';
                data.forEach(item => {
                    html += `<li>${renderContent(item)}</li>`;
                });
                html += '</ul>';
            } else if (typeof data === 'object' && data !== null) {
                if (data.table) {
                    html += '<table class="race-table">'; // Asumiendo que tienes estilos para esta clase
                    const headers = Object.keys(data.table);
                    html += '<thead><tr>';
                    headers.forEach(header => html += `<th>${header}</th>`);
                    html += '</tr></thead>';
                    html += '<tbody>';
                    const numRows = data.table[headers[0]].length;
                    for (let i = 0; i < numRows; i++) {
                        html += '<tr>';
                        headers.forEach(header => html += `<td>${data.table[header][i]}</td>`);
                        html += '</tr>';
                    }
                    html += '</tbody></table>';
                } else {
                    for (const key in data) {
                        if (key !== 'content') {
                           html += `<h3>${key.replace(/_/g, ' ')}</h3>`;
                        }
                        html += renderContent(data[key]);
                    }
                }
            } else {
                 html += `<p>${String(data).replace(/\*\*\*/g, '<strong>').replace(/\.\*\*\*/g, '.</strong>')}</p>`;
            }
            return html;
        };
        
        htmlContent += renderContent(item.details.content || item.details);
        contentDisplay.innerHTML = htmlContent;
    };
    
    init();
});
