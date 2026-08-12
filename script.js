// Configuration
let NUM_CABINETS = 5;
const NUM_ROWS = 3;

// Data structure to store rows for each cabinet
let cabinetRows = {};

// Start production time
let startProdTime = '';

function initializeCabinetRows(cabinetCount = NUM_CABINETS) {
    NUM_CABINETS = cabinetCount;
    cabinetRows = {};

    for (let i = 1; i <= NUM_CABINETS; i++) {
        cabinetRows[i] = {
            hatcher: '',
            rows: []
        };
        for (let j = 1; j <= NUM_ROWS; j++) {
            cabinetRows[i].rows.push({
                id: j,
                dryness: '',
                membrane: '',
                cleanliness: '',
                totalScore: '-',
                drynessAvg: '-',
                membraneAvg: '-',
                cleanlinessAvg: '-',
                cabinetAvg: '-',
                status: '-'
            });
        }
    }
}

initializeCabinetRows();

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadSavedData();
    setupErrorRemoval();
    initializeProgressSteps();
});

// Progress Steps Management
function initializeProgressSteps() {
    const steps = document.querySelectorAll('.step-item');
    steps.forEach(step => {
        step.addEventListener('click', function() {
            const stepNumber = parseInt(this.dataset.step);
            updateStep(stepNumber);
        });
    });
}

function updateStep(stepNumber) {
    const steps = document.querySelectorAll('.step-item');
    const stepLines = document.querySelectorAll('.step-line');
    
    steps.forEach((step, index) => {
        const currentStep = index + 1;
        
        // Remove all classes
        step.classList.remove('active', 'completed');
        
        if (currentStep < stepNumber) {
            step.classList.add('completed');
        } else if (currentStep === stepNumber) {
            step.classList.add('active');
        }
    });
    
    // Update step lines
    stepLines.forEach((line, index) => {
        if (index < stepNumber - 1) {
            line.classList.add('completed');
        } else {
            line.classList.remove('completed');
        }
    });
    
    // Scroll to the step section
    const stepSection = document.getElementById(`step${stepNumber}`);
    if (stepSection) {
        stepSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Toast Notification
function showToast(type, message) {
    const toast = document.getElementById('toast');
    const toastIcon = toast.querySelector('.toast-icon');
    const toastMessage = toast.querySelector('.toast-message');
    
    // Remove all type classes
    toast.classList.remove('success', 'error', 'warning');
    toast.classList.add(type);
    
    // Set icon based on type
    switch(type) {
        case 'success':
            toastIcon.textContent = '✓';
            break;
        case 'error':
            toastIcon.textContent = '✕';
            break;
        case 'warning':
            toastIcon.textContent = '⚠';
            break;
    }
    
    toastMessage.textContent = message;
    
    // Show toast
    toast.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Loading Overlay
function showLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.classList.add('show');
    }
}

function hideLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.classList.remove('show');
    }
}

// Save start production time with new UI
function saveStartProdTime() {
    const startProdTimeInput = document.getElementById('startProdTime');
    const statusElement = document.getElementById('startProdStatus');

    if (startProdTimeInput) {
        const selectedTime = startProdTimeInput.value;

        // Check if time is selected
        if (!selectedTime) {
            if (statusElement) {
                statusElement.textContent = 'กรุณาเลือกเวลาก่อนบันทึก';
                statusElement.className = 'status-message error';
            }
            showToast('error', 'กรุณาเลือกเวลาก่อนบันทึก');
            return;
        }

        startProdTime = selectedTime;
        saveData();

        // Show success status message
        if (statusElement) {
            statusElement.textContent = `บันทึกเริ่มเวลาที่ ${startProdTime} แล้ว`;
            statusElement.className = 'status-message success';
        }

        showToast('success', `บันทึกเวลา ${startProdTime} แล้ว`);
        
        // Move to step 2
        updateStep(2);
    }
}

