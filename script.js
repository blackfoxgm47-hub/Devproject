// Configuration
const NUM_CABINETS = 5;
const NUM_ROWS = 3;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    generateTable();
    loadSavedData();
});

// Generate table rows
function generateTable() {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';

    for (let cabinet = 1; cabinet <= NUM_CABINETS; cabinet++) {
        for (let row = 1; row <= NUM_ROWS; row++) {
            const tr = document.createElement('tr');
            
            // Merge cabinet cell for first row only
            const cabinetCell = row === 1 
                ? `<td rowspan="${NUM_ROWS}">${cabinet}</td>` 
                : '';
            
            // Merge average cell for first row only
            const avgCell = row === 1 
                ? `<td rowspan="${NUM_ROWS}" class="readonly" id="avg-cabinet-${cabinet}">-</td>` 
                : '';
            
            // Merge status cell for first row only
            const statusCell = row === 1 
                ? `<td rowspan="${NUM_ROWS}" class="readonly" id="status-cabinet-${cabinet}">-</td>` 
                : '';
            
            tr.innerHTML = `
                ${cabinetCell}
                <td>${row}</td>
                <td>
                    <div class="score-buttons" data-cabinet="${cabinet}" data-row="${row}" data-type="dryness">
                        <button type="button" class="score-btn" onclick="setScore(${cabinet}, ${row}, 'dryness', 1)">1</button>
                        <button type="button" class="score-btn" onclick="setScore(${cabinet}, ${row}, 'dryness', 2)">2</button>
                        <button type="button" class="score-btn" onclick="setScore(${cabinet}, ${row}, 'dryness', 3)">3</button>
                        <input type="hidden" class="score-input" data-cabinet="${cabinet}" data-row="${row}" data-type="dryness" value="">
                    </div>
                </td>
                <td class="readonly" id="dryness-score-${cabinet}-${row}">-</td>
                <td>
                    <div class="score-buttons" data-cabinet="${cabinet}" data-row="${row}" data-type="membrane">
                        <button type="button" class="score-btn" onclick="setScore(${cabinet}, ${row}, 'membrane', 1)">1</button>
                        <button type="button" class="score-btn" onclick="setScore(${cabinet}, ${row}, 'membrane', 2)">2</button>
                        <input type="hidden" class="score-input" data-cabinet="${cabinet}" data-row="${row}" data-type="membrane" value="">
                    </div>
                </td>
                <td class="readonly" id="membrane-score-${cabinet}-${row}">-</td>
                <td>
                    <div class="score-buttons" data-cabinet="${cabinet}" data-row="${row}" data-type="cleanliness">
                        <button type="button" class="score-btn" onclick="setScore(${cabinet}, ${row}, 'cleanliness', 1)">1</button>
                        <button type="button" class="score-btn" onclick="setScore(${cabinet}, ${row}, 'cleanliness', 2)">2</button>
                        <input type="hidden" class="score-input" data-cabinet="${cabinet}" data-row="${row}" data-type="cleanliness" value="">
                    </div>
                </td>
                <td class="readonly" id="cleanliness-score-${cabinet}-${row}">-</td>
                <td class="readonly" id="total-score-${cabinet}-${row}">-</td>
                ${avgCell}
                ${statusCell}
                <td><button onclick="deleteRow(${cabinet}, ${row})" class="btn-delete">ลบ</button></td>
            `;
            tableBody.appendChild(tr);
        }
    }
}

// Set score from clickable button
function setScore(cabinet, row, type, score) {
    const hiddenInput = document.querySelector(`input[data-cabinet="${cabinet}"][data-row="${row}"][data-type="${type}"]`);
    const buttons = document.querySelectorAll(`.score-buttons[data-cabinet="${cabinet}"][data-row="${row}"][data-type="${type}"] .score-btn`);
    
    if (hiddenInput) {
        hiddenInput.value = score;
        
        // Update button styles
        buttons.forEach(btn => {
            btn.classList.remove('active');
            if (parseInt(btn.textContent) === score) {
                btn.classList.add('active');
            }
        });
        
        // Show score in the respective average column
        const scoreId = `${type}-score-${cabinet}-${row}`;
        document.getElementById(scoreId).textContent = score;
        
        calculateTotalScore(cabinet, row);
    }
}

