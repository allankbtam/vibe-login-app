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

    // Check supabase client is available
    if (!supabase) {
        registerError.textContent = 'Supabase client not initialized. Check console for details.';
        return;
    }

    // Validate: email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        registerError.textContent = 'Please enter a valid email address.';
        return;
    }

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

    console.log('Attempting registration for:', email);

    try {
        // Sign up with Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password
        });

        console.log('Supabase signUp response:', { data, error });

        if (error) {
            if (error.message.includes('User already registered')) {
                registerError.textContent = 'This email is already registered. Please login instead.';
            } else {
                registerError.textContent = error.message;
            }
            return;
        }

        // User created successfully - data will be auto-inserted via database trigger
        if (data.user) {
            console.log('New user created with ID:', data.user.id);
            console.log('User email:', data.user.email);
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
        console.error('Registration error:', err);
    }
}

// ===== Login =====
/**
 * Handles user login via Supabase Auth.
 * @param {Event} event - Form submit event
 */
async function loginUser(event) {
    event.preventDefault();

    const email = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;

    // Clear previous messages
    loginError.textContent = '';

    // Check supabase client is available
    if (!supabase) {
        loginError.textContent = 'Supabase client not initialized. Check console for details.';
        return;
    }

    console.log('Attempting login for:', email);

    try {
        // Sign in with Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        console.log('Supabase signIn response:', { data, error });

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
        console.error('Login error:', err);
    }
}

// ===== Logout =====
/**
 * Handles user logout via Supabase Auth.
 */
async function logout() {
    try {
        if (supabase) {
            await supabase.auth.signOut();
        }
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
 */
async function checkSession() {
    if (!supabase) {
        console.error('Cannot check session: Supabase client not initialized.');
        showAuthCard();
        return;
    }

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
if (supabase) {
    supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT') {
            showAuthCard();
        } else if (event === 'SIGNED_IN' && session) {
            const displayName = session.user.email || session.user.id;
            showDashboard(displayName);
        }
    });
}

// ===== Event Listeners =====
loginForm.addEventListener('submit', loginUser);
registerForm.addEventListener('submit', registerUser);

// ===== Initialize App =====
checkSession();