// Calculate hatch time based on passed cabinets and percentage
function calculateHatchTime(passedCabinets, percentage, startProdTime) {
    const pct = parseFloat(percentage);

    // Check if start prod is at 15:00 น.
    if (startProdTime === '15:00 น.') {
        // Special case: 65%-50% for 2-12 cabinets
        if (passedCabinets >= 2 && passedCabinets <= 12 && pct >= 50 && pct <= 65) {
            return '15:00 น.';
        }

        // Start prod at 15:00 น.
        switch (passedCabinets) {
            case 2:
                if (pct >= 66 && pct <= 100) return '14:00 น.';
                if (pct >= 35 && pct <= 49) return '16:00 น.';
                break;
            case 3:
                if (pct >= 66 && pct <= 100) return '14:00 น.';
                if (pct >= 35 && pct <= 49) return '17:00 น.';
                break;
            case 4:
                if (pct >= 94 && pct <= 100) return '13:00 น.';
                if (pct >= 66 && pct <= 93) return '14:00 น.';
                if (pct >= 38 && pct <= 49) return '17:00 น.';
                if (pct >= 35 && pct <= 37) return '18:00 น.';
                break;
            case 5:
                if (pct >= 75 && pct <= 100) return '13:00 น.';
                if (pct >= 66 && pct <= 74) return '14:00 น.';
                if (pct >= 35 && pct <= 49) return '18:00 น.';
                break;
            case 6:
                if (pct >= 66 && pct <= 100) return '13:00 น.';
                if (pct >= 42 && pct <= 49) return '18:00 น.';
                if (pct >= 35 && pct <= 41) return '19:00 น.';
                break;
            case 7:
                if (pct >= 90 && pct <= 100) return '12:00 น.';
                if (pct >= 66 && pct <= 91) return '13:00 น.';
                if (pct >= 36 && pct <= 49) return '19:00 น.';
                if (pct === 35) return '20:00 น.';
                break;
            case 8:
                if (pct >= 79 && pct <= 100) return '12:00 น.';
                if (pct >= 66 && pct <= 78) return '13:00 น.';
                if (pct >= 44 && pct <= 49) return '19:00 น.';
                if (pct >= 35 && pct <= 43) return '20:00 น.';
                break;
            case 9:
                if (pct >= 98 && pct <= 100) return '11:00 น.';
                if (pct >= 70 && pct <= 97) return '12:00 น.';
                if (pct >= 66 && pct <= 69) return '13:00 น.';
                if (pct >= 39 && pct <= 49) return '20:00 น.';
                if (pct >= 35 && pct <= 38) return '21:00 น.';
                break;
            case 10:
                if (pct >= 88 && pct <= 100) return '11:00 น.';
                if (pct >= 66 && pct <= 87) return '12:00 น.';
                if (pct >= 45 && pct <= 49) return '20:00 น.';
                if (pct >= 35 && pct <= 46) return '21:00 น.';
                break;
            case 11:
                if (pct >= 80 && pct <= 100) return '11:00 น.';
                if (pct >= 66 && pct <= 79) return '12:00 น.';
                if (pct >= 41 && pct <= 49) return '21:00 น.';
                if (pct >= 35 && pct <= 40) return '22:00 น.';
                break;
            case 12:
                if (pct >= 94 && pct <= 100) return '10:00 น.';
                if (pct >= 73 && pct <= 93) return '11:00 น.';
                if (pct >= 66 && pct <= 72) return '12:00 น.';
                if (pct >= 46 && pct <= 49) return '21:00 น.';
                if (pct >= 38 && pct <= 45) return '22:00 น.';
                if (pct >= 35 && pct <= 37) return '23:00 น.';
                break;
        }
    } else if (startProdTime === '14:00 น.') {
        // Check if start prod is at 14:00 น.
        // Special case: 65%-50% for 2-12 cabinets
        if (passedCabinets >= 2 && passedCabinets <= 12 && pct >= 50 && pct <= 65) {
            return '14:00 น.';
        }

        // Start prod at 14:00 น.
        switch (passedCabinets) {
            case 2:
                if (pct >= 66 && pct <= 100) return '13:00 น.';
                if (pct >= 35 && pct <= 49) return '15:00 น.';
                break;
            case 3:
                if (pct >= 66 && pct <= 100) return '13:00 น.';
                if (pct >= 35 && pct <= 49) return '16:00 น.';
                break;
            case 4:
                if (pct >= 94 && pct <= 100) return '12:00 น.';
                if (pct >= 66 && pct <= 93) return '13:00 น.';
                if (pct >= 38 && pct <= 49) return '16:00 น.';
                if (pct >= 35 && pct <= 37) return '17:00 น.';
                break;
            case 5:
                if (pct >= 75 && pct <= 100) return '12:00 น.';
                if (pct >= 66 && pct <= 74) return '13:00 น.';
                if (pct >= 35 && pct <= 49) return '17:00 น.';
                break;
            case 6:
                if (pct >= 66 && pct <= 100) return '12:00 น.';
                if (pct >= 42 && pct <= 49) return '17:00 น.';
                if (pct >= 35 && pct <= 41) return '18:00 น.';
                break;
            case 7:
                if (pct >= 90 && pct <= 100) return '11:00 น.';
                if (pct >= 66 && pct <= 89) return '12:00 น.';
                if (pct >= 36 && pct <= 49) return '18:00 น.';
                if (pct === 35) return '19:00 น.';
                break;
            case 8:
                if (pct >= 79 && pct <= 100) return '11:00 น.';
                if (pct >= 66 && pct <= 78) return '12:00 น.';
                if (pct >= 44 && pct <= 49) return '18:00 น.';
                if (pct >= 35 && pct <= 43) return '19:00 น.';
                break;
            case 9:
                if (pct >= 98 && pct <= 100) return '10:00 น.';
                if (pct >= 70 && pct <= 97) return '11:00 น.';
                if (pct >= 66 && pct <= 69) return '12:00 น.';
                if (pct >= 39 && pct <= 49) return '19:00 น.';
                if (pct >= 35 && pct <= 38) return '20:00 น.';
                break;
            case 10:
                if (pct >= 88 && pct <= 100) return '10:00 น.';
                if (pct >= 66 && pct <= 87) return '11:00 น.';
                if (pct >= 45 && pct <= 49) return '19:00 น.';
                if (pct >= 35 && pct <= 44) return '20:00 น.';
                break;
            case 11:
                if (pct >= 80 && pct <= 100) return '10:00 น.';
                if (pct >= 66 && pct <= 79) return '11:00 น.';
                if (pct >= 41 && pct <= 49) return '20:00 น.';
                if (pct >= 35 && pct <= 40) return '21:00 น.';
                break;
            case 12:
                if (pct >= 94 && pct <= 100) return '9:00 น.';
                if (pct >= 73 && pct <= 93) return '10:00 น.';
                if (pct >= 66 && pct <= 72) return '11:00 น.';
                if (pct >= 46 && pct <= 49) return '20:00 น.';
                if (pct >= 38 && pct <= 45) return '21:00 น.';
                if (pct >= 35 && pct <= 37) return '22:00 น.';
                break;
        }
    } else if (startProdTime === '12:00 น.') {
        // Check if start prod is at 12:00 น.
        // Special case: 65%-50% for 2-12 cabinets
        if (passedCabinets >= 2 && passedCabinets <= 12 && pct >= 50 && pct <= 65) {
            return '12:00 น.';
        }

        // Start prod at 12:00 น.
        switch (passedCabinets) {
            case 2:
                if (pct >= 66 && pct <= 100) return '11:00 น.';
                if (pct >= 35 && pct <= 49) return '13:00 น.';
                break;
            case 3:
                if (pct >= 66 && pct <= 100) return '11:00 น.';
                if (pct >= 35 && pct <= 49) return '14:00 น.';
                break;
            case 4:
                if (pct >= 94 && pct <= 100) return '10:00 น.';
                if (pct >= 66 && pct <= 93) return '11:00 น.';
                if (pct >= 38 && pct <= 49) return '14:00 น.';
                if (pct >= 35 && pct <= 37) return '15:00 น.';
                break;
            case 5:
                if (pct >= 75 && pct <= 100) return '10:00 น.';
                if (pct >= 66 && pct <= 74) return '11:00 น.';
                if (pct >= 35 && pct <= 49) return '15:00 น.';
                break;
            case 6:
                if (pct >= 66 && pct <= 100) return '10:00 น.';
                if (pct >= 42 && pct <= 49) return '15:00 น.';
                if (pct >= 35 && pct <= 41) return '16:00 น.';
                break;
            case 7:
                if (pct >= 90 && pct <= 100) return '9:00 น.';
                if (pct >= 66 && pct <= 89) return '10:00 น.';
                if (pct >= 36 && pct <= 49) return '16:00 น.';
                if (pct === 35) return '17:00 น.';
                break;
            case 8:
                if (pct >= 79 && pct <= 100) return '9:00 น.';
                if (pct >= 66 && pct <= 78) return '10:00 น.';
                if (pct >= 44 && pct <= 49) return '16:00 น.';
                if (pct >= 35 && pct <= 43) return '17:00 น.';
                break;
            case 9:
                if (pct >= 98 && pct <= 100) return '8:00 น.';
                if (pct >= 70 && pct <= 97) return '9:00 น.';
                if (pct >= 66 && pct <= 69) return '10:00 น.';
                if (pct >= 39 && pct <= 49) return '17:00 น.';
                if (pct >= 35 && pct <= 38) return '18:00 น.';
                break;
            case 10:
                if (pct >= 88 && pct <= 100) return '8:00 น.';
                if (pct >= 66 && pct <= 87) return '9:00 น.';
                if (pct >= 45 && pct <= 49) return '17:00 น.';
                if (pct >= 35 && pct <= 44) return '18:00 น.';
                break;
            case 11:
                if (pct >= 80 && pct <= 100) return '8:00 น.';
                if (pct >= 66 && pct <= 79) return '9:00 น.';
                if (pct >= 41 && pct <= 49) return '18:00 น.';
                if (pct >= 35 && pct <= 40) return '19:00 น.';
                break;
            case 12:
                if (pct >= 94 && pct <= 100) return '7:00 น.';
                if (pct >= 73 && pct <= 93) return '8:00 น.';
                if (pct >= 66 && pct <= 72) return '9:00 น.';
                if (pct >= 46 && pct <= 49) return '18:00 น.';
                if (pct >= 38 && pct <= 45) return '19:00 น.';
                if (pct >= 35 && pct <= 37) return '20:00 น.';
                break;
        }
    } else {
        // Start prod at 10:00 น. (original logic)
        // Special case: 65%-50% for 2-12 cabinets
        if (passedCabinets >= 2 && passedCabinets <= 12 && pct >= 50 && pct <= 65) {
            return '10:00 น.';
        }

        switch (passedCabinets) {
            case 2:
                if (pct >= 66 && pct <= 100) return '9:00 น.';
                if (pct >= 35 && pct <= 49) return '11:00 น.';
                break;
            case 3:
                if (pct >= 66 && pct <= 100) return '9:00 น.';
                if (pct >= 35 && pct <= 49) return '12:00 น.';
                break;
            case 4:
                if (pct >= 94 && pct <= 100) return '8:00 น.';
                if (pct >= 66 && pct <= 93) return '9:00 น.';
                if (pct >= 38 && pct <= 49) return '12:00 น.';
                if (pct >= 35 && pct <= 37) return '13:00 น.';
                break;
            case 5:
                if (pct >= 75 && pct <= 100) return '8:00 น.';
                if (pct >= 66 && pct <= 74) return '9:00 น.';
                if (pct >= 35 && pct <= 49) return '13:00 น.';
                break;
            case 6:
                if (pct >= 66 && pct <= 100) return '8:00 น.';
                if (pct >= 42 && pct <= 49) return '13:00 น.';
                if (pct >= 35 && pct <= 41) return '14:00 น.';
                break;
            case 7:
                if (pct >= 90 && pct <= 100) return '7:00 น.';
                if (pct >= 66 && pct <= 89) return '8:00 น.';
                if (pct >= 36 && pct <= 49) return '14:00 น.';
                if (pct === 35) return '15:00 น.';
                break;
            case 8:
                if (pct >= 79 && pct <= 100) return '7:00 น.';
                if (pct >= 66 && pct <= 78) return '8:00 น.';
                if (pct >= 44 && pct <= 49) return '14:00 น.';
                if (pct >= 35 && pct <= 43) return '15:00 น.';
                break;
            case 9:
                if (pct >= 98 && pct <= 100) return '6:00 น.';
                if (pct >= 70 && pct <= 97) return '7:00 น.';
                if (pct >= 66 && pct <= 69) return '8:00 น.';
                if (pct >= 39 && pct <= 49) return '15:00 น.';
                if (pct >= 35 && pct <= 38) return '16:00 น.';
                break;
            case 10:
                if (pct >= 88 && pct <= 100) return '6:00 น.';
                if (pct >= 66 && pct <= 87) return '7:00 น.';
                if (pct >= 45 && pct <= 49) return '15:00 น.';
                if (pct >= 35 && pct <= 44) return '16:00 น.';
                break;
            case 11:
                if (pct >= 80 && pct <= 100) return '6:00 น.';
                if (pct >= 66 && pct <= 79) return '7:00 น.';
                if (pct >= 41 && pct <= 49) return '16:00 น.';
                if (pct >= 35 && pct <= 40) return '17:00 น.';
                break;
            case 12:
                if (pct >= 94 && pct <= 100) return '5:00 น.';
                if (pct >= 73 && pct <= 93) return '6:00 น.';
                if (pct >= 66 && pct <= 72) return '7:00 น.';
                if (pct >= 46 && pct <= 49) return '16:00 น.';
                if (pct >= 38 && pct <= 45) return '17:00 น.';
                if (pct >= 35 && pct <= 37) return '18:00 น.';
                break;
        }
    }

    return '-';
}

