function renderPreview() {
    const jsonInput = document.getElementById('jsonInput').value;
    const preview = document.getElementById('preview');
    preview.innerHTML = '';
    const objectList = document.getElementById('objectList');
    objectList.innerHTML = '';

    try {
        // Split the input by new lines and parse each line as JSON
        const jsonData = jsonInput.trim().split('\n').filter(line => line.trim() !== '').map((line, index) => {
            try {
                return JSON.parse(line.trim());
            } catch (error) {
                throw new Error(`Hiba történt a JSON sor feldolgozása során a(z) ${index + 1}. sorban: ${error.message}`);
            }
        });

        // Group items by page
        window.pages = {};  // Store pages globally for use in moveSelectedObjects
        jsonData.forEach(item => {
            if (!window.pages[item.page]) {
                window.pages[item.page] = [];
            }
            window.pages[item.page].push(item);
        });

        // Populate the dropdown with page numbers
        const pageSelect = document.getElementById('pageSelect');
        pageSelect.innerHTML = '';
        Object.keys(window.pages).forEach(pageNum => {
            const option = document.createElement('option');
            option.value = pageNum;
            option.text = `Page ${pageNum}`;
            pageSelect.add(option);
        });

        // Render the first page by default
        renderPage(window.pages, Object.keys(window.pages)[0]);

    } catch (error) {
        preview.innerHTML = 'Hiba történt a JSON fájl feldolgozása során: ' + error.message;
    }
}

function renderPage(pages, pageNum) {
    const preview = document.getElementById('preview');
    preview.innerHTML = '';
    const objectList = document.getElementById('objectList');
    objectList.innerHTML = '';

    // Common elements from page 0
    const commonElements = pages[0] || [];
    const pageElements = pages[pageNum] || [];
    const allElements = [...commonElements, ...pageElements];

    allElements.forEach((item, index) => {
        const objDiv = document.createElement('div');
        objDiv.className = 'object';
        objDiv.style.position = 'absolute';
        objDiv.style.left = `${item.x}px`;
        objDiv.style.top = `${item.y}px`;
        objDiv.style.width = `${item.w}px`;
        objDiv.style.height = `${item.h}px`;

        // Apply styles based on the object type
        switch (item.obj) {
            case 'label':
                objDiv.style.backgroundColor = item.bg_color || '#fff';
                objDiv.style.border = '1px solid #ccc';
                objDiv.style.color = item.text_color || '#000';
                objDiv.innerText = decodeIcon(item.text);
                objDiv.style.whiteSpace = 'nowrap';
                objDiv.style.overflow = 'hidden';
                objDiv.style.textOverflow = 'ellipsis';
                objDiv.style.textAlign = item.align === 1 ? 'center' : 'left';
                break;
            case 'bar':
                objDiv.style.backgroundColor = '#007BFF';
                objDiv.style.border = '1px solid #007BFF';
                break;
            case 'dropdown':
                objDiv.style.backgroundColor = '#f0f0f0';
                objDiv.style.border = '1px solid #ccc';
                objDiv.innerText = 'Dropdown';
                objDiv.style.borderRadius = `${item.radius}px`;
                break;
            case 'btn':
                objDiv.style.backgroundColor = item.bg_color || '#007BFF';
                objDiv.style.color = item.text_color || '#fff';
                objDiv.style.display = 'flex';
                objDiv.style.justifyContent = 'center';
                objDiv.style.alignItems = 'center';
                objDiv.style.fontSize = `${item.text_font}px`;
                objDiv.innerHTML = decodeIcon(item.text);
                break;
            case 'slider':
                objDiv.style.backgroundColor = '#f0f0f0';
                objDiv.style.border = '1px solid #ccc';
                break;
            default:
                objDiv.style.backgroundColor = '#f0f0f0';
                objDiv.style.border = '1px solid #ccc';
                objDiv.innerText = decodeIcon(item.obj);
        }

        // Apply additional styles if specified
        if (item.bg_opa !== undefined) {
            objDiv.style.backgroundColor = `rgba(0, 0, 0, ${item.bg_opa / 255})`;
        }
        if (item.shadow_opa !== undefined) {
            objDiv.style.boxShadow = `0px 0px ${item.shadow_width}px ${item.shadow_color}`;
        }

        preview.appendChild(objDiv);

        // Add to object list
        const listItem = document.createElement('div');
        listItem.innerHTML = `<input type="checkbox" class="objectCheckbox" data-index="${index}"> ${item.obj} (${item.x}, ${item.y})`;
        objectList.appendChild(listItem);
    });

    // Add select all checkbox
    const selectAllItem = document.createElement('div');
    selectAllItem.innerHTML = `<input type="checkbox" id="selectAllCheckbox"> Mindent kijelöl`;
    objectList.appendChild(selectAllItem);

    document.getElementById('selectAllCheckbox').addEventListener('change', function () {
        const checkboxes = document.querySelectorAll('.objectCheckbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = this.checked;
        });
    });
}

