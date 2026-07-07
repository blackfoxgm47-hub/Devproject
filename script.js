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
});

// Save start production time
function saveStartProdTime() {
    const startProdTimeInput = document.getElementById('startProdTime');
    const statusElement = document.getElementById('startProdStatus');

    if (startProdTimeInput) {
        const selectedTime = startProdTimeInput.value;

        // Check if time is selected
        if (!selectedTime) {
            if (statusElement) {
                statusElement.textContent = 'กรุณาเลือกเวลาก่อนบันทึก';
                statusElement.style.color = '#f44336';
            }
            return;
        }

        startProdTime = selectedTime;
        saveData();

        // Show success status message
        if (statusElement) {
            statusElement.textContent = `บันทึกเริ่มเวลาที่ ${startProdTime} แล้ว`;
            statusElement.style.color = '#4caf50';
        }
    }
}

// Calculate hatch time based on passed cabinets and percentage
function calculateHatchTime(passedCabinets, percentage) {
    const pct = parseFloat(percentage);

    // Special case: 65%-50% for 2-12 cabinets
    if (passedCabinets >= 2 && passedCabinets <= 12 && pct >= 50 && pct <= 65) {
        return '10:00 น.';
    }

    // Start prod at 10:00 น.
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

// Generate table rows
function generateTable() {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';

    for (let cabinet = 1; cabinet <= NUM_CABINETS; cabinet++) {
        const rows = cabinetRows[cabinet].rows;
        const rowCount = rows.length;

        for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
            const row = rowIndex + 1;
            const rowData = rows[rowIndex];
            const tr = document.createElement('tr');

            // Merge hatcher cell for first row only
            const hatcherCell = row === 1
                ? `<td rowspan="${rowCount}" class="hatcher-cell"><input type="text" class="input-field hatcher-input" data-cabinet="${cabinet}" id="hatcher-${cabinet}" placeholder="กรอกข้อมูลตู้เกิด" value="${cabinetRows[cabinet].hatcher}"></td>`
                : '';

            // Merge cabinet cell for first row only
            const cabinetCell = row === 1
                ? `<td rowspan="${rowCount}">${cabinet}</td>`
                : '';

            // Merge dryness average cell for first row only
            const drynessAvgCell = row === 1
                ? `<td rowspan="${rowCount}" class="readonly" id="dryness-avg-cabinet-${cabinet}">${rowData.drynessAvg}</td>`
                : '';

            // Merge membrane average cell for first row only
            const membraneAvgCell = row === 1
                ? `<td rowspan="${rowCount}" class="readonly" id="membrane-avg-cabinet-${cabinet}">${rowData.membraneAvg}</td>`
                : '';

            // Merge cleanliness average cell for first row only
            const cleanlinessAvgCell = row === 1
                ? `<td rowspan="${rowCount}" class="readonly" id="cleanliness-avg-cabinet-${cabinet}">${rowData.cleanlinessAvg}</td>`
                : '';

            // Merge average cell for first row only
            const avgCell = row === 1
                ? `<td rowspan="${rowCount}" class="readonly" id="avg-cabinet-${cabinet}">${rowData.cabinetAvg}</td>`
                : '';

            // Merge status cell for first row only
            const statusCell = row === 1
                ? `<td rowspan="${rowCount}" class="readonly" id="status-cabinet-${cabinet}">${rowData.status}</td>`
                : '';

            tr.innerHTML = `
                ${hatcherCell}
                ${cabinetCell}
                <td>${row}</td>
                <td>
                    <div class="score-buttons" data-cabinet="${cabinet}" data-rowindex="${rowIndex}" data-type="dryness">
                        <button type="button" class="score-btn" onclick="setScore(${cabinet}, ${rowIndex}, 'dryness', 1)">1</button>
                        <button type="button" class="score-btn" onclick="setScore(${cabinet}, ${rowIndex}, 'dryness', 2)">2</button>
                        <button type="button" class="score-btn" onclick="setScore(${cabinet}, ${rowIndex}, 'dryness', 3)">3</button>
                        <input type="hidden" class="score-input" data-cabinet="${cabinet}" data-rowindex="${rowIndex}" data-type="dryness" value="">
                    </div>
                </td>
                ${drynessAvgCell}
                <td>
                    <div class="score-buttons" data-cabinet="${cabinet}" data-rowindex="${rowIndex}" data-type="membrane">
                        <button type="button" class="score-btn" onclick="setScore(${cabinet}, ${rowIndex}, 'membrane', 1)">1</button>
                        <button type="button" class="score-btn" onclick="setScore(${cabinet}, ${rowIndex}, 'membrane', 2)">2</button>
                        <input type="hidden" class="score-input" data-cabinet="${cabinet}" data-rowindex="${rowIndex}" data-type="membrane" value="">
                    </div>
                </td>
                ${membraneAvgCell}
                <td>
                    <div class="score-buttons" data-cabinet="${cabinet}" data-rowindex="${rowIndex}" data-type="cleanliness">
                        <button type="button" class="score-btn" onclick="setScore(${cabinet}, ${rowIndex}, 'cleanliness', 1)">1</button>
                        <button type="button" class="score-btn" onclick="setScore(${cabinet}, ${rowIndex}, 'cleanliness', 2)">2</button>
                        <input type="hidden" class="score-input" data-cabinet="${cabinet}" data-rowindex="${rowIndex}" data-type="cleanliness" value="">
                    </div>
                </td>
                ${cleanlinessAvgCell}
                <td class="readonly" id="total-score-${cabinet}-${rowIndex}">${rowData.totalScore}</td>
                ${avgCell}
                ${statusCell}
                <td><button onclick="deleteRow(${cabinet}, ${rowIndex})" class="btn-delete">ลบ</button></td>
            `;
            tableBody.appendChild(tr);

            // Add event listener to hatcher input
            if (row === 1) {
                const hatcherInput = tr.querySelector('input.hatcher-input');
                if (hatcherInput) {
                    hatcherInput.addEventListener('change', function() {
                        cabinetRows[cabinet].hatcher = this.value;
                        saveData();
                    });
                }
            }

            // Load saved data for this row from cabinetRows
            if (rowData) {
                // Set dryness value and button state
                if (rowData.dryness !== '') {
                    const drynessInput = tr.querySelector(`input[data-type="dryness"]`);
                    if (drynessInput) drynessInput.value = rowData.dryness;
                    const drynessButtons = tr.querySelectorAll(`.score-buttons[data-type="dryness"] .score-btn`);
                    drynessButtons.forEach(btn => {
                        if (parseInt(btn.textContent) === parseInt(rowData.dryness)) {
                            btn.classList.add('active');
                        }
                    });
                }

                // Set membrane value and button state
                if (rowData.membrane !== '') {
                    const membraneInput = tr.querySelector(`input[data-type="membrane"]`);
                    if (membraneInput) membraneInput.value = rowData.membrane;
                    const membraneButtons = tr.querySelectorAll(`.score-buttons[data-type="membrane"] .score-btn`);
                    membraneButtons.forEach(btn => {
                        if (parseInt(btn.textContent) === parseInt(rowData.membrane)) {
                            btn.classList.add('active');
                        }
                    });
                }

                // Set cleanliness value and button state
                if (rowData.cleanliness !== '') {
                    const cleanlinessInput = tr.querySelector(`input[data-type="cleanliness"]`);
                    if (cleanlinessInput) cleanlinessInput.value = rowData.cleanliness;
                    const cleanlinessButtons = tr.querySelectorAll(`.score-buttons[data-type="cleanliness"] .score-btn`);
                    cleanlinessButtons.forEach(btn => {
                        if (parseInt(btn.textContent) === parseInt(rowData.cleanliness)) {
                            btn.classList.add('active');
                        }
                    });
                }
            }
        }
    }

    // Update summary details after generating table
    updateSummaryDetails();
}

