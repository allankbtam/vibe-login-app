/**
 * Hello World App - Authentication & Admin Logic
 * Uses Supabase Auth + profiles table for user management.
 * ES Module - imports from supabase-config.js
 */

import { supabase, APP_VERSION } from './supabase-config.js';

// ===== Version Display =====
document.getElementById('versionFooter').textContent = 'v' + APP_VERSION;
document.getElementById('dashboardVersion').textContent = 'v' + APP_VERSION;

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

// Dashboard tabs
const dashHomeTab = document.getElementById('dashHomeTab');
const dashAdminTab = document.getElementById('dashAdminTab');
const dashHome = document.getElementById('dashHome');
const dashAdmin = document.getElementById('dashAdmin');

// Admin elements
const adminLoading = document.getElementById('adminLoading');
const usersTable = document.getElementById('usersTable');
const usersBody = document.getElementById('usersBody');

// Modal elements
const confirmModal = document.getElementById('confirmModal');
const modalTitle = document.getElementById('modalTitle');
const modalMessage = document.getElementById('modalMessage');
const modalCancel = document.getElementById('modalCancel');
const modalConfirm = document.getElementById('modalConfirm');

// Current user profile state
let currentUserProfile = null;

// ===== Expose functions to window for HTML onclick attributes =====
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
    loginError.textContent = '';
    registerError.textContent = '';
    registerSuccess.textContent = '';
}
window.switchTab = switchTab;

/**
 * Switch between Dashboard and Admin tabs
 */
function switchDashTab(tab) {
    if (tab === 'admin') {
        dashHome.classList.add('hidden');
        dashAdmin.classList.remove('hidden');
        dashHomeTab.classList.remove('active');
        dashAdminTab.classList.add('active');
        loadUsers();
    } else {
        dashAdmin.classList.add('hidden');
        dashHome.classList.remove('hidden');
        dashAdminTab.classList.remove('active');
        dashHomeTab.classList.add('active');
    }
}
window.switchDashTab = switchDashTab;

// ===== Fetch User Profile =====
async function fetchProfile(userId) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    if (error) {
        console.error('Error fetching profile:', error);
        return null;
    }
    return data;
}

// ===== Register =====
async function registerUser(event) {
    event.preventDefault();

    const email = document.getElementById('registerUsername').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;

    registerError.textContent = '';
    registerSuccess.textContent = '';

    if (!supabase) {
        registerError.textContent = 'Supabase client not initialized. Check console for details.';
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        registerError.textContent = 'Please enter a valid email address.';
        return;
    }

    if (password.length < 6) {
        registerError.textContent = 'Password must be at least 6 characters long.';
        return;
    }

    if (password !== confirmPassword) {
        registerError.textContent = 'Passwords do not match. Please try again.';
        return;
    }

    try {
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

        if (data.user) {
            console.log('New user created with ID:', data.user.id);
        }

        registerSuccess.textContent = 'Account created successfully! You can now login.';

        document.getElementById('registerUsername').value = '';
        document.getElementById('registerPassword').value = '';
        document.getElementById('registerConfirmPassword').value = '';

        setTimeout(() => {
            switchTab('login');
        }, 1500);

    } catch (err) {
        registerError.textContent = 'An unexpected error occurred. Please try again.';
        console.error('Registration error:', err);
    }
}

// ===== Login =====
async function loginUser(event) {
    event.preventDefault();

    const email = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;

    loginError.textContent = '';

    if (!supabase) {
        loginError.textContent = 'Supabase client not initialized. Check console for details.';
        return;
    }

    try {
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

        if (data.user) {
            // Fetch profile to get username and admin status
            const profile = await fetchProfile(data.user.id);
            currentUserProfile = profile;
            const displayName = profile?.username || data.user.email || email;
            showDashboard(displayName, profile?.is_admin || false);
        }

        document.getElementById('loginUsername').value = '';
        document.getElementById('loginPassword').value = '';

    } catch (err) {
        loginError.textContent = 'An unexpected error occurred. Please try again.';
        console.error('Login error:', err);
    }
}

// ===== Logout =====
async function logout() {
    try {
        if (supabase) {
            await supabase.auth.signOut();
        }
    } catch (err) {
        console.error('Error during logout:', err);
    }

    currentUserProfile = null;
    loginError.textContent = '';

    dashboardCard.classList.add('hidden');
    authCard.classList.remove('hidden');

    // Reset dashboard tabs
    dashHome.classList.remove('hidden');
    dashAdmin.classList.add('hidden');
    dashHomeTab.classList.add('active');
    dashAdminTab.classList.remove('active');

    switchTab('login');
}
window.logout = logout;

// ===== Show Dashboard =====
function showDashboard(name, isAdmin) {
    displayUsername.textContent = name;
    authCard.classList.add('hidden');
    dashboardCard.classList.remove('hidden');

    // Show admin tab only for admins
    if (isAdmin) {
        dashAdminTab.classList.remove('hidden');
    } else {
        dashAdminTab.classList.add('hidden');
    }

    // Ensure home tab is active
    switchDashTab('home');
}

