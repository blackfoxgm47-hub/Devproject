// Configuration
let NUM_CABINETS = 5;
const NUM_ROWS = 3;

// Data structure to store rows for each cabinet
let cabinetRows = {};

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
    const score = parseFloat(document.getElementById('calcScore').value);
    const total = parseFloat(document.getElementById('calcTotal').value);

    if (isNaN(score) || isNaN(total) || total === 0) {
        alert('กรุณากรอกคะแนนและจำนวนให้ถูกต้อง');
        return;
    }

    const percentage = (score / total) * 100;
    document.getElementById('percentageResult').textContent = percentage.toFixed(2);
}

// Save data to localStorage
function saveData() {
    const data = {
        summary: {
            text: document.getElementById('summary').value,
            hatchTime: document.getElementById('hatchTime').value
        },
        calculation: {
            score: document.getElementById('calcScore').value,
            total: document.getElementById('calcTotal').value,
            percentage: document.getElementById('percentageResult').textContent
        },
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

        // Load summary
        document.getElementById('summary').value = data.summary.text || '';
        document.getElementById('hatchTime').value = data.summary.hatchTime || '';

        // Load calculation
        document.getElementById('calcScore').value = data.calculation.score || '';
        document.getElementById('calcTotal').value = data.calculation.total || '';
        document.getElementById('percentageResult').textContent = data.calculation.percentage || '0';
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

    // Clear hatcher data
    for (let cabinet = 1; cabinet <= NUM_CABINETS; cabinet++) {
        const hatcherInput = document.getElementById(`hatcher-${cabinet}`);
        if (hatcherInput) hatcherInput.value = '';
    }

    // Clear summary
    document.getElementById('summary').value = '';
    document.getElementById('hatchTime').value = '';

    // Clear calculation
    document.getElementById('calcScore').value = '';
    document.getElementById('calcTotal').value = '';
    document.getElementById('percentageResult').textContent = '0';

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

// Add a new cabinet to the table
function addCabinetToTable() {
    const newCabinetNumber = NUM_CABINETS + 1;

    cabinetRows[newCabinetNumber] = {
        hatcher: '',
        rows: []
    };

    for (let rowIndex = 1; rowIndex <= NUM_ROWS; rowIndex++) {
        cabinetRows[newCabinetNumber].rows.push({
            id: rowIndex,
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
    calculateDrynessCabinetAverage(newCabinetNumber);
    calculateMembraneCabinetAverage(newCabinetNumber);
    calculateCleanlinessCabinetAverage(newCabinetNumber);
    calculateCabinetAverage(newCabinetNumber);
    saveData();

    alert(`เพิ่มตู้เกิดใหม่เรียบร้อย! (ตู้ที่ ${newCabinetNumber})`);
}

// Delete a cabinet from the table
function deleteCabinetFromTable() {
    const cabinetNumber = prompt(`กรุณาระบุหมายเลขตู้ที่ต้องการลบ (1-${NUM_CABINETS})`);

    if (cabinetNumber === null) {
        return;
    }

    const cabinet = parseInt(cabinetNumber, 10);

    if (Number.isNaN(cabinet) || cabinet < 1 || cabinet > NUM_CABINETS) {
        alert(`กรุณากรอกหมายเลขตู้ที่ถูกต้อง (1-${NUM_CABINETS})`);
        return;
    }

    if (!confirm(`คุณต้องการลบตู้ที่ ${cabinet} ออกจากตารางหรือไม่?`)) {
        return;
    }

    delete cabinetRows[cabinet];

    const reindexedCabinets = {};
    let newIndex = 1;

    Object.keys(cabinetRows)
        .sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
        .forEach((key) => {
            reindexedCabinets[newIndex] = cabinetRows[key];
            newIndex += 1;
        });

    cabinetRows = reindexedCabinets;
    NUM_CABINETS = Object.keys(cabinetRows).length;

    generateTable();
    for (let i = 1; i <= NUM_CABINETS; i++) {
        calculateDrynessCabinetAverage(i);
        calculateMembraneCabinetAverage(i);
        calculateCleanlinessCabinetAverage(i);
        calculateCabinetAverage(i);
    }
    saveData();

    alert(`ลบตู้ที่ ${cabinet} ออกจากตารางเรียบร้อยแล้ว`);
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
