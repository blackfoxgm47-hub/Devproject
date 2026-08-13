// Global UX Functions for Chicken Hatching Evaluation System

// Dark Mode Management
function initDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (!darkModeToggle) return;

    // Check for saved preference or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Set initial theme
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        document.documentElement.setAttribute('data-theme', 'dark');
        darkModeToggle.textContent = '☀️';
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        darkModeToggle.textContent = '🌙';
    }

    // Toggle dark mode on click
    darkModeToggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        darkModeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    });

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
        if (!localStorage.getItem('theme')) {
            const newTheme = e.matches ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            darkModeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        }
    });
}

// Offline Mode Management
function initOfflineMode() {
    const offlineIndicator = document.getElementById('offlineIndicator');
    const onlineIndicator = document.getElementById('onlineIndicator');
    
    if (!offlineIndicator || !onlineIndicator) return;

    function updateOnlineStatus() {
        if (navigator.onLine) {
            offlineIndicator.classList.remove('show');
            onlineIndicator.classList.add('show');
            setTimeout(() => {
                onlineIndicator.classList.remove('show');
            }, 3000);
        } else {
            onlineIndicator.classList.remove('show');
            offlineIndicator.classList.add('show');
        }
    }

    // Initial check
    updateOnlineStatus();

    // Listen for online/offline events
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
}

// Auto Save Management
let autoSaveTimer = null;
const AUTO_SAVE_DELAY = 3000; // 3 seconds

function initAutoSave(formId = 'evaluationForm') {
    const form = document.getElementById(formId);
    if (!form) return;

    // Load saved data
    loadAutoSavedData(formId);

    // Listen for input changes
    form.addEventListener('input', function() {
        if (autoSaveTimer) {
            clearTimeout(autoSaveTimer);
        }
        autoSaveTimer = setTimeout(() => {
            saveFormData(form, formId);
        }, AUTO_SAVE_DELAY);
    });

    // Listen for select changes
    form.addEventListener('change', function() {
        if (autoSaveTimer) {
            clearTimeout(autoSaveTimer);
        }
        autoSaveTimer = setTimeout(() => {
            saveFormData(form, formId);
        }, AUTO_SAVE_DELAY);
    });
}

function saveFormData(form, formId) {
    const formData = {};
    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        if (input.type === 'checkbox' || input.type === 'radio') {
            formData[input.name] = input.checked;
        } else {
            formData[input.name] = input.value;
        }
    });

    localStorage.setItem(`autosave_${formId}`, JSON.stringify(formData));
    
    // Show toast notification
    if (window.ux && window.ux.showToast) {
        window.ux.showToast('บันทึกอัตโนมัติแล้ว', 'success');
    }
}

function loadAutoSavedData(formId) {
    const savedData = localStorage.getItem(`autosave_${formId}`);
    if (!savedData) return;

    const formData = JSON.parse(savedData);
    const form = document.getElementById(formId);
    if (!form) return;

    Object.keys(formData).forEach(name => {
        const input = form.querySelector(`[name="${name}"]`);
        if (input) {
            if (input.type === 'checkbox' || input.type === 'radio') {
                input.checked = formData[name];
            } else {
                input.value = formData[name];
            }
        }
    });

    // Show toast notification
    if (window.ux && window.ux.showToast) {
        window.ux.showToast('โหลดข้อมูลที่บันทึกไว้แล้ว', 'info');
    }
}

function clearAutoSavedData(formId) {
    localStorage.removeItem(`autosave_${formId}`);
}

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
    // Initialize dark mode
    initDarkMode();

    // Initialize offline mode
    initOfflineMode();

    // Initialize PWA install
    initPWAInstall();

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

// PWA Install Management
let deferredPrompt;

function initPWAInstall() {
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', function(e) {
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        e.preventDefault();
        // Stash the event so it can be triggered later
        deferredPrompt = e;

        // Show install button
        showInstallButton();
    });

    // Listen for app installed event
    window.addEventListener('appinstalled', function() {
        // Hide install button
        hideInstallButton();
        deferredPrompt = null;
        
        if (window.ux && window.ux.showToast) {
            window.ux.showToast('ติดตั้งแอปพลิเคชันเรียบร้อย', 'success');
        }
    });
}

