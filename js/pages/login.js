
document.addEventListener("DOMContentLoaded", () => {

    const loginSection = document.getElementById("loginSection");
    const registerSection = document.getElementById("registerSection");

    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    const loginMessage = document.getElementById("loginMessage");
    const registerMessage = document.getElementById("registerMessage");

    // SWITCH TO REGISTRATION
    document.getElementById("showRegister").addEventListener("click", event => {
        event.preventDefault();

        loginSection.classList.add("hidden");
        registerSection.classList.remove("hidden");
    });

    // SWITCH TO LOGIN
    document.getElementById("showLogin").addEventListener("click", event => {
        event.preventDefault();

        registerSection.classList.add("hidden");
        loginSection.classList.remove("hidden");
    });

    // LOGIN
    loginForm.addEventListener("submit", async event => {
        event.preventDefault();

        loginMessage.textContent = "Logging in...";

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Login failed.");
            }

            localStorage.setItem("token", result.token);
            localStorage.setItem("user", JSON.stringify(result.user));

            window.location.href =
                result.user.role === "admin"
                    ? "admin.html"
                    : "equipment.html";

        } catch (error) {
            loginMessage.textContent = error.message;
        }
    });

    // REGISTRATION
    registerForm.addEventListener("submit", async event => {
        event.preventDefault();

        registerMessage.textContent = "Creating account...";

        const firstName = document.getElementById("firstName").value.trim();
        const lastName = document.getElementById("lastName").value.trim();
        const email = document.getElementById("registerEmail").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const password = document.getElementById("registerPassword").value;

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    email,
                    phone,
                    password
                })
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Registration failed.");
            }

            registerMessage.textContent =
                "Account created successfully! You can now log in.";

            registerForm.reset();

        } catch (error) {
            registerMessage.textContent = error.message;
        }
    });

});
