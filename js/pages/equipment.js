let equipmentData = [];

const equipmentGrid = document.getElementById("equipmentGrid");
const equipmentSearch = document.getElementById("equipmentSearch");
const categoryFilter = document.getElementById("categoryFilter");
const noResults = document.getElementById("noResults");

// Format prices in Philippine pesos
function formatCurrency(amount) {
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        maximumFractionDigits: 0
    }).format(amount);
}

// Escape text before inserting API data into HTML
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}

// Create an equipment card
function createEquipmentCard(equipment) {
    const availability = equipment.available
        ? "Available"
        : "Unavailable";

    const button = equipment.available
        ? `<a href="rental.html?equipment=${encodeURIComponent(equipment.id)}"
              class="button button-primary">
              Rent Now
           </a>`
        : `<button class="button button-secondary" disabled>
              Unavailable
           </button>`;

    return `
        <article class="card">
            <div class="equipment-card-image">
                <span aria-hidden="true">${escapeHTML(equipment.icon)}</span>
            </div>

            <div class="equipment-card-content">
                <span class="equipment-category">
                    ${escapeHTML(equipment.categoryName)}
                </span>

                <h2 class="equipment-card-title">
                    ${escapeHTML(equipment.name)}
                </h2>

                <p class="equipment-card-description">
                    ${escapeHTML(equipment.description)}
                </p>

                <div class="equipment-card-footer">
                    <div class="equipment-price">
                        <strong>${formatCurrency(equipment.rate)}</strong>
                        <span>/ day</span>
                    </div>

                    <span class="equipment-status ${
                        equipment.available ? "available" : "unavailable"
                    }">
                        ${availability}
                    </span>
                </div>

                ${button}
            </div>
        </article>
    `;
}

// Display equipment cards
function displayEquipment(items) {
    if (items.length === 0) {
        equipmentGrid.innerHTML = "";
        noResults.hidden = false;
        return;
    }

    noResults.hidden = true;

    equipmentGrid.innerHTML = items
        .map(createEquipmentCard)
        .join("");
}

// Filter equipment by name and category
function filterEquipment() {
    const searchTerm = equipmentSearch.value
        .trim()
        .toLowerCase();

    const selectedCategory = categoryFilter.value;

    const filteredEquipment = equipmentData.filter(equipment => {
        const matchesSearch =
            equipment.name.toLowerCase().includes(searchTerm) ||
            equipment.description.toLowerCase().includes(searchTerm);

        const matchesCategory =
            selectedCategory === "all" ||
            equipment.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    displayEquipment(filteredEquipment);
}

// Retrieve equipment from the Express API
async function loadEquipment() {
    try {
        equipmentGrid.innerHTML = "<p>Loading equipment...</p>";

        const response = await apiRequest("/equipment");

        if (!response.success) {
            throw new Error("Unable to retrieve equipment.");
        }

        equipmentData = response.data;

        filterEquipment();
    } catch (error) {
        console.error("Equipment loading error:", error);

        equipmentGrid.innerHTML = `
            <p role="alert">
                Error: ${escapeHTML(error.message)}
                Unable to load equipment. Please try again later.
            </p>
        `;

        noResults.hidden = true;
    }
}

// Search and category filter events
equipmentSearch.addEventListener("input", filterEquipment);
categoryFilter.addEventListener("change", filterEquipment);

// Load equipment when the page opens
loadEquipment();