/**
 * Hello World App - Authentication Logic
 * Uses Supabase Auth for real user registration, login, and session management.
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

// ===== Register =====
/**
 * Handles user registration via Supabase Auth.
 * Validates input, creates a new user, and stores additional data in the users table.
 * @param {Event} event - Form submit event
 */
async function registerUser(event) {
    event.preventDefault();

    const email = document.getElementById('registerUsername').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;

    // Clear previous messages
    registerError.textContent = '';
    registerSuccess.textContent = '';

    // Validate: password length
    if (password.length < 6) {
        registerError.textContent = 'Password must be at least 6 characters long.';
        return;
    }

    // Validate: passwords match
    if (password !== confirmPassword) {
        registerError.textContent = 'Passwords do not match. Please try again.';
        return;
    }

    // Validate: email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        registerError.textContent = 'Please enter a valid email address.';
        return;
    }

    try {
        // Sign up with Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password
        });

        if (error) {
            if (error.message.includes('User already registered')) {
                registerError.textContent = 'This email is already registered. Please login instead.';
            } else {
                registerError.textContent = error.message;
            }
            return;
        }

        // If the user object was created, store additional data in the users table
        if (data.user) {
            const { error: insertError } = await supabase
                .from('users')
                .insert([{
                    id: data.user.id,
                    email: email,
                    created_at: new Date().toISOString()
                }]);

            if (insertError) {
                console.error('Error saving user data:', insertError);
                // Continue anyway - auth is still successful
            }
        }

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

    } catch (err) {
        registerError.textContent = 'An unexpected error occurred. Please try again.';
        console.error(err);
    }
}

// ===== Login =====
/**
 * Handles user login via Supabase Auth.
 * Validates credentials and shows the dashboard on success.
 * @param {Event} event - Form submit event
 */
async function loginUser(event) {
    event.preventDefault();

    const email = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;

    // Clear previous messages
    loginError.textContent = '';

    try {
        // Sign in with Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            if (error.message.includes('Invalid login credentials')) {
                loginError.textContent = 'Invalid email or password. Please try again.';
            } else {
                loginError.textContent = error.message;
            }
            return;
        }

        // Show dashboard with the user's email
        if (data.user) {
            const displayName = data.user.email || email;
            showDashboard(displayName);
        }

        // Clear form fields
        document.getElementById('loginUsername').value = '';
        document.getElementById('loginPassword').value = '';

    } catch (err) {
        loginError.textContent = 'An unexpected error occurred. Please try again.';
        console.error(err);
    }
}

// ===== Logout =====
/**
 * Handles user logout via Supabase Auth.
 * Clears the session and shows the auth card.
 */
async function logout() {
    try {
        await supabase.auth.signOut();
    } catch (err) {
        console.error('Error during logout:', err);
    }

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
 * @param {string} name - The logged-in user's display name (email)
 */
function showDashboard(name) {
    displayUsername.textContent = name;
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
 * On page load, checks if there is an active Supabase session.
 * If a valid session exists, shows the dashboard; otherwise shows the auth card.
 */
async function checkSession() {
    try {
        const { data, error } = await supabase.auth.getSession();

        if (data && data.session && data.session.user) {
            const displayName = data.session.user.email || data.session.user.id;
            showDashboard(displayName);
            return;
        }
    } catch (err) {
        console.error('Error checking session:', err);
    }

    // No valid session, show auth card
    showAuthCard();
}

// ===== Listen for Auth State Changes =====
/**
 * Listens for Supabase auth state changes (e.g., logout from another tab).
 */
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
        showAuthCard();
    } else if (event === 'SIGNED_IN' && session) {
        const displayName = session.user.email || session.user.id;
        showDashboard(displayName);
    }
});

// ===== Event Listeners =====
loginForm.addEventListener('submit', loginUser);
registerForm.addEventListener('submit', registerUser);

// ===== Initialize App =====
checkSession();