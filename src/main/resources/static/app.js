/* =====================================================
   Employee Management System - Frontend Logic
   ===================================================== */

const API_URL = '/api/departments';

/* ========== DOM ELEMENTS ========== */
const departmentsBody = document.getElementById('departmentsBody');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const departmentForm = document.getElementById('departmentForm');
const departmentIdInput = document.getElementById('departmentId');
const nameInput = document.getElementById('nameInput');
const descriptionInput = document.getElementById('descriptionInput');
const searchInput = document.getElementById('searchInput');
const toast = document.getElementById('toast');

/* =====================================================
   INITIALIZATION
   ===================================================== */
document.addEventListener('DOMContentLoaded', () => {
    loadDepartments();
});

/* =====================================================
   LOAD & RENDER DEPARTMENTS
   ===================================================== */
async function loadDepartments() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`Failed to load departments (${response.status})`);
        }

        const departments = await response.json();
        renderDepartments(departments);
    } catch (error) {
        console.error('Error loading departments:', error);
        showToast('Failed to load departments', 'error');
        renderEmptyState();
    }
}

function renderDepartments(departments) {
    if (!departments || departments.length === 0) {
        renderEmptyState();
        return;
    }

    departmentsBody.innerHTML = departments.map(dept => `
        <tr>
            <td class="dept-id">#${dept.id}</td>
            <td class="dept-name">${escapeHtml(dept.name)}</td>
            <td class="dept-description" title="${escapeHtml(dept.description || '')}">
                ${escapeHtml(dept.description || '—')}
            </td>
            <td class="timestamp">${formatDate(dept.createdAt)}</td>
            <td class="timestamp">${formatDate(dept.updatedAt)}</td>
            <td>
                <div class="actions-cell">
                    <button class="btn btn-edit" onclick="openEditModal(${dept.id})">Edit</button>
                    <button class="btn btn-delete" onclick="handleDelete(${dept.id}, '${escapeJs(dept.name)}')">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function renderEmptyState() {
    departmentsBody.innerHTML = `
        <tr>
            <td colspan="6" class="empty-state">
                No departments yet. Click "Add Department" to create one.
            </td>
        </tr>
    `;
}

/* =====================================================
   CREATE / EDIT
   ===================================================== */
function openCreateModal() {
    departmentIdInput.value = '';
    nameInput.value = '';
    descriptionInput.value = '';
    modalTitle.textContent = 'Add Department';
    modal.classList.add('active');
    setTimeout(() => nameInput.focus(), 100);
}

async function openEditModal(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);

        if (!response.ok) {
            throw new Error(`Failed to load department #${id}`);
        }

        const dept = await response.json();
        departmentIdInput.value = dept.id;
        nameInput.value = dept.name;
        descriptionInput.value = dept.description || '';
        modalTitle.textContent = `Edit Department #${dept.id}`;
        modal.classList.add('active');
        setTimeout(() => nameInput.focus(), 100);
    } catch (error) {
        console.error('Error opening edit modal:', error);
        showToast('Failed to load department details', 'error');
    }
}

async function handleSubmit(event) {
    event.preventDefault();

    const id = departmentIdInput.value;
    const payload = {
        name: nameInput.value.trim(),
        description: descriptionInput.value.trim()
    };

    const isUpdate = Boolean(id);
    const url = isUpdate ? `${API_URL}/${id}` : API_URL;
    const method = isUpdate ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            showToast(
                isUpdate ? 'Department updated successfully' : 'Department created successfully',
                'success'
            );
            closeModal();
            loadDepartments();
            return;
        }

        // Handle error response
        const errorData = await response.json().catch(() => ({}));
        const message = extractErrorMessage(errorData, response.status);
        showToast(message, 'error');
    } catch (error) {
        console.error('Submit error:', error);
        showToast('Network error. Please try again.', 'error');
    }
}

/* =====================================================
   DELETE
   ===================================================== */
async function handleDelete(id, name) {
    const confirmed = confirm(`Are you sure you want to delete "${name}"?`);
    if (!confirmed) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });

        if (response.ok || response.status === 204) {
            showToast('Department deleted successfully', 'success');
            loadDepartments();
            return;
        }

        const errorData = await response.json().catch(() => ({}));
        showToast(extractErrorMessage(errorData, response.status), 'error');
    } catch (error) {
        console.error('Delete error:', error);
        showToast('Network error. Please try again.', 'error');
    }
}

/* =====================================================
   SEARCH
   ===================================================== */
let searchTimeout = null;

function handleSearch(event) {
    clearTimeout(searchTimeout);
    const keyword = event.target.value.trim();

    searchTimeout = setTimeout(() => {
        if (!keyword) {
            loadDepartments();
            return;
        }
        performSearch(keyword);
    }, 300);
}

async function performSearch(keyword) {
    try {
        const response = await fetch(`${API_URL}/search?keyword=${encodeURIComponent(keyword)}`);

        if (!response.ok) {
            throw new Error(`Search failed (${response.status})`);
        }

        const departments = await response.json();
        renderDepartments(departments);
    } catch (error) {
        console.error('Search error:', error);
        showToast('Search failed', 'error');
    }
}

/* =====================================================
   MODAL HELPERS
   ===================================================== */
function closeModal() {
    modal.classList.remove('active');
}

function closeModalOnOverlay(event) {
    if (event.target === modal) {
        closeModal();
    }
}

// Close modal with Escape key
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
    }
});

/* =====================================================
   TOAST NOTIFICATIONS
   ===================================================== */
let toastTimeout = null;

function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `toast ${type} show`;

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 3500);
}

/* =====================================================
   UTILITIES
   ===================================================== */
function extractErrorMessage(errorData, status) {
    if (errorData.errors) {
        // Validation errors: { "name": "message", ... }
        const firstError = Object.values(errorData.errors)[0];
        return firstError || `Validation failed (${status})`;
    }
    if (errorData.message) {
        return errorData.message;
    }
    return `Request failed (${status})`;
}

function formatDate(isoString) {
    if (!isoString) return '—';
    try {
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now - date;
        const diffMin = Math.floor(diffMs / 60000);
        const diffHr = Math.floor(diffMs / 3600000);
        const diffDay = Math.floor(diffMs / 86400000);

        if (diffMin < 1) return 'Just now';
        if (diffMin < 60) return `${diffMin} min ago`;
        if (diffHr < 24) return `${diffHr} hr ago`;
        if (diffDay < 7) return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;

        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    } catch {
        return isoString;
    }
}

function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
}

function escapeJs(text) {
    if (text === null || text === undefined) return '';
    return String(text).replace(/'/g, "\\'").replace(/"/g, '\\"');
}