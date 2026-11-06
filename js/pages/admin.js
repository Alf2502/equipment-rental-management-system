
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");

    // Verify administrator access
    if (!token || !user || user.role !== "admin") {
        window.location.href = "login.html";
        return;
    }

    const equipmentForm = document.getElementById("equipmentForm");
    const equipmentTable = document.getElementById("equipmentTable");
    const rentalTable = document.getElementById("rentalTable");
    const equipmentMessage = document.getElementById("equipmentMessage");
    const rentalMessage = document.getElementById("rentalMessage");

    const equipmentId = document.getElementById("equipmentId");
    const equipmentName = document.getElementById("equipmentName");
    const category = document.getElementById("category");
    const categoryName = document.getElementById("categoryName");
    const rate = document.getElementById("rate");
    const icon = document.getElementById("icon");
    const available = document.getElementById("available");
    const description = document.getElementById("description");

    const saveButton = document.getElementById("saveButton");
    const cancelEditButton = document.getElementById("cancelEditButton");
    const logoutButton = document.getElementById("logoutButton");

    async function apiRequest(url, options = {}) {
        const response = await fetch(url, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                ...options.headers
            }
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Request failed.");
        }

        return result;
    }

    function showMessage(element, message) {
        element.textContent = message;
    }

    function createCell(value) {
        const td = document.createElement("td");
        td.textContent = value ?? "";
        return td;
    }

    // EQUIPMENT
    async function loadEquipment() {
        try {
            const result = await apiRequest("/api/equipment");

            equipmentTable.innerHTML = "";

            if (!result.data.length) {
                equipmentTable.appendChild(createCell("No equipment found."));
                return;
            }

            result.data.forEach(item => {
                const row = document.createElement("tr");

                row.append(
                    createCell(item.id),
                    createCell(item.name),
                    createCell(item.categoryName || item.category),
                    createCell(`₱${Number(item.rate).toLocaleString("en-PH")}/day`),
                    createCell(item.available ? "Available" : "Unavailable")
                );

                const actions = document.createElement("td");

                const editButton = document.createElement("button");
                editButton.type = "button";
                editButton.textContent = "Edit";
                editButton.addEventListener("click", () => editEquipment(item));

                const deleteButton = document.createElement("button");
                deleteButton.type = "button";
                deleteButton.textContent = "Delete";
                deleteButton.addEventListener("click", () => deleteEquipment(item.id));

                actions.append(editButton, deleteButton);
                row.appendChild(actions);
                equipmentTable.appendChild(row);
            });
        } catch (error) {
            showMessage(equipmentMessage, error.message);
        }
    }

    function editEquipment(item) {
        equipmentId.value = item.id;
        equipmentName.value = item.name;
        category.value = item.category;
        categoryName.value = item.categoryName || "";
        rate.value = item.rate;
        icon.value = item.icon || "";
        available.checked = Boolean(item.available);
        description.value = item.description || "";

        saveButton.textContent = "Update Equipment";
        cancelEditButton.hidden = false;

        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function resetEquipmentForm() {
        equipmentForm.reset();
        equipmentId.value = "";
        saveButton.textContent = "Save Equipment";
        cancelEditButton.hidden = true;
    }

    equipmentForm.addEventListener("submit", async event => {
        event.preventDefault();

        const id = equipmentId.value;

        const equipment = {
            name: equipmentName.value.trim(),
            category: category.value.trim(),
            categoryName: categoryName.value.trim(),
            rate: Number(rate.value),
            icon: icon.value.trim(),
            available: available.checked,
            description: description.value.trim()
        };

        try {
            const url = id ? `/api/equipment/${id}` : "/api/equipment";
            const method = id ? "PUT" : "POST";

            await apiRequest(url, {
                method,
                body: JSON.stringify(equipment)
            });

            showMessage(
                equipmentMessage,
                id ? "Equipment updated successfully." : "Equipment added successfully."
            );

            resetEquipmentForm();
            await loadEquipment();
        } catch (error) {
            showMessage(equipmentMessage, error.message);
        }
    });

    async function deleteEquipment(id) {
        if (!confirm("Are you sure you want to delete this equipment?")) {
            return;
        }

        try {
            await apiRequest(`/api/equipment/${id}`, {
                method: "DELETE"
            });

            showMessage(equipmentMessage, "Equipment deleted successfully.");
            await loadEquipment();
        } catch (error) {
            showMessage(equipmentMessage, error.message);
        }
    }

    cancelEditButton.addEventListener("click", resetEquipmentForm);

    // RENTAL REQUESTS
    async function loadRentals() {
        try {
            const result = await apiRequest("/api/rentals");

            rentalTable.innerHTML = "";

            if (!result.data.length) {
                rentalTable.appendChild(createCell("No rental requests found."));
                return;
            }

            result.data.forEach(rental => {
                const row = document.createElement("tr");

                row.append(
                    createCell(rental.id),
                    createCell(rental.customer || rental.customerName || rental.userId),
                    createCell(rental.equipmentName || rental.equipmentId),
                    createCell(`${rental.startDate} to ${rental.endDate}`),
                    createCell(`₱${Number(rental.totalAmount).toLocaleString("en-PH", {
                        minimumFractionDigits: 2
                    })}`),
                    createCell(rental.status)
                );

                const actions = document.createElement("td");

                const statusSelect = document.createElement("select");

                ["pending", "approved", "active", "completed", "cancelled"].forEach(status => {
                    const option = document.createElement("option");
                    option.value = status;
                    option.textContent = status.charAt(0).toUpperCase() + status.slice(1);
                    statusSelect.appendChild(option);
                });

                statusSelect.value = rental.status;

                const updateButton = document.createElement("button");
                updateButton.type = "button";
                updateButton.textContent = "Update";

                updateButton.addEventListener("click", () => {
                    updateRentalStatus(rental.id, statusSelect.value);
                });

                actions.append(statusSelect, updateButton);
                row.appendChild(actions);
                rentalTable.appendChild(row);
            });
        } catch (error) {
            showMessage(rentalMessage, error.message);
        }
    }

    async function updateRentalStatus(id, status) {
        try {
            await apiRequest(`/api/rentals/${id}/status`, {
                method: "PUT",
                body: JSON.stringify({ status })
            });

            showMessage(rentalMessage, "Rental status updated successfully.");
            await loadRentals();
        } catch (error) {
            showMessage(rentalMessage, error.message);
        }
    }

    // LOGOUT
    logoutButton.addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "login.html";
    });

    // INITIALIZE DASHBOARD
    loadEquipment();
    loadRentals();
});