function decodeIcon(text) {
    if (!text) return '';
    const iconMap = {
        '\uE045': '⬇️',  // Arrow down
        '\uE6C0': '⬇️',  // Arrow down box
        '\uE04D': '⬅️',  // Arrow left
        '\uE054': '➡️',  // Arrow right
        '\uE05D': '⬆️',  // Arrow up
        '\uE6C3': '⬆️',  // Arrow up box
        '\uE140': '⬇️',  // Chevron down
        '\uE141': '⬅️',  // Chevron left
        '\uE142': '➡️',  // Chevron right
        '\uE143': '⬆️',  // Chevron up
        '\uE60C': '↩️',  // Subdirectory arrow left
        '\uE12C': '✔️',  // Check
        '\uE156': '❌',  // Close
        '\uE493': '⚙️',  // Cog
        '\uE2DC': '🏠',  // Home
        '\uE6A1': '🏠',  // Home outline
        '\uE374': '➖',  // Minus
        '\uE415': '➕',  // Plus
        '\uE01B': '❄️',  // Air conditioner
        '\uE238': '🔥',  // Fire
        '\uE438': '🔥',  // Radiator
        '\uEAD7': '🔥',  // Radiator disabled
        '\uE717': '❄️',  // Snowflake
        '\uE50F': '🌡️',  // Thermometer
        '\uE58C': '💧',  // Water
        '\uE58E': '💧',  // Water percent
        '\uE599': '☀️',  // Weather sunny
        '\uE5A8': '☀️',  // White balance sunny
        '\uE0AC': '🪟',  // Blinds
        '\uF011': '🪟',  // Blinds open
        '\uF2D4': '🪟',  // Garage open variant
        '\uF2D3': '🪟',  // Garage variant
        '\uF11C': '🪟',  // Window shutter
        '\uF11D': '🪟',  // Window shutter alert
        '\uF11E': '🪟',  // Window shutter open
        '\uE09A': '🔔',  // Bell
        '\uE11C': '📱',  // Cellphone
        '\uEAAC': '🍽️',  // Dishwasher
        '\uE1FA': '🛠️',  // Engine
        '\uE210': '🔧',  // Fan
        '\uE96B': '⛲',  // Fountain
        '\uE28F': '❄️',  // Fridge outline
        '\uE5FA': '☕',  // Kettle
        '\uE322': '💻',  // Laptop
        '\uEC99': '🌊',  // Microwave
        '\uF1F3': '🌱',  // Robot mower outline
        '\uE70D': '🧹',  // Robot vacuum
        '\uE4DE': '🔥',  // Stove
        '\uE502': '📺',  // Television
        '\uEA7A': '🗑️',  // Trash can outline
        '\uE917': '🧺',  // Tumble dryer
        '\uE72A': '🧺',  // Washing machine
        '\uE58F': '🚰',  // Water pump
        '\uF2A3': '🔋',  // Battery high
        '\uF2A1': '🔋',  // Battery low
        '\uF2A2': '🔋',  // Battery medium
        '\uE08E': '🔋',  // Battery outline
        '\uE5F1': '⛽',  // EV station
        '\uE32A': '🍃',  // Leaf
        '\uF40B': '⚡',  // Lightning bolt
        '\uE425': '🔌',  // Power
        '\uE6A5': '🔌',  // Power plug
        '\uE769': '💡',  // Ceiling light
        '\uF020': '🌑',  // Coach lamp
        '\uE95F': '💡',  // Desk lamp
        '\uE8DD': '💡',  // Floor lamp
        '\uE6B5': '💡',  // Lamp
        '\uE335': '💡',  // Lightbulb
        '\uE6E8': '💡',  // Lightbulb on
        '\uF054': '🏮',  // Outdoor lamp
        '\uF2BA': '🔌',  // String lights
        '\uF1E1': '🪞',  // Vanity light
        '\uE91C': '🔦',  // Wall sconce
        '\uE1D9': '🔄',  // Dots vertical
        '\uE2E3': '🛏️',  // Bed
        '\uE10B': '🚗',  // Car
        '\uE176': '☕',  // Coffee
        '\uE606': '🏊',  // Pool
        '\uE9A0': '🚿',  // Shower
        '\uEA70': '🍴',  // Silverware fork knife
        '\uE4B9': '🛋️',  // Sofa
        '\uE9AB': '🚽',  // Toilet
        '\uE004': '👤',  // Account
        '\uE64A': '👋',  // Human greeting
        '\uE70E': '🏃',  // Run
        '\uE026': '🚨',  // Alert
        '\uE7AE': '📹',  // CCTV
        '\uE81B': '🚪',  // Door closed
        '\uF0AF': '🔒',  // Door closed lock
        '\uE81C': '🚪',  // Door open
        '\uE30B': '🔑',  // Key variant
        '\uE33E': '🔒',  // Lock
        '\uEFC6': '🔓',  // Lock open variant
        '\uE565': '🛡️',  // Shield check
        '\uE68A': '🛡️',  // Shield home
        '\uE99D': '🛡️',  // Shield lock
        '\uF1DB': '🪟',  // Window closed variant
        '\uEF5F': '🖥️',  // Monitor speaker
        '\uE75A': '🎵',  // Music
        '\uE3E4': '⏸️',  // Pause
        '\uE40A': '▶️',  // Play
        '\uE456': '🔁',  // Repeat
        '\uE457': '🔂',  // Repeat off
        '\uE458': '🔂',  // Repeat once
        '\uE49D': '🔀',  // Shuffle
        '\uE49E': '🔀',  // Shuffle disabled
        '\uE4AD': '⏭️',  // Skip next
        '\uE4AE': '⏮️',  // Skip previous
        '\uE4C3': '🔊',  // Speaker
        '\uE4DB': '⏹️',  // Stop
        '\uE57E': '🔊',  // Volume high
        '\uE580': '🔉',  // Volume medium
        '\uE75F': '🔇',  // Volume mute
        '\uE0ED': '📅',  // Calendar
        '\uE150': '🕒',  // Clock outline
        '\uE2DA': '⏳',  // History
        '\uE51B': '⏲️',  // Timer outline
        '\uE0AF': '📶',  // Bluetooth
        '\uE5A9': '📶'   // Wifi
    };
    return text.replace(/\\u[\dA-F]{4}/gi, match => iconMap[match] || match);
}

