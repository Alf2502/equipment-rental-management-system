
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("rentalForm");
    const equipmentSelect = document.getElementById("equipmentId");
    const startDateInput = document.getElementById("startDate");
    const endDateInput = document.getElementById("endDate");
    const totalDisplay = document.getElementById("totalAmount");
    const message = document.getElementById("rentalMessage");

    let equipmentList = [];

    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    async function loadEquipment() {
        try {
            const response = await fetch("/api/equipment");
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error("Unable to load equipment.");
            }

            equipmentList = result.data.filter(item => item.available);

            equipmentSelect.innerHTML =
                '<option value="">Select equipment</option>';

            equipmentList.forEach(item => {
                const option = document.createElement("option");
                option.value = item.id;
                option.textContent =
                    `${item.name} - ₱${Number(item.rate).toLocaleString("en-PH")}/day`;
                equipmentSelect.appendChild(option);
            });

            const params = new URLSearchParams(window.location.search);
            const selectedId = params.get("equipment");

            if (selectedId) {
                equipmentSelect.value = selectedId;
            }

            calculateTotal();
        } catch (error) {
            message.textContent = error.message;
        }
    }

    function calculateTotal() {
        const selected = equipmentList.find(
            item => Number(item.id) === Number(equipmentSelect.value)
        );

        const start = startDateInput.value;
        const end = endDateInput.value;

        if (!selected || !start || !end || end < start) {
            totalDisplay.textContent = "₱0.00";
            return;
        }

        const startDate = new Date(`${start}T00:00:00`);
        const endDate = new Date(`${end}T00:00:00`);

        const days = Math.floor(
            (endDate - startDate) / 86400000
        ) + 1;

        const total = days * Number(selected.rate);

        totalDisplay.textContent =
            `₱${total.toLocaleString("en-PH", {
                minimumFractionDigits: 2
            })}`;
    }

    equipmentSelect.addEventListener("change", calculateTotal);
    startDateInput.addEventListener("change", calculateTotal);
    endDateInput.addEventListener("change", calculateTotal);

    form.addEventListener("submit", async event => {
        event.preventDefault();

        message.textContent = "";

        const equipmentId = equipmentSelect.value;
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;

        if (!equipmentId || !startDate || !endDate) {
            message.textContent = "Please complete all required fields.";
            return;
        }

        if (endDate < startDate) {
            message.textContent = "Return date cannot be before rental date.";
            return;
        }

        try {
            const response = await fetch("/api/rentals", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    equipmentId,
                    startDate,
                    endDate
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Booking failed.");
            }

            message.textContent =
                `Booking successful! Your rental ID is ${result.data.id}.`;

            form.reset();
            totalDisplay.textContent = "₱0.00";

        } catch (error) {
            message.textContent = error.message;
        }
    });

    loadEquipment();
});
