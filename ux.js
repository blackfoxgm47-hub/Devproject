// Global UX Functions for Chicken Hatching Evaluation System

// Loading Functions
function showLoading(text = 'กำลังโหลดข้อมูล...') {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        const loadingText = loadingOverlay.querySelector('.loading-text');
        if (loadingText) {
            loadingText.textContent = text;
        }
        loadingOverlay.classList.add('show');
    }
}

function hideLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.classList.remove('show');
    }
}

// Toast Notification Functions
function showToast(message, type = 'success', duration = 3000) {
    const toast = document.getElementById('toast');
    if (!toast) return;

    // Remove existing classes
    toast.classList.remove('success', 'error', 'warning', 'show');

    // Add type class
    toast.classList.add(type);

    // Set icon and message
    const icon = toast.querySelector('.toast-icon');
    const msg = toast.querySelector('.toast-message');

    if (icon) {
        switch (type) {
            case 'success':
                icon.textContent = '✓';
                break;
            case 'error':
                icon.textContent = '✕';
                break;
            case 'warning':
                icon.textContent = '⚠';
                break;
            default:
                icon.textContent = 'ℹ';
        }
    }

    if (msg) {
        msg.textContent = message;
    }

    // Show toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // Hide after duration
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// Success Animation Functions
function showSuccessAnimation(text = 'บันทึกสำเร็จ!', duration = 2000) {
    const successAnimation = document.getElementById('successAnimation');
    if (!successAnimation) return;

    const successText = successAnimation.querySelector('.success-text');
    if (successText) {
        successText.textContent = text;
    }

    successAnimation.classList.add('show');

    setTimeout(() => {
        successAnimation.classList.remove('show');
    }, duration);
}

// Confirm Dialog Functions
function showConfirmDialog(message, onConfirm, onCancel) {
    // Create modal if it doesn't exist
    let confirmModal = document.getElementById('confirmModal');
    if (!confirmModal) {
        confirmModal = document.createElement('div');
        confirmModal.id = 'confirmModal';
        confirmModal.className = 'modal';
        confirmModal.innerHTML = `
            <div class="modal-content modal-small">
                <div class="modal-header">
                    <h3 class="modal-title">ยืนยันการดำเนินการ</h3>
                    <button class="modal-close" onclick="closeConfirmDialog()">×</button>
                </div>
                <div class="modal-body">
                    <p class="delete-message" id="confirmMessage"></p>
                    <p class="delete-warning">การกระทำนี้ไม่สามารถย้อนกลับได้</p>
                </div>
                <div class="modal-footer">
                    <button onclick="closeConfirmDialog()" class="btn btn-clear">ยกเลิก</button>
                    <button onclick="executeConfirm()" class="btn btn-delete">ยืนยัน</button>
                </div>
            </div>
        `;
        document.body.appendChild(confirmModal);
    }

    // Set message
    const confirmMessage = document.getElementById('confirmMessage');
    if (confirmMessage) {
        confirmMessage.textContent = message;
    }

    // Store callbacks
    window.confirmCallback = onConfirm;
    window.cancelCallback = onCancel;

    // Show modal
    confirmModal.classList.add('show');
}

function closeConfirmDialog() {
    const confirmModal = document.getElementById('confirmModal');
    if (confirmModal) {
        confirmModal.classList.remove('show');
    }

    if (window.cancelCallback) {
        window.cancelCallback();
        window.cancelCallback = null;
    }
}

function executeConfirm() {
    const confirmModal = document.getElementById('confirmModal');
    if (confirmModal) {
        confirmModal.classList.remove('show');
    }

    if (window.confirmCallback) {
        window.confirmCallback();
        window.confirmCallback = null;
    }
}

// Skeleton Loading Functions
function showSkeleton(containerId, type = 'card') {
    const container = document.getElementById(containerId);
    if (!container) return;

    let skeletonHTML = '';
    
    switch (type) {
        case 'card':
            skeletonHTML = '<div class="skeleton skeleton-card"></div>';
            break;
        case 'text':
            skeletonHTML = '<div class="skeleton skeleton-text"></div>';
            break;
        case 'text-lg':
            skeletonHTML = '<div class="skeleton skeleton-text-lg"></div>';
            break;
        case 'text-sm':
            skeletonHTML = '<div class="skeleton skeleton-text-sm"></div>';
            break;
        case 'avatar':
            skeletonHTML = '<div class="skeleton skeleton-avatar"></div>';
            break;
        case 'button':
            skeletonHTML = '<div class="skeleton skeleton-button"></div>';
            break;
        default:
            skeletonHTML = '<div class="skeleton skeleton-card"></div>';
    }

    container.innerHTML = skeletonHTML;
}

function hideSkeleton(containerId, content) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = content;
}

// Keyboard Navigation
function handleKeyboardNavigation(event) {
    // Add keyboard-nav class to body when using keyboard
    if (event.key === 'Tab') {
        document.body.classList.add('keyboard-nav');
    }

    // Remove keyboard-nav class when using mouse
    document.addEventListener('mousedown', function removeKeyboardNav() {
        document.body.classList.remove('keyboard-nav');
        document.removeEventListener('mousedown', removeKeyboardNav);
    }, { once: true });
}

// Initialize UX
document.addEventListener('DOMContentLoaded', function() {
    // Add keyboard navigation listener
    document.addEventListener('keydown', handleKeyboardNavigation);

    // Add ripple effect to all buttons
    const buttons = document.querySelectorAll('.btn, .hero-btn');
    buttons.forEach(button => {
        if (!button.classList.contains('ripple')) {
            button.classList.add('ripple');
        }
    });
});

// Export functions for use in other files
window.ux = {
    showLoading,
    hideLoading,
    showToast,
    showSuccessAnimation,
    showConfirmDialog,
    closeConfirmDialog,
    showSkeleton,
    hideSkeleton
};