function restoreOriginalTable() {
    initializeCabinetRows(5);
    localStorage.removeItem('chickenHatchingData');

    const hatchTimeInput = document.getElementById('hatchTime');
    if (hatchTimeInput) hatchTimeInput.value = '';

    generateTable();
    for (let cabinet = 1; cabinet <= NUM_CABINETS; cabinet++) {
        calculateDrynessCabinetAverage(cabinet);
        calculateMembraneCabinetAverage(cabinet);
        calculateCleanlinessCabinetAverage(cabinet);
        calculateCabinetAverage(cabinet);
    }
}

// Generate cabinet cards (new card-based layout)
function generateTable() {
    const cabinetCardsContainer = document.getElementById('cabinetCardsContainer');
    if (!cabinetCardsContainer) return;
    
    cabinetCardsContainer.innerHTML = '';

    for (let cabinet = 1; cabinet <= NUM_CABINETS; cabinet++) {
        const rows = cabinetRows[cabinet].rows;
        const rowCount = rows.length;
        
        // Calculate cabinet status
        const avgValue = cabinetRows[cabinet].rows[0].cabinetAvg;
        const status = avgValue !== '-' && parseFloat(avgValue) >= 4.00 ? 'pass' : (avgValue !== '-' ? 'fail' : 'pending');
        const statusText = status === 'pass' ? 'ผ่าน' : (status === 'fail' ? 'ไม่ผ่าน' : 'รอประเมิน');

        const cabinetCard = document.createElement('div');
        cabinetCard.className = 'cabinet-card';
        cabinetCard.id = `cabinet-card-${cabinet}`;
        
        cabinetCard.innerHTML = `
            <div class="cabinet-card-header">
                <div class="cabinet-title">ตู้ที่ ${cabinet}</div>
                <div class="cabinet-status ${status}">${statusText}</div>
            </div>
            <div class="cabinet-info">
                <div class="form-group">
                    <label class="form-label">ตู้เกิด</label>
                    <input type="text" class="input-field hatcher-input" data-cabinet="${cabinet}" id="hatcher-${cabinet}" placeholder="กรอกข้อมูลตู้เกิด" value="${cabinetRows[cabinet].hatcher}">
                </div>
            </div>
            <div class="cabinet-rows">
                ${rows.map((rowData, rowIndex) => `
                    <div class="cabinet-row" data-cabinet="${cabinet}" data-rowindex="${rowIndex}">
                        <div class="row-header">
                            <span class="row-label">คันที่ ${rowIndex + 1}</span>
                        </div>
                        <div class="row-criteria">
                            <div class="criteria-section">
                                <label class="criteria-label">ความแห้งของขน</label>
                                <div class="radio-group">
                                    <div class="radio-button tooltip">
                                        <input type="radio" name="dryness-${cabinet}-${rowIndex}" value="1" ${rowData.dryness === '1' ? 'checked' : ''} onchange="setScore(${cabinet}, ${rowIndex}, 'dryness', 1)">
                                        <span class="radio-label">1</span>
                                        <span class="tooltip-text">ขนยังไม่แห้ง หัวเปียก คอเปียก</span>
                                    </div>
                                    <div class="radio-button tooltip">
                                        <input type="radio" name="dryness-${cabinet}-${rowIndex}" value="2" ${rowData.dryness === '2' ? 'checked' : ''} onchange="setScore(${cabinet}, ${rowIndex}, 'dryness', 2)">
                                        <span class="radio-label">2</span>
                                        <span class="tooltip-text">ขนหมาด โดยเฉพาะขนหลังคอ</span>
                                    </div>
                                    <div class="radio-button tooltip">
                                        <input type="radio" name="dryness-${cabinet}-${rowIndex}" value="3" ${rowData.dryness === '3' ? 'checked' : ''} onchange="setScore(${cabinet}, ${rowIndex}, 'dryness', 3)">
                                        <span class="radio-label">3</span>
                                        <span class="tooltip-text">ขนแห้งฟูทั้งตัว พร้อมออก</span>
                                    </div>
                                </div>
                            </div>
                            <div class="criteria-section">
                                <label class="criteria-label">เยื่อเปลือกไข่</label>
                                <div class="radio-group">
                                    <div class="radio-button tooltip">
                                        <input type="radio" name="membrane-${cabinet}-${rowIndex}" value="1" ${rowData.membrane === '1' ? 'checked' : ''} onchange="setScore(${cabinet}, ${rowIndex}, 'membrane', 1)">
                                        <span class="radio-label">1</span>
                                        <span class="tooltip-text">บีบแล้วเยื่อไข่ไม่ขาด</span>
                                    </div>
                                    <div class="radio-button tooltip">
                                        <input type="radio" name="membrane-${cabinet}-${rowIndex}" value="2" ${rowData.membrane === '2' ? 'checked' : ''} onchange="setScore(${cabinet}, ${rowIndex}, 'membrane', 2)">
                                        <span class="radio-label">2</span>
                                        <span class="tooltip-text">บีบแล้วเยื่อไข่ขาด</span>
                                    </div>
                                </div>
                            </div>
                            <div class="criteria-section">
                                <label class="criteria-label">ความสะอาดของเปลือก</label>
                                <div class="radio-group">
                                    <div class="radio-button tooltip">
                                        <input type="radio" name="cleanliness-${cabinet}-${rowIndex}" value="1" ${rowData.cleanliness === '1' ? 'checked' : ''} onchange="setScore(${cabinet}, ${rowIndex}, 'cleanliness', 1)">
                                        <span class="radio-label">1</span>
                                        <span class="tooltip-text">เปลือกสะอาด เปื้อนเล็กน้อย</span>
                                    </div>
                                    <div class="radio-button tooltip">
                                        <input type="radio" name="cleanliness-${cabinet}-${rowIndex}" value="2" ${rowData.cleanliness === '2' ? 'checked' : ''} onchange="setScore(${cabinet}, ${rowIndex}, 'cleanliness', 2)">
                                        <span class="radio-label">2</span>
                                        <span class="tooltip-text">มีคราบขี้ไก่ติดอยู่มาก</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="row-summary">
                            <span class="summary-label">คะแนนรวม:</span>
                            <span class="summary-value" id="total-score-${cabinet}-${rowIndex}">${rowData.totalScore}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="cabinet-footer">
                <div class="cabinet-stats">
                    <div class="stat-item">
                        <span class="stat-label">ค่าเฉลี่ยความแห้ง:</span>
                        <span class="stat-value" id="dryness-avg-cabinet-${cabinet}">${rowData.drynessAvg}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">ค่าเฉลี่ยเยื่อ:</span>
                        <span class="stat-value" id="membrane-avg-cabinet-${cabinet}">${rowData.membraneAvg}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">ค่าเฉลี่ยสะอาด:</span>
                        <span class="stat-value" id="cleanliness-avg-cabinet-${cabinet}">${rowData.cleanlinessAvg}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">ค่าเฉลี่ยรวม:</span>
                        <span class="stat-value" id="avg-cabinet-${cabinet}">${avgValue}</span>
                    </div>
                </div>
                <button onclick="deleteCabinetRow(${cabinet})" class="btn btn-clear btn-sm">ลบตู้นี้</button>
            </div>
        `;
        
        cabinetCardsContainer.appendChild(cabinetCard);
        
        // Add event listener to hatcher input
        const hatcherInput = cabinetCard.querySelector('input.hatcher-input');
        if (hatcherInput) {
            hatcherInput.addEventListener('change', function() {
                cabinetRows[cabinet].hatcher = this.value;
                saveData();
            });
        }
    }

    // Update summary details after generating cards
    updateSummaryDetails();
}

// Set score from radio button (new card-based layout)
function setScore(cabinet, rowIndex, type, score) {
    // Update data in cabinetRows
    const rowData = cabinetRows[cabinet].rows[rowIndex];
    if (type === 'dryness') {
        rowData.dryness = score.toString();
    } else if (type === 'membrane') {
        rowData.membrane = score.toString();
    } else if (type === 'cleanliness') {
        rowData.cleanliness = score.toString();
    }

    // Calculate cabinet average for the type
    if (type === 'dryness') {
        calculateDrynessCabinetAverage(cabinet);
    } else if (type === 'membrane') {
        calculateMembraneCabinetAverage(cabinet);
    } else if (type === 'cleanliness') {
        calculateCleanlinessCabinetAverage(cabinet);
    }

    calculateTotalScore(cabinet, rowIndex);

    // Auto-save data
    saveData();
    
    // Show toast notification
    showToast('success', 'บันทึกคะแนนแล้ว');
}

// Calculate dryness cabinet average
function calculateDrynessCabinetAverage(cabinet) {
    const drynessScores = [];
    const rows = cabinetRows[cabinet].rows;
    
    rows.forEach((rowData, rowIndex) => {
        if (rowData.dryness !== '') {
            drynessScores.push(parseFloat(rowData.dryness));
        }
    });
    
    const avg = calculateAverage(drynessScores);
    const avgValue = avg !== null ? avg.toFixed(2) : '-';
    
    // Update all rows' drynessAvg with the same value
    rows.forEach(rowData => {
        rowData.drynessAvg = avgValue;
    });
    
    // Update DOM
    document.getElementById(`dryness-avg-cabinet-${cabinet}`).textContent = avgValue;
}

// Calculate membrane cabinet average
function calculateMembraneCabinetAverage(cabinet) {
    const membraneScores = [];
    const rows = cabinetRows[cabinet].rows;
    
    rows.forEach((rowData, rowIndex) => {
        if (rowData.membrane !== '') {
            membraneScores.push(parseFloat(rowData.membrane));
        }
    });
    
    const avg = calculateAverage(membraneScores);
    const avgValue = avg !== null ? avg.toFixed(2) : '-';
    
    // Update all rows' membraneAvg with the same value
    rows.forEach(rowData => {
        rowData.membraneAvg = avgValue;
    });
    
    // Update DOM
    document.getElementById(`membrane-avg-cabinet-${cabinet}`).textContent = avgValue;
}

// Calculate cleanliness cabinet average
function calculateCleanlinessCabinetAverage(cabinet) {
    const cleanlinessScores = [];
    const rows = cabinetRows[cabinet].rows;
    
    rows.forEach((rowData, rowIndex) => {
        if (rowData.cleanliness !== '') {
            cleanlinessScores.push(parseFloat(rowData.cleanliness));
        }
    });
    
    const avg = calculateAverage(cleanlinessScores);
    const avgValue = avg !== null ? avg.toFixed(2) : '-';
    
    // Update all rows' cleanlinessAvg with the same value
    rows.forEach(rowData => {
        rowData.cleanlinessAvg = avgValue;
    });
    
    // Update DOM
    document.getElementById(`cleanliness-avg-cabinet-${cabinet}`).textContent = avgValue;
}

// Calculate total score for a specific row
function calculateTotalScore(cabinet, rowIndex) {
    const rowData = cabinetRows[cabinet].rows[rowIndex];
    
    const d = rowData.dryness !== '' ? parseFloat(rowData.dryness) : 0;
    const m = rowData.membrane !== '' ? parseFloat(rowData.membrane) : 0;
    const c = rowData.cleanliness !== '' ? parseFloat(rowData.cleanliness) : 0;

    if (d > 0 || m > 0 || c > 0) {
        const totalScore = d + m + c;
        rowData.totalScore = totalScore;
        document.getElementById(`total-score-${cabinet}-${rowIndex}`).textContent = totalScore;
    } else {
        rowData.totalScore = '-';
        document.getElementById(`total-score-${cabinet}-${rowIndex}`).textContent = '-';
    }
    
    // Calculate cabinet average
    calculateCabinetAverage(cabinet);
}

// Calculate average score for a specific cabinet
function calculateCabinetAverage(cabinet) {
    const totalScores = [];
    const rows = cabinetRows[cabinet].rows;

    rows.forEach((rowData, rowIndex) => {
        if (rowData.totalScore !== '-') {
            totalScores.push(parseFloat(rowData.totalScore));
        }
    });

    const avg = calculateAverage(totalScores);
    const avgValue = avg !== null ? avg.toFixed(2) : '-';
    const status = avg !== null && avg >= 4.00 ? 'pass' : (avg !== null ? 'fail' : 'pending');

    // Update all rows' cabinetAvg and status
    rows.forEach(rowData => {
        rowData.cabinetAvg = avgValue;
        rowData.status = status === 'pass' ? 'ผ่าน' : (status === 'fail' ? 'ไม่ผ่าน' : '-');
    });

    // Update DOM - cabinet average
    const avgElement = document.getElementById(`avg-cabinet-${cabinet}`);
    if (avgElement) avgElement.textContent = avgValue;

    // Update cabinet status in card header
    const cabinetCard = document.getElementById(`cabinet-card-${cabinet}`);
    if (cabinetCard) {
        const statusElement = cabinetCard.querySelector('.cabinet-status');
        if (statusElement) {
            statusElement.className = `cabinet-status ${status}`;
            statusElement.textContent = status === 'pass' ? 'ผ่าน' : (status === 'fail' ? 'ไม่ผ่าน' : 'รอประเมิน');
        }
    }

    // Update summary details
    updateSummaryDetails();
}

// Get the CSS class for a status value (ผ่าน = green, ไม่ผ่าน = red)
function getStatusClass(status) {
    if (status === 'ผ่าน') return 'status-pass';
    if (status === 'ไม่ผ่าน') return 'status-fail';
    return '';
}

// Delete a specific cabinet row (card-based layout)
function deleteCabinetRow(cabinet) {
    if (!confirm(`คุณต้องการลบตู้ที่ ${cabinet} หรือไม่?`)) {
        return;
    }

    // Remove cabinet from data structure
    delete cabinetRows[cabinet];

    // Reindex cabinets to maintain sequential numbering
    const newCabinetRows = {};
    let newIndex = 1;
    for (let i = 1; i <= NUM_CABINETS; i++) {
        if (cabinetRows[i]) {
            newCabinetRows[newIndex] = cabinetRows[i];
            newIndex++;
        }
    }
    cabinetRows = newCabinetRows;
    NUM_CABINETS = newIndex - 1;

    generateTable();
    saveData();

    showToast('success', `ลบตู้ที่ ${cabinet} เรียบร้อย! (ทั้งหมด ${NUM_CABINETS} ตู้)`);
}

// Calculate average of an array
function calculateAverage(values) {
    if (values.length === 0) return null;
    const sum = values.reduce((a, b) => a + b, 0);
    return sum / values.length;
}

// Calculate percentage from example section
function calculatePercentage() {
    // Function kept for backward compatibility, but no longer used
}

// Update summary details
function updateSummaryDetails() {
    const summaryDetails = document.getElementById('summaryDetails');
    if (!summaryDetails) return;

    let html = '<div class="summary-cabinet-grid">';

    // Cabinet details
    for (let cabinet = 1; cabinet <= NUM_CABINETS; cabinet++) {
        if (cabinetRows[cabinet]) {
            const rows = cabinetRows[cabinet].rows;
            const totalRows = rows.length;

            // Get cabinet average from table
            const avgValue = cabinetRows[cabinet].rows[0].cabinetAvg;

            html += `
                <div class="summary-cabinet-item">
                    <div class="cabinet-header">ตู้ที่ ${cabinet}</div>
                    <div class="cabinet-detail">
                        <span class="detail-label">จำนวนคัน:</span>
                        <span class="detail-value">${totalRows}</span>
                    </div>
                    <div class="cabinet-detail">
                        <span class="detail-label">ค่าเฉลี่ยตู้:</span>
                        <span class="detail-value">${avgValue}</span>
                    </div>
                </div>
            `;
        }
    }

    html += '</div>';

    // Overall summary section
    html += '<div class="overall-summary">';
    html += '<h4 class="overall-title">สรุปผลคะแนนและเวลาออกที่เหมาะสม</h4>';

    // Calculate percentage: (number of cabinets with avg >= 4.00) / total cabinets * 100
    let passedCabinets = 0;
    let totalCabinets = 0;
    for (let cabinet = 1; cabinet <= NUM_CABINETS; cabinet++) {
        if (cabinetRows[cabinet]) {
            totalCabinets++;
            const avgValue = cabinetRows[cabinet].rows[0].cabinetAvg;
            if (avgValue !== '-' && parseFloat(avgValue) >= 4.00) {
                passedCabinets++;
            }
        }
    }

    const percentage = totalCabinets > 0 ? Math.round((passedCabinets / totalCabinets) * 100) : 0;

    html += '<div class="overall-detail">';
    html += '<span class="detail-label">%จำนวนตู้ที่มีคะแนน ≥4 คะแนน:</span>';
    html += `<span class="detail-value">${percentage}%</span>`;
    html += '</div>';

    // Calculate hatch time based on passed cabinets and percentage
    const hatchTime = calculateHatchTime(passedCabinets, percentage, startProdTime);

    html += '<div class="overall-detail">';
    html += '<span class="detail-label">เวลาออกลูกไก่ที่เหมาะสม:</span>';
    html += `<span class="detail-value">${hatchTime}</span>`;
    html += '</div>';

    html += '</div>';
    summaryDetails.innerHTML = html;
}

// Save data to localStorage
function saveData() {
    const data = {
        startProdTime: startProdTime,
        cabinetData: {}
    };

    // Collect all data from cabinetRows
    for (let cabinet = 1; cabinet <= NUM_CABINETS; cabinet++) {
        const hatcherInput = document.getElementById(`hatcher-${cabinet}`);

        data.cabinetData[cabinet] = {
            hatcher: hatcherInput ? hatcherInput.value : cabinetRows[cabinet].hatcher,
            rows: cabinetRows[cabinet].rows.map(rowData => ({
                id: rowData.id,
                dryness: rowData.dryness || '',
                membrane: rowData.membrane || '',
                cleanliness: rowData.cleanliness || '',
                totalScore: rowData.totalScore,
                drynessAvg: rowData.drynessAvg,
                membraneAvg: rowData.membraneAvg,
                cleanlinessAvg: rowData.cleanlinessAvg,
                cabinetAvg: rowData.cabinetAvg,
                status: rowData.status
            }))
        };
    }

    localStorage.setItem('chickenHatchingData', JSON.stringify(data));
}

// Save record to history (using Firebase)
async function saveToHistory() {
    // Calculate passed cabinets and percentage
    let passedCabinets = 0;
    let totalCabinets = 0;
    for (let cabinet = 1; cabinet <= NUM_CABINETS; cabinet++) {
        if (cabinetRows[cabinet]) {
            totalCabinets++;
            const avgValue = cabinetRows[cabinet].rows[0].cabinetAvg;
            if (avgValue !== '-' && parseFloat(avgValue) >= 4.00) {
                passedCabinets++;
            }
        }
    }

    const percentage = totalCabinets > 0 ? Math.round((passedCabinets / totalCabinets) * 100) : 0;
    const hatchTime = calculateHatchTime(passedCabinets, percentage, startProdTime);

    // Get summary text
    const summaryInput = document.getElementById('summary');
    const summary = summaryInput ? summaryInput.value : '';

    const record = {
        timestamp: new Date().toISOString(),
        start_prod_time: startProdTime,
        cabinet_rows: cabinetRows,
        summary: summary,
        passed_cabinets: passedCabinets,
        total_cabinets: totalCabinets,
        hatch_time: hatchTime
    };

    try {
        await firebaseApi.createRecord(record);
    } catch (error) {
        console.error('Error saving to history:', error);
        throw error;
    }
}

// Validate data before saving
function validateData() {
    let isValid = true;
    let errorMessage = '';

    // Clear all error states
    document.querySelectorAll('.input-field').forEach(field => {
        field.classList.remove('error');
    });

    // Check start production time
    const startProdTimeInput = document.getElementById('startProdTime');
    if (!startProdTime || startProdTime === '') {
        if (startProdTimeInput) {
            startProdTimeInput.classList.add('error');
        }
        isValid = false;
        errorMessage = 'กรุณาเลือกเวลา Start prod';
    }

    // Check hatcher inputs
    let emptyHatchers = [];
    for (let cabinet = 1; cabinet <= NUM_CABINETS; cabinet++) {
        const hatcherInput = document.getElementById(`hatcher-${cabinet}`);
        if (hatcherInput && (!hatcherInput.value || hatcherInput.value.trim() === '')) {
            hatcherInput.classList.add('error');
            emptyHatchers.push(cabinet);
            isValid = false;
        }
    }

    if (emptyHatchers.length > 0) {
        if (errorMessage) {
            errorMessage += ' และ ';
        }
        errorMessage += `กรุณากรอกข้อมูลตู้เกิด (ตู้ที่ ${emptyHatchers.join(', ')})`;
    }

    if (!isValid) {
        alert(errorMessage);
    }

    return isValid;
}

// Remove error state when user starts typing
function setupErrorRemoval() {
    // Remove error from startProdTime when changed
    const startProdTimeInput = document.getElementById('startProdTime');
    if (startProdTimeInput) {
        startProdTimeInput.addEventListener('change', function() {
            this.classList.remove('error');
        });
    }

    // Remove error from hatcher inputs when changed
    for (let cabinet = 1; cabinet <= NUM_CABINETS; cabinet++) {
        const hatcherInput = document.getElementById(`hatcher-${cabinet}`);
        if (hatcherInput) {
            hatcherInput.addEventListener('input', function() {
                this.classList.remove('error');
            });
        }
    }
}

// Save data with alert (for user action) - updated with new UI
async function saveDataWithAlert() {
    if (!validateData()) {
        return;
    }

    showLoading();

    try {
        saveData();
        await saveToHistory();
        hideLoading();
        
        showToast('success', 'บันทึกข้อมูลเรียบร้อย!');
        
        // Move to step 3
        updateStep(3);
        
        // Reset data after successful save
        setTimeout(() => {
            resetAllData();
        }, 2000);
    } catch (error) {
        hideLoading();
        showToast('error', 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        console.error('Error saving data:', error);
    }
}

// Reset all data without confirmation
function resetAllData() {
    // Clear start production time
    startProdTime = '';
    const startProdTimeInput = document.getElementById('startProdTime');
    if (startProdTimeInput) startProdTimeInput.value = '';

    // Clear hatcher data
    for (let cabinet = 1; cabinet <= NUM_CABINETS; cabinet++) {
        const hatcherInput = document.getElementById(`hatcher-${cabinet}`);
        if (hatcherInput) hatcherInput.value = '';
    }

    // Reset cabinetRows to default (3 rows per cabinet)
    initializeCabinetRows(5);

    // Refresh table and recalculate
    generateTable();
    for (let cabinet = 1; cabinet <= NUM_CABINETS; cabinet++) {
        calculateDrynessCabinetAverage(cabinet);
        calculateMembraneCabinetAverage(cabinet);
        calculateCleanlinessCabinetAverage(cabinet);
        calculateCabinetAverage(cabinet);
    }

    // Clear localStorage
    localStorage.removeItem('chickenHatchingData');

    // Update summary details
    updateSummaryDetails();
}

// Load data from localStorage
function loadSavedData() {
    const savedData = localStorage.getItem('chickenHatchingData');

    if (savedData) {
        const data = JSON.parse(savedData);

        // Load start production time
        if (data.startProdTime) {
            startProdTime = data.startProdTime;
            const startProdTimeInput = document.getElementById('startProdTime');
            if (startProdTimeInput) startProdTimeInput.value = startProdTime;
        }

        const savedCabinetCount = data.cabinetData
            ? Object.keys(data.cabinetData).reduce((max, key) => Math.max(max, parseInt(key, 10) || 0), NUM_CABINETS)
            : NUM_CABINETS;

        initializeCabinetRows(savedCabinetCount);

        // Load cabinet data (rows, hatcher, all info)
        if (data.cabinetData) {
            for (let cabinet = 1; cabinet <= NUM_CABINETS; cabinet++) {
                if (data.cabinetData[cabinet]) {
                    const cabData = data.cabinetData[cabinet];

                    // Set hatcher
                    cabinetRows[cabinet].hatcher = cabData.hatcher || '';

                    // Reset and load rows with all data
                    cabinetRows[cabinet].rows = [];
                    if (cabData.rows && cabData.rows.length > 0) {
                        cabData.rows.forEach(rowData => {
                            cabinetRows[cabinet].rows.push({
                                id: rowData.id,
                                dryness: rowData.dryness || '',
                                membrane: rowData.membrane || '',
                                cleanliness: rowData.cleanliness || '',
                                totalScore: rowData.totalScore || '-',
                                drynessAvg: rowData.drynessAvg || '-',
                                membraneAvg: rowData.membraneAvg || '-',
                                cleanlinessAvg: rowData.cleanlinessAvg || '-',
                                cabinetAvg: rowData.cabinetAvg || '-',
                                status: rowData.status || '-'
                            });
                        });
                    }
                }
            }
        }

        const hatchTimeInput = document.getElementById('hatchTime');
        if (hatchTimeInput) hatchTimeInput.value = data.hatchTime || '';
    } else {
        // No saved data, initialize with default
        initializeCabinetRows(5);
    }

    // Generate table AFTER loading all data (or with default data if no saved data)
    generateTable();
}

// Load data button handler
function loadData() {
    loadSavedData();
    alert('โหลดข้อมูลเรียบร้อย!');
}

// Clear all data
function clearData() {
    if (!confirm('คุณต้องการล้างข้อมูลทั้งหมดหรือไม่?')) {
        return;
    }

    // Clear start production time
    startProdTime = '';
    const startProdTimeInput = document.getElementById('startProdTime');
    if (startProdTimeInput) startProdTimeInput.value = '';

    // Clear hatcher data
    for (let cabinet = 1; cabinet <= NUM_CABINETS; cabinet++) {
        const hatcherInput = document.getElementById(`hatcher-${cabinet}`);
        if (hatcherInput) hatcherInput.value = '';
    }

    // Reset cabinetRows to default (3 rows per cabinet)
    initializeCabinetRows(5);

    // Refresh table and recalculate
    generateTable();
    for (let cabinet = 1; cabinet <= NUM_CABINETS; cabinet++) {
        calculateDrynessCabinetAverage(cabinet);
        calculateMembraneCabinetAverage(cabinet);
        calculateCleanlinessCabinetAverage(cabinet);
        calculateCabinetAverage(cabinet);
    }

    // Clear localStorage
    localStorage.removeItem('chickenHatchingData');
    alert('ล้างข้อมูลเรียบร้อย!');
}

// Add a new cabinet
function addCabinet() {
    if (!confirm('คุณต้องการเพิ่มตู้เกิดใหม่หรือไม่?')) {
        return;
    }

    const newCabinetNumber = NUM_CABINETS + 1;
    cabinetRows[newCabinetNumber] = {
        hatcher: '',
        rows: []
    };

    for (let j = 1; j <= NUM_ROWS; j++) {
        cabinetRows[newCabinetNumber].rows.push({
            id: j,
            dryness: '',
            membrane: '',
            cleanliness: '',
            totalScore: '-',
            drynessAvg: '-',
            membraneAvg: '-',
            cleanlinessAvg: '-',
            cabinetAvg: '-',
            status: '-'
        });
    }

    NUM_CABINETS = newCabinetNumber;
    generateTable();
    saveData();

    alert(`เพิ่มตู้ที่ ${newCabinetNumber} เรียบร้อย! (ทั้งหมด ${NUM_CABINETS} ตู้)`);
}

// Delete a cabinet
function deleteCabinet() {
    if (NUM_CABINETS <= 1) {
        alert('ต้องมีอย่างน้อย 1 ตู้เกิด');
        return;
    }

    const cabinetNumber = prompt(`กรุณาระบุหมายเลขตู้ที่ต้องการลบ (1-${NUM_CABINETS})`);

    if (cabinetNumber === null) {
        return;
    }

    const cabinet = parseInt(cabinetNumber, 10);

    if (Number.isNaN(cabinet) || cabinet < 1 || cabinet > NUM_CABINETS) {
        alert(`กรุณากรอกหมายเลขตู้ที่ถูกต้อง (1-${NUM_CABINETS})`);
        return;
    }

    if (!confirm(`คุณต้องการลบตู้ที่ ${cabinet} หรือไม่?`)) {
        return;
    }

    // Remove cabinet from data structure
    delete cabinetRows[cabinet];

    // Reindex cabinets to maintain sequential numbering
    const newCabinetRows = {};
    let newIndex = 1;
    for (let i = 1; i <= NUM_CABINETS; i++) {
        if (cabinetRows[i]) {
            newCabinetRows[newIndex] = cabinetRows[i];
            newIndex++;
        }
    }
    cabinetRows = newCabinetRows;
    NUM_CABINETS = newIndex - 1;

    generateTable();
    saveData();

    alert(`ลบตู้ที่ ${cabinet} เรียบร้อย! (ทั้งหมด ${NUM_CABINETS} ตู้)`);
}

// Add a new row to a specific cabinet
function addRowToCabinet() {
    const cabinetNumber = prompt(`กรุณาระบุหมายเลขตู้ที่ต้องการเพิ่มคัน (1-${NUM_CABINETS})`);

    if (cabinetNumber === null) {
        return;
    }

    const cabinet = parseInt(cabinetNumber, 10);

    if (Number.isNaN(cabinet) || cabinet < 1 || cabinet > NUM_CABINETS) {
        alert(`กรุณากรอกหมายเลขตู้ที่ถูกต้อง (1-${NUM_CABINETS})`);
        return;
    }

    const newRowId = cabinetRows[cabinet].rows.length + 1;
    cabinetRows[cabinet].rows.push({
        id: newRowId,
        dryness: '',
        membrane: '',
        cleanliness: '',
        totalScore: '-',
        drynessAvg: '-',
        membraneAvg: '-',
        cleanlinessAvg: '-',
        cabinetAvg: '-',
        status: '-'
    });

    generateTable();
    calculateDrynessCabinetAverage(cabinet);
    calculateMembraneCabinetAverage(cabinet);
    calculateCleanlinessCabinetAverage(cabinet);
    calculateCabinetAverage(cabinet);
    saveData();

    alert(`เพิ่มคันใหม่ให้ตู้ที่ ${cabinet} เรียบร้อย! (ทั้งหมด ${cabinetRows[cabinet].rows.length} คัน)`);
}
