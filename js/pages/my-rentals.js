
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");

    const rentalTable = document.getElementById("rentalTable");
    const rentalMessage = document.getElementById("rentalMessage");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    async function loadMyRentals() {
        try {
            const response = await fetch("/api/rentals/my", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Unable to load rentals.");
            }

            const rentals = result.data || [];

            rentalTable.innerHTML = "";
            rentalMessage.textContent = "";

            updateSummary(rentals);

            if (rentals.length === 0) {
                rentalMessage.textContent = "You have no rental records yet.";
                return;
            }

            rentals.forEach(rental => {
                const row = document.createElement("tr");
                const status = String(rental.status).toLowerCase();

                row.append(
                    createCell(rental.id),
                    createCell(
                        rental.equipmentName ||
                        `Equipment #${rental.equipmentId}`
                    ),
                    createCell(`${rental.startDate} to ${rental.endDate}`),
                    createCell(rental.days),
                    createCell(`₱${Number(rental.totalAmount).toLocaleString(
                        "en-PH",
                        { minimumFractionDigits: 2 }
                    )}`),
                    createStatusCell(status)
                );

                const actions = document.createElement("td");

                if (status === "pending") {
                    const cancelButton = document.createElement("button");

                    cancelButton.type = "button";
                    cancelButton.textContent = "Cancel";
                    cancelButton.className = "cancel-rental-button";

                    cancelButton.addEventListener("click", () => {
                        cancelRental(rental.id);
                    });

                    actions.appendChild(cancelButton);
                } else {
                    actions.textContent = "—";
                }

                row.appendChild(actions);
                rentalTable.appendChild(row);
            });

        } catch (error) {
            rentalMessage.textContent = error.message;
        }
    }

    function createCell(value) {
        const cell = document.createElement("td");
        cell.textContent = value ?? "";
        return cell;
    }

    function createStatusCell(status) {
        const cell = document.createElement("td");
        const badge = document.createElement("span");

        badge.className = `rental-status status-${status}`;
        badge.textContent = status;

        cell.appendChild(badge);

        return cell;
    }

    function updateSummary(rentals) {
        document.getElementById("totalRentals").textContent =
            rentals.length;

        document.getElementById("pendingRentals").textContent =
            rentals.filter(r => r.status === "pending").length;

        document.getElementById("activeRentals").textContent =
            rentals.filter(r => r.status === "active").length;

        document.getElementById("completedRentals").textContent =
            rentals.filter(r => r.status === "completed").length;
    }

    async function cancelRental(id) {
        const confirmed = confirm(
            "Are you sure you want to cancel this rental?"
        );

        if (!confirmed) return;

        try {
            const response = await fetch(`/api/rentals/${id}/cancel`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Cancellation failed.");
            }

            rentalMessage.textContent = result.message;

            await loadMyRentals();

        } catch (error) {
            rentalMessage.textContent = error.message;
        }
    }

    loadMyRentals();
});