// ===== Show Auth Card =====
function showAuthCard() {
    dashboardCard.classList.add('hidden');
    authCard.classList.remove('hidden');
}

// ===== Load Users (Admin) =====
async function loadUsers() {
    adminLoading.classList.remove('hidden');
    usersTable.classList.add('hidden');

    const { data, error } = await supabase
        .from('profiles')
        .select('id, email, username, is_admin, created_at')
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error loading users:', error);
        adminLoading.textContent = 'Error loading users.';
        return;
    }

    adminLoading.classList.add('hidden');
    usersTable.classList.remove('hidden');

    usersBody.innerHTML = '';

    for (const user of data) {
        const tr = document.createElement('tr');

        // Email
        const emailTd = document.createElement('td');
        emailTd.textContent = user.email || '—';
        tr.appendChild(emailTd);

        // Username
        const usernameTd = document.createElement('td');
        usernameTd.textContent = user.username || '—';
        tr.appendChild(usernameTd);

        // Created
        const createdTd = document.createElement('td');
        createdTd.textContent = new Date(user.created_at).toLocaleDateString();
        tr.appendChild(createdTd);

        // Admin toggle
        const adminTd = document.createElement('td');
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'toggle-switch';
        toggleBtn.textContent = user.is_admin ? 'ON' : 'OFF';
        if (user.is_admin) toggleBtn.classList.add('active');
        toggleBtn.onclick = () => toggleAdmin(user.id, !user.is_admin);
        adminTd.appendChild(toggleBtn);
        tr.appendChild(adminTd);

        // Actions
        const actionsTd = document.createElement('td');
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = () => confirmDelete(user.id, user.email || user.username);
        actionsTd.appendChild(deleteBtn);
        tr.appendChild(actionsTd);

        usersBody.appendChild(tr);
    }
}

// ===== Toggle Admin Role =====
async function toggleAdmin(userId, newRole) {
    const { error } = await supabase
        .from('profiles')
        .update({ is_admin: newRole })
        .eq('id', userId);

    if (error) {
        console.error('Error toggling admin:', error);
        alert('Failed to update admin status.');
        return;
    }

    // If toggling own role, update local state
    const session = await supabase.auth.getSession();
    if (session.data?.session?.user?.id === userId) {
        currentUserProfile.is_admin = newRole;
        if (!newRole) {
            // Demote self → show home tab, hide admin tab
            dashAdminTab.classList.add('hidden');
            switchDashTab('home');
        } else {
            dashAdminTab.classList.remove('hidden');
        }
    }

    // Reload the table
    loadUsers();
}

// ===== Confirm Delete Modal =====
let pendingDeleteId = null;

function confirmDelete(userId, displayName) {
    modalTitle.textContent = 'Delete User';
    modalMessage.textContent = `Are you sure you want to delete "${displayName}"? This cannot be undone.`;
    pendingDeleteId = userId;
    confirmModal.classList.remove('hidden');
}

modalCancel.onclick = () => {
    confirmModal.classList.add('hidden');
    pendingDeleteId = null;
};

modalConfirm.onclick = async () => {
    confirmModal.classList.add('hidden');
    if (!pendingDeleteId) return;

    await deleteUser(pendingDeleteId);
    pendingDeleteId = null;
};

// Close modal on overlay click
confirmModal.onclick = (e) => {
    if (e.target === confirmModal) {
        confirmModal.classList.add('hidden');
        pendingDeleteId = null;
    }
};

// ===== Delete User =====
async function deleteUser(userId) {
    const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

    if (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user.');
        return;
    }

    // Also delete the auth user
    await supabase.auth.admin.deleteUser(userId);

    // Reload table
    loadUsers();
}

// ===== Check Session on Page Load =====
async function checkSession() {
    if (!supabase) {
        console.error('Cannot check session: Supabase client not initialized.');
        showAuthCard();
        return;
    }

    try {
        const { data, error } = await supabase.auth.getSession();

        if (data && data.session && data.session.user) {
            const profile = await fetchProfile(data.session.user.id);
            currentUserProfile = profile;
            const displayName = profile?.username || data.session.user.email || data.session.user.id;
            showDashboard(displayName, profile?.is_admin || false);
            return;
        }
    } catch (err) {
        console.error('Error checking session:', err);
    }

    showAuthCard();
}

// ===== Listen for Auth State Changes =====
if (supabase) {
    supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT') {
            currentUserProfile = null;
            showAuthCard();
        } else if (event === 'SIGNED_IN' && session) {
            const profile = await fetchProfile(session.user.id);
            currentUserProfile = profile;
            const displayName = profile?.username || session.user.email || session.user.id;
            showDashboard(displayName, profile?.is_admin || false);
        }
    });
}

// ===== Event Listeners =====
loginForm.addEventListener('submit', loginUser);
registerForm.addEventListener('submit', registerUser);

// ===== Initialize App =====
checkSession();