/**
 * Hello World App - Authentication Logic
 * Uses browser localStorage for user registration, login, and session persistence.
 */

// ===== DOM Elements =====
const authCard = document.getElementById('authCard');
const dashboardCard = document.getElementById('dashboardCard');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginTab = document.getElementById('loginTab');
const registerTab = document.getElementById('registerTab');
const loginError = document.getElementById('loginError');
const registerError = document.getElementById('registerError');
const registerSuccess = document.getElementById('registerSuccess');
const displayUsername = document.getElementById('displayUsername');

// ===== Tab Switching =====
/**
 * Switch between Login and Register forms
 * @param {string} tab - 'login' or 'register'
 */
function switchTab(tab) {
    if (tab === 'login') {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
    } else {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        loginTab.classList.remove('active');
        registerTab.classList.add('active');
    }

    // Clear any previous messages
    loginError.textContent = '';
    registerError.textContent = '';
    registerSuccess.textContent = '';
}

// ===== Helper: Get all registered users from localStorage =====
/**
 * Retrieves the list of registered users from localStorage.
 * @returns {Array} Array of user objects
 */
function getUsers() {
    const users = localStorage.getItem('registeredUsers');
    return users ? JSON.parse(users) : [];
}

// ===== Helper: Save users list to localStorage =====
/**
 * Saves the list of registered users to localStorage.
 * @param {Array} users - Array of user objects
 */
function saveUsers(users) {
    localStorage.setItem('registeredUsers', JSON.stringify(users));
}

// ===== Register =====
/**
 * Handles user registration.
 * Validates input, checks for duplicate usernames, and stores the new user.
 * @param {Event} event - Form submit event
 */
function registerUser(event) {
    event.preventDefault();

    const username = document.getElementById('registerUsername').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;

    // Clear previous messages
    registerError.textContent = '';
    registerSuccess.textContent = '';

    // Validate: password length
    if (password.length < 4) {
        registerError.textContent = 'Password must be at least 4 characters long.';
        return;
    }

    // Validate: passwords match
    if (password !== confirmPassword) {
        registerError.textContent = 'Passwords do not match. Please try again.';
        return;
    }

    // Check if username already exists
    const users = getUsers();
    const existingUser = users.find((user) => user.username.toLowerCase() === username.toLowerCase());

    if (existingUser) {
        registerError.textContent = 'Username is already taken. Please choose another.';
        return;
    }

    // Create new user
    const newUser = {
        username: username,
        password: password
    };

    // Save user
    users.push(newUser);
    saveUsers(users);

    // Show success message
    registerSuccess.textContent = 'Account created successfully! You can now login.';

    // Clear form fields
    document.getElementById('registerUsername').value = '';
    document.getElementById('registerPassword').value = '';
    document.getElementById('registerConfirmPassword').value = '';

    // Switch to login tab after a short delay
    setTimeout(() => {
        switchTab('login');
    }, 1500);
}

// ===== Login =====
/**
 * Handles user login.
 * Validates credentials and sets the active session.
 * @param {Event} event - Form submit event
 */
function loginUser(event) {
    event.preventDefault();

    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;

    // Clear previous messages
    loginError.textContent = '';

    // Get registered users
    const users = getUsers();

    // Find matching user
    const foundUser = users.find(
        (user) => user.username.toLowerCase() === username.toLowerCase() && user.password === password
    );

    if (foundUser) {
        // Store the logged-in username in sessionStorage for persistence across refreshes
        localStorage.setItem('currentUser', foundUser.username);
        showDashboard(foundUser.username);
    } else {
        loginError.textContent = 'Invalid username or password. Please try again.';
    }

    // Clear form fields
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
}

// ===== Logout =====
/**
 * Handles user logout.
 * Clears the current session and shows the auth card.
 */
function logout() {
    // Remove current user from localStorage
    localStorage.removeItem('currentUser');

    // Clear login error
    loginError.textContent = '';

    // Switch to auth card with login form visible
    dashboardCard.classList.add('hidden');
    authCard.classList.remove('hidden');

    // Reset to login tab
    switchTab('login');
}

// ===== Show Dashboard =====
/**
 * Displays the dashboard with the user's greeting.
 * @param {string} username - The logged-in user's username
 */
function showDashboard(username) {
    displayUsername.textContent = username;
    authCard.classList.add('hidden');
    dashboardCard.classList.remove('hidden');
}

// ===== Show Auth Card =====
/**
 * Displays the authentication card (login/register forms).
 */
function showAuthCard() {
    dashboardCard.classList.add('hidden');
    authCard.classList.remove('hidden');
}

// ===== Check Session on Page Load =====
/**
 * On page load, checks if there is an active session in localStorage.
 * If a valid user exists, shows the dashboard; otherwise shows the auth card.
 */
function checkSession() {
    const currentUser = localStorage.getItem('currentUser');

    if (currentUser) {
        // Verify the user still exists in registered users
        const users = getUsers();
        const validUser = users.find(
            (user) => user.username.toLowerCase() === currentUser.toLowerCase()
        );

        if (validUser) {
            showDashboard(validUser.username);
            return;
        }
    }

    // No valid session, show auth card
    showAuthCard();
}

// ===== Event Listeners =====
loginForm.addEventListener('submit', loginUser);
registerForm.addEventListener('submit', registerUser);

// ===== Initialize App =====
checkSession();