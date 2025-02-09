const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const signinForm = document.querySelector(".signin-form");
const signupFormDiv = document.querySelector(".signup-form");
const signupLink = document.getElementById("signup-link");
const loginLink = document.getElementById("login-link");

// Show error message function
const showError = (inputElement, message) => {
    const errorElement = inputElement.parentElement.querySelector('.error-message');
    errorElement.textContent = message;
    inputElement.style.borderColor = '#ff4747';
};

// Clear error message function
const clearError = (inputElement) => {
    const errorElement = inputElement.parentElement.querySelector('.error-message');
    errorElement.textContent = '';
    inputElement.style.borderColor = 'rgba(255, 255, 255, 0.2)';
};

// Form validation function
const validateForm = (formInputs) => {
    let isValid = true;
    formInputs.forEach(input => {
        if (!input.value.trim()) {
            showError(input, `${input.placeholder} is required`);
            isValid = false;
        } else {
            clearError(input);
        }
    });
    return isValid;
};

// Toggle between login and signup forms with animation
signupLink.addEventListener("click", (e) => {
    e.preventDefault();
    signinForm.classList.remove("active");
    void signupFormDiv.offsetWidth; // Trigger reflow
    signupFormDiv.classList.add("active");
});

loginLink.addEventListener("click", (e) => {
    e.preventDefault();
    signupFormDiv.classList.remove("active");
    void signinForm.offsetWidth; // Trigger reflow
    signinForm.classList.add("active");
});

// Login functionality
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email");
    const password = document.getElementById("password");

    if (!validateForm([email, password])) return;

    try {
        const res = await fetch("http://localhost:8080/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: email.value,
                password: password.value
            }),
        });

        const data = await res.json();

        if (res.ok) {
            localStorage.setItem("user-info", JSON.stringify(data));
            window.location.href = "/";
        } else {
            showError(email, data.message || "Invalid email or password");
        }
    } catch (error) {
        console.error("Error:", error);
        showError(email, "An error occurred. Please try again later.");
    }
});

// Signup functionality
signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fullname = document.getElementById("fullname");
    const email = document.getElementById("sEmail");
    const password = document.getElementById("pass");
    const confirmPassword = document.getElementById("cPass");

    if (!validateForm([fullname, email, password, confirmPassword])) return;

    if (password.value !== confirmPassword.value) {
        showError(confirmPassword, "Passwords do not match");
        return;
    }

    try {
        const res = await fetch("http://localhost:8080/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                fullname: fullname.value,
                email: email.value,
                password: password.value
            }),
        });

        const data = await res.json();

        if (res.ok) {
            localStorage.setItem("user-info", JSON.stringify(data));
            window.location.href = "/";
        } else {
            showError(email, data.message || "Error during signup. Please try again.");
        }
    } catch (error) {
        console.error("Error:", error);
        showError(email, "An error occurred. Please try again later.");
    }
});

// Add input event listeners to clear errors on type
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', () => clearError(input));
});
