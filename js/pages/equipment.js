/* === EQUIPMENT DATA === */
const equipmentData = [
    {
        id: 1,
        name: "Business Laptop",
        category: "computer",
        categoryName: "Computers",
        description:
            "Professional laptop suitable for business, school, and office use.",
        rate: 800,
        icon: "💻",
        available: true
    },

    {
        id: 2,
        name: "DSLR Camera",
        category: "camera",
        categoryName: "Cameras",
        description:
            "High-quality DSLR camera suitable for photography and events.",
        rate: 1200,
        icon: "📷",
        available: true
    },

    {
        id: 3,
        name: "HD Projector",
        category: "projector",
        categoryName: "Projectors",
        description:
            "HD projector suitable for presentations, meetings, and events.",
        rate: 1000,
        icon: "📽️",
        available: true
    },

    {
        id: 4,
        name: "Portable Speaker",
        category: "audio",
        categoryName: "Audio Equipment",
        description:
            "Portable speaker system for meetings, parties, and events.",
        rate: 700,
        icon: "🔊",
        available: true
    }
];

/* === DOM ELEMENTS === */
const equipmentGrid = document.getElementById("equipmentGrid");
const equipmentSearch = document.getElementById("equipmentSearch");
const categoryFilter = document.getElementById("categoryFilter");
const noResults = document.getElementById("noResults");

/* === FORMAT CURRENCY === */
function formatCurrency(amount) {
    return `₱${amount.toLocaleString()}`;
}

/* === CREATE EQUIPMENT CARD === */
function createEquipmentCard(equipment) {
    const card = document.createElement("article");
    card.className = "card equipment-card";
    card.innerHTML = `
        <div class="equipment-card-image">
            <span>
                ${equipment.icon}
            </span>
        </div>

        <div class="equipment-card-content">
            <span class="equipment-card-category">
                ${equipment.categoryName}
            </span>

            <h2 class="equipment-card-title">
                ${equipment.name}
            </h2>

            <p class="equipment-card-description">
                ${equipment.description}
            </p>

            <div class="equipment-card-footer">
                <span class="equipment-card-price">
                    ${formatCurrency(equipment.rate)}
                    / day
                </span>

                <span class="equipment-card-status">
                    ${
                        equipment.available
                            ? "Available"
                            : "Unavailable"
                    }
                </span>
            </div>

            <a
                href="rental.html?equipment=${encodeURIComponent(equipment.name)}"
                class="button button-primary"
            >
                Rent Now
            </a>
        </div>
    `;

    return card;
}

/* === DISPLAY EQUIPMENT === */
function displayEquipment(equipmentList) {
    equipmentGrid.innerHTML = "";

    if (equipmentList.length === 0) {
        noResults.hidden = false;
        return;
    }

    noResults.hidden = true;

    equipmentList.forEach(equipment => {
        const card = createEquipmentCard(equipment);
        equipmentGrid.appendChild(card);
    });
}

/* === FILTER EQUIPMENT === */
function filterEquipment() {
    const searchTerm = equipmentSearch.value.trim().toLowerCase();
    const selectedCategory = categoryFilter.value;

    const filteredEquipment = equipmentData.filter(equipment => {
        const matchesSearch = equipment.name.toLowerCase().includes(searchTerm);
        const matchesCategory = selectedCategory === "all" || equipment.category === selectedCategory;
            return (matchesSearch && matchesCategory);
    });


    displayEquipment(filteredEquipment);
}

/* === EVENT LISTENERS === */
if (equipmentSearch) {
    equipmentSearch.addEventListener("input",filterEquipment);
}

if (categoryFilter) {
    categoryFilter.addEventListener("change",filterEquipment);
}

/* === INITIALIZE === */
if (equipmentGrid) {
    displayEquipment(equipmentData);
}