// Set score from clickable button
function setScore(cabinet, rowIndex, type, score) {
    const hiddenInput = document.querySelector(`input[data-cabinet="${cabinet}"][data-rowindex="${rowIndex}"][data-type="${type}"]`);
    const buttons = document.querySelectorAll(`.score-buttons[data-cabinet="${cabinet}"][data-rowindex="${rowIndex}"][data-type="${type}"] .score-btn`);

    if (hiddenInput) {
        hiddenInput.value = score;

        // Update data in cabinetRows
        const rowData = cabinetRows[cabinet].rows[rowIndex];
        if (type === 'dryness') {
            rowData.dryness = score;
        } else if (type === 'membrane') {
            rowData.membrane = score;
        } else if (type === 'cleanliness') {
            rowData.cleanliness = score;
        }

        // Update button styles
        buttons.forEach(btn => {
            btn.classList.remove('active');
            if (parseInt(btn.textContent) === score) {
                btn.classList.add('active');
            }
        });

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
    }
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
    const status = avg !== null && avg >= 4.00 ? 'ผ่าน' : (avg !== null ? 'ไม่ผ่าน' : '-');

    // Update all rows' cabinetAvg and status
    rows.forEach(rowData => {
        rowData.cabinetAvg = avgValue;
        rowData.status = status;
    });

    // Update DOM
    document.getElementById(`avg-cabinet-${cabinet}`).textContent = avgValue;
    document.getElementById(`status-cabinet-${cabinet}`).textContent = status;

    // Update summary details
    updateSummaryDetails();
}

// Delete a specific row
function deleteRow(cabinet, rowIndex) {
    const displayRow = rowIndex + 1;
    if (!confirm(`คุณต้องการลบ ตู้ที่ ${cabinet} คันที่ ${displayRow} หรือไม่?`)) {
        return;
    }

    // Remove row from data structure
    cabinetRows[cabinet].rows.splice(rowIndex, 1);
    
    // Regenerate table to reorder rows
    generateTable();
    
    // Recalculate averages
    calculateDrynessCabinetAverage(cabinet);
    calculateMembraneCabinetAverage(cabinet);
    calculateCleanlinessCabinetAverage(cabinet);
    calculateCabinetAverage(cabinet);
    
    // Save updated data to localStorage
    saveData();
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

    const percentage = totalCabinets > 0 ? ((passedCabinets / totalCabinets) * 100).toFixed(2) : '0.00';

    html += '<div class="overall-detail">';
    html += '<span class="detail-label">%จำนวนตู้ที่มีคะแนน >4 คะแนน:</span>';
    html += `<span class="detail-value">${percentage}%</span>`;
    html += '</div>';

    // Calculate hatch time based on passed cabinets and percentage
    const hatchTime = calculateHatchTime(passedCabinets, percentage);

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

// Save data with alert (for user action)
function saveDataWithAlert() {
    saveData();
    alert('บันทึกข้อมูลเรียบร้อย!');
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
