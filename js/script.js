console.log("Equipment Rental Management System is loaded...");

/*=================================
    Equipment Search and Filter
=================================*/
const searchInput = document.getElementById("equipmentSearch");
const categoryFilter = document.getElementById("categoryFilter");
const equipmentCards = document.querySelectorAll(".equipment-card");
const noResults = document.getElementById("noResults");

function filterEquipment() {
    const searchValue = searchInput.value.toLowerCase();
    const categoryValue = categoryFilter.value;

    let visibleCards = 0;

    equipmentCards.forEach(card => {
        const equipmentName =
            card.dataset.name.toLowerCase();

        const equipmentCategory =
            card.dataset.category;

        const matchesSearch =
            equipmentName.includes(searchValue);

        const matchesCategory =
            categoryValue === "all" ||
            equipmentCategory === categoryValue;

        if (matchesSearch && matchesCategory) {
            card.style.display = "block";
            visibleCards++;
        } else {
            card.style.display = "none";
        }
    });

    if (visibleCards === 0) {
        noResults.style.display = "block";
    } else {
        noResults.style.display = "none";
    }
}

if (searchInput && categoryFilter) {
    searchInput.addEventListener(
        "input",
        filterEquipment
    );
    categoryFilter.addEventListener(
        "change",
        filterEquipment
    );
}