function showInstallButton() {
    // Check if install button already exists
    if (document.getElementById('installAppBtn')) return;

    const installBtn = document.createElement('button');
    installBtn.id = 'installAppBtn';
    installBtn.className = 'install-app-btn';
    installBtn.innerHTML = '📲 ติดตั้งแอป';
    installBtn.setAttribute('aria-label', 'Install App');
    
    installBtn.addEventListener('click', function() {
        if (deferredPrompt) {
            // Show the install prompt
            deferredPrompt.prompt();
            // Wait for the user to respond to the prompt
            deferredPrompt.userChoice.then(function(choiceResult) {
                if (choiceResult.outcome === 'accepted') {
                    if (window.ux && window.ux.showToast) {
                        window.ux.showToast('กำลังติดตั้งแอป...', 'info');
                    }
                }
                deferredPrompt = null;
            });
        }
    });

    document.body.appendChild(installBtn);
}

function hideInstallButton() {
    const installBtn = document.getElementById('installAppBtn');
    if (installBtn) {
        installBtn.remove();
    }
}

// Backup and Restore Management
async function backupData() {
    try {
        const history = await firebaseApi.getRecords();
        
        const backupData = {
            version: '1.0',
            timestamp: new Date().toISOString(),
            data: history
        };

        const jsonString = JSON.stringify(backupData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `chicken-hatching-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        if (window.ux && window.ux.showToast) {
            window.ux.showToast('สำรองข้อมูลสำเร็จ', 'success');
        }
    } catch (error) {
        console.error('Backup error:', error);
        if (window.ux && window.ux.showToast) {
            window.ux.showToast('สำรองข้อมูลไม่สำเร็จ', 'error');
        }
    }
}

async function restoreData(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = async function(e) {
            try {
                const backupData = JSON.parse(e.target.result);
                
                if (!backupData.data || !Array.isArray(backupData.data)) {
                    throw new Error('Invalid backup format');
                }

                // Confirm restore
                if (window.ux && window.ux.showConfirmDialog) {
                    const confirmed = await new Promise((resolve) => {
                        window.ux.showConfirmDialog(
                            'ยืนยันการคืนค่าข้อมูล',
                            'ข้อมูลเดิมจะถูกแทนที่ คุณต้องการดำเนินการต่อหรือไม่?',
                            () => resolve(true),
                            () => resolve(false)
                        );
                    });

                    if (!confirmed) {
                        resolve(false);
                        return;
                    }
                }

                // Restore data to Firebase
                for (const record of backupData.data) {
                    await firebaseApi.addRecord(record);
                }

                if (window.ux && window.ux.showToast) {
                    window.ux.showToast('คืนค่าข้อมูลสำเร็จ', 'success');
                }
                
                resolve(true);
            } catch (error) {
                console.error('Restore error:', error);
                if (window.ux && window.ux.showToast) {
                    window.ux.showToast('คืนค่าข้อมูลไม่สำเร็จ: ไฟล์ไม่ถูกต้อง', 'error');
                }
                reject(error);
            }
        };

        reader.onerror = function() {
            if (window.ux && window.ux.showToast) {
                window.ux.showToast('อ่านไฟล์ไม่สำเร็จ', 'error');
            }
            reject(new Error('File read error'));
        };

        reader.readAsText(file);
    });
}

// Notification Management
function requestNotificationPermission() {
    if ('Notification' in window) {
        Notification.requestPermission().then(function(permission) {
            if (permission === 'granted') {
                if (window.ux && window.ux.showToast) {
                    window.ux.showToast('อนุญาตการแจ้งเตือนแล้ว', 'success');
                }
            } else {
                if (window.ux && window.ux.showToast) {
                    window.ux.showToast('ปฏิเสธการแจ้งเตือน', 'warning');
                }
            }
        });
    } else {
        if (window.ux && window.ux.showToast) {
            window.ux.showToast('เบราว์เซอร์ไม่รองรับการแจ้งเตือน', 'error');
        }
    }
}

function showNotification(title, options = {}) {
    if ('Notification' in window && Notification.permission === 'granted') {
        const defaultOptions = {
            icon: 'https://cdn-icons-png.flaticon.com/512/3075/3075977.png',
            badge: 'https://cdn-icons-png.flaticon.com/512/3075/3075977.png',
            vibrate: [200, 100, 200]
        };
        
        const notification = new Notification(title, { ...defaultOptions, ...options });
        
        notification.onclick = function() {
            window.focus();
            notification.close();
        };

        // Auto close after 5 seconds
        setTimeout(() => {
            notification.close();
        }, 5000);
    }
}

// Export functions for use in other files
window.ux = {
    showLoading,
    hideLoading,
    showToast,
    showSuccessAnimation,
    showConfirmDialog,
    closeConfirmDialog,
    showSkeleton,
    hideSkeleton,
    initAutoSave,
    clearAutoSavedData,
    backupData,
    restoreData,
    requestNotificationPermission,
    showNotification
};