// Calculate total score for a specific row
function calculateTotalScore(cabinet, row) {
    const drynessInput = document.querySelector(`input[data-cabinet="${cabinet}"][data-row="${row}"][data-type="dryness"]`);
    const membraneInput = document.querySelector(`input[data-cabinet="${cabinet}"][data-row="${row}"][data-type="membrane"]`);
    const cleanlinessInput = document.querySelector(`input[data-cabinet="${cabinet}"][data-row="${row}"][data-type="cleanliness"]`);

    const d = drynessInput && drynessInput.value !== '' ? parseFloat(drynessInput.value) : 0;
    const m = membraneInput && membraneInput.value !== '' ? parseFloat(membraneInput.value) : 0;
    const c = cleanlinessInput && cleanlinessInput.value !== '' ? parseFloat(cleanlinessInput.value) : 0;

    if (d > 0 || m > 0 || c > 0) {
        const totalScore = d + m + c;
        document.getElementById(`total-score-${cabinet}-${row}`).textContent = totalScore;
    } else {
        document.getElementById(`total-score-${cabinet}-${row}`).textContent = '-';
    }
    
    // Calculate cabinet average
    calculateCabinetAverage(cabinet);
}

// Calculate average score for a specific cabinet
function calculateCabinetAverage(cabinet) {
    const totalScores = [];
    
    for (let row = 1; row <= NUM_ROWS; row++) {
        const totalScoreEl = document.getElementById(`total-score-${cabinet}-${row}`);
        if (totalScoreEl && totalScoreEl.textContent !== '-') {
            totalScores.push(parseFloat(totalScoreEl.textContent));
        }
    }
    
    const avg = calculateAverage(totalScores);
    document.getElementById(`avg-cabinet-${cabinet}`).textContent = avg !== null ? avg.toFixed(2) : '-';
    
    // Calculate status based on average
    if (avg !== null) {
        const status = avg >= 4.00 ? 'ผ่าน' : 'ไม่ผ่าน';
        document.getElementById(`status-cabinet-${cabinet}`).textContent = status;
    } else {
        document.getElementById(`status-cabinet-${cabinet}`).textContent = '-';
    }
}

// Delete a specific row
function deleteRow(cabinet, row) {
    if (!confirm(`คุณต้องการลบ ตู้ที่ ${cabinet} คันที่ ${row} หรือไม่?`)) {
        return;
    }

    const drynessInput = document.querySelector(`input[data-cabinet="${cabinet}"][data-row="${row}"][data-type="dryness"]`);
    const membraneInput = document.querySelector(`input[data-cabinet="${cabinet}"][data-row="${row}"][data-type="membrane"]`);
    const cleanlinessInput = document.querySelector(`input[data-cabinet="${cabinet}"][data-row="${row}"][data-type="cleanliness"]`);
    const statusSelect = document.querySelector(`select[data-cabinet="${cabinet}"][data-row="${row}"]`);

    if (drynessInput) drynessInput.value = '';
    if (membraneInput) membraneInput.value = '';
    if (cleanlinessInput) cleanlinessInput.value = '';
    if (statusSelect) statusSelect.value = '';

    // Clear score button active states for all types
    ['dryness', 'membrane', 'cleanliness'].forEach(type => {
        const buttons = document.querySelectorAll(`.score-buttons[data-cabinet="${cabinet}"][data-row="${row}"][data-type="${type}"] .score-btn`);
        buttons.forEach(btn => btn.classList.remove('active'));
        document.getElementById(`${type}-score-${cabinet}-${row}`).textContent = '-';
    });

    document.getElementById(`total-score-${cabinet}-${row}`).textContent = '-';
    calculateCabinetAverage(cabinet);
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
        observations: [],
        summary: {
            text: document.getElementById('summary').value,
            hatchTime: document.getElementById('hatchTime').value
        },
        calculation: {
            score: document.getElementById('calcScore').value,
            total: document.getElementById('calcTotal').value,
            percentage: document.getElementById('percentageResult').textContent
        }
    };

    // Collect observation data
    for (let cabinet = 1; cabinet <= NUM_CABINETS; cabinet++) {
        for (let row = 1; row <= NUM_ROWS; row++) {
            const drynessInput = document.querySelector(`input[data-cabinet="${cabinet}"][data-row="${row}"][data-type="dryness"]`);
            const membraneInput = document.querySelector(`input[data-cabinet="${cabinet}"][data-row="${row}"][data-type="membrane"]`);
            const cleanlinessInput = document.querySelector(`input[data-cabinet="${cabinet}"][data-row="${row}"][data-type="cleanliness"]`);
            const statusSelect = document.querySelector(`select[data-cabinet="${cabinet}"][data-row="${row}"]`);

            data.observations.push({
                cabinet: cabinet,
                row: row,
                drynessScore: drynessInput ? drynessInput.value : '',
                membraneScore: membraneInput ? membraneInput.value : '',
                cleanlinessScore: cleanlinessInput ? cleanlinessInput.value : '',
                status: statusSelect ? statusSelect.value : ''
            });
        }
    }

    localStorage.setItem('chickenHatchingData', JSON.stringify(data));
    alert('บันทึกข้อมูลเรียบร้อย!');
}