function setFrameSize() {
    const frameSize = document.getElementById('frameSize').value;
    const preview = document.getElementById('preview');
    const [width, height] = frameSize.split('x').map(Number);
    preview.style.width = `${width}px`;
    preview.style.height = `${height}px`;
    preview.style.position = 'relative';
    preview.style.border = '1px solid #000';
}

function onPageChange() {
    const jsonInput = document.getElementById('jsonInput').value;
    const jsonData = jsonInput.trim().split('\n').filter(line => line.trim() !== '').map((line, index) => {
        try {
            return JSON.parse(line.trim());
        } catch (error) {
            throw new Error(`Hiba történt a JSON sor feldolgozása során a(z) ${index + 1}. sorban: ${error.message}`);
        }
    });

    window.pages = {};
    jsonData.forEach(item => {
        if (!window.pages[item.page]) {
            window.pages[item.page] = [];
        }
        window.pages[item.page].push(item);
    });

    const selectedPage = document.getElementById('pageSelect').value;
    renderPage(window.pages, selectedPage);
}

function moveSelectedObjects(dx, dy) {
    const checkboxes = document.querySelectorAll('.objectCheckbox:checked');
    const pageSelect = document.getElementById('pageSelect');
    const selectedPage = pageSelect.value;

    checkboxes.forEach(checkbox => {
        const index = checkbox.getAttribute('data-index');
        const allElements = [...(window.pages[0] || []), ...(window.pages[selectedPage] || [])];
        const item = allElements[index];
        if (item) {
            item.x += dx;
            item.y += dy;
        }
    });

    // Re-render the current page
    renderPage(window.pages, selectedPage);
    updateJsonInput();
}

function updateJsonInput() {
    const allElements = Object.values(window.pages).flat();
    const jsonInput = document.getElementById('jsonInput');
    jsonInput.value = allElements.map(item => JSON.stringify(item, (key, value) => {
        return (typeof value === 'string' && value.match(/^[\uE000-\uF8FF]$/)) ? '\\u' + value.charCodeAt(0).toString(16).toUpperCase() : value;
    })).join('\n');
}