// Load data from localStorage
function loadSavedData() {
    const savedData = localStorage.getItem('chickenHatchingData');
    if (!savedData) return;

    const data = JSON.parse(savedData);

    // Criteria section is now static, no need to load

    // Load summary
    document.getElementById('summary').value = data.summary.text || '';
    document.getElementById('hatchTime').value = data.summary.hatchTime || '';

    // Load calculation
    document.getElementById('calcScore').value = data.calculation.score || '';
    document.getElementById('calcTotal').value = data.calculation.total || '';
    document.getElementById('percentageResult').textContent = data.calculation.percentage || '0';

    // Load observations
    data.observations.forEach(obs => {
        const drynessInput = document.querySelector(`input[data-cabinet="${obs.cabinet}"][data-row="${obs.row}"][data-type="dryness"]`);
        const membraneInput = document.querySelector(`input[data-cabinet="${obs.cabinet}"][data-row="${obs.row}"][data-type="membrane"]`);
        const cleanlinessInput = document.querySelector(`input[data-cabinet="${obs.cabinet}"][data-row="${obs.row}"][data-type="cleanliness"]`);
        const statusSelect = document.querySelector(`select[data-cabinet="${obs.cabinet}"][data-row="${obs.row}"]`);

        // Handle all three score types with buttons
        ['dryness', 'membrane', 'cleanliness'].forEach(type => {
            const input = document.querySelector(`input[data-cabinet="${obs.cabinet}"][data-row="${obs.row}"][data-type="${type}"]`);
            const scoreKey = `${type}Score`;
            
            if (input && obs[scoreKey]) {
                input.value = obs[scoreKey];
                // Update button active state
                const buttons = document.querySelectorAll(`.score-buttons[data-cabinet="${obs.cabinet}"][data-row="${obs.row}"][data-type="${type}"] .score-btn`);
                buttons.forEach(btn => {
                    btn.classList.remove('active');
                    if (parseInt(btn.textContent) === parseInt(obs[scoreKey])) {
                        btn.classList.add('active');
                    }
                });
                // Update score display
                document.getElementById(`${type}-score-${obs.cabinet}-${obs.row}`).textContent = obs[scoreKey];
            }
        });

        if (statusSelect) statusSelect.value = obs.status;
    });

    // Recalculate total scores after loading
    for (let cabinet = 1; cabinet <= NUM_CABINETS; cabinet++) {
        for (let row = 1; row <= NUM_ROWS; row++) {
            calculateTotalScore(cabinet, row);
        }
    }
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

    // Criteria section is now static, no need to clear

    // Clear summary
    document.getElementById('summary').value = '';
    document.getElementById('hatchTime').value = '';

    // Clear calculation
    document.getElementById('calcScore').value = '';
    document.getElementById('calcTotal').value = '';
    document.getElementById('percentageResult').textContent = '0';

    // Clear all inputs
    document.querySelectorAll('.score-input').forEach(input => input.value = '');
    document.querySelectorAll('.status-select').forEach(select => select.value = '');

    // Clear total scores
    for (let cabinet = 1; cabinet <= NUM_CABINETS; cabinet++) {
        for (let row = 1; row <= NUM_ROWS; row++) {
            document.getElementById(`total-score-${cabinet}-${row}`).textContent = '-';
            document.getElementById(`dryness-score-${cabinet}-${row}`).textContent = '-';
            document.getElementById(`membrane-score-${cabinet}-${row}`).textContent = '-';
            document.getElementById(`cleanliness-score-${cabinet}-${row}`).textContent = '-';
        }
        document.getElementById(`avg-cabinet-${cabinet}`).textContent = '-';
    }

    // Clear localStorage
    localStorage.removeItem('chickenHatchingData');
    alert('ล้างข้อมูลเรียบร้อย!');
}
