// History Management for Chicken Hatching Records

const HISTORY_KEY = 'chickenHatchingHistory';

// Load history from localStorage
function loadHistory() {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    const historyBody = document.getElementById('historyBody');
    
    if (history.length === 0) {
        historyBody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #6c757d;">ไม่มีข้อมูลประวัติ</td></tr>';
        return;
    }

    let html = '';
    history.forEach((record, index) => {
        const date = new Date(record.timestamp).toLocaleString('th-TH');
        const passedCabinets = record.passedCabinets || 0;
        const totalCabinets = record.totalCabinets || 0;
        const percentage = totalCabinets > 0 ? Math.round((passedCabinets / totalCabinets) * 100) : 0;
        const hatchTime = record.hatchTime || '-';
        const summary = record.summary || '-';

        html += `
            <tr>
                <td>${date}</td>
                <td>${record.startProdTime || '-'}</td>
                <td>${totalCabinets}</td>
                <td>${percentage}% (${passedCabinets}/${totalCabinets})</td>
                <td>${hatchTime}</td>
                <td>${summary}</td>
                <td>
                    <button onclick="viewDetail(${index})" class="btn btn-add" style="padding: 6px 12px; font-size: 12px;">ดู</button>
                    <button onclick="deleteHistory(${index})" class="btn btn-delete">ลบ</button>
                </td>
            </tr>
        `;
    });

    historyBody.innerHTML = html;
}

// Save record to history
function saveToHistory(data) {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    
    const record = {
        timestamp: new Date().toISOString(),
        startProdTime: data.startProdTime,
        cabinetRows: data.cabinetRows,
        summary: data.summary,
        passedCabinets: data.passedCabinets,
        totalCabinets: data.totalCabinets,
        hatchTime: data.hatchTime
    };

    history.unshift(record); // Add to beginning of array
    
    // Keep only last 50 records
    if (history.length > 50) {
        history.pop();
    }

    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

// View detail of a specific record
function viewDetail(index) {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    const record = history[index];
    
    if (!record) return;

    const detailsDiv = document.getElementById('historyDetails');
    const detailContent = document.getElementById('detailContent');
    
    let html = '<div class="summary-details">';
    
    // Summary info
    html += '<div class="overall-summary">';
    html += '<div class="overall-title">ข้อมูลสรุป</div>';
    html += `<div class="overall-detail"><span class="detail-label">วันที่:</span><span class="detail-value">${new Date(record.timestamp).toLocaleString('th-TH')}</span></div>`;
    html += `<div class="overall-detail"><span class="detail-label">เวลา Start prod:</span><span class="detail-value">${record.startProdTime || '-'}</span></div>`;
    html += `<div class="overall-detail"><span class="detail-label">จำนวนตู้ทั้งหมด:</span><span class="detail-value">${record.totalCabinets}</span></div>`;
    html += `<div class="overall-detail"><span class="detail-label">จำนวนตู้ที่ผ่าน:</span><span class="detail-value">${record.passedCabinets}</span></div>`;
    html += `<div class="overall-detail"><span class="detail-label">เวลาออกลูกไก่:</span><span class="detail-value">${record.hatchTime || '-'}</span></div>`;
    html += '</div>';

    // Cabinet details
    if (record.cabinetRows) {
        html += '<div class="summary-cabinet-grid">';
        for (let cabinet = 1; cabinet <= 12; cabinet++) {
            if (record.cabinetRows[cabinet]) {
                const cabinetData = record.cabinetRows[cabinet];
                const avg = cabinetData.rows[0]?.cabinetAvg || '-';
                
                html += '<div class="summary-cabinet-item">';
                html += `<div class="cabinet-header">ตู้ที่ ${cabinet}</div>`;
                html += `<div class="cabinet-detail"><span class="detail-label">ค่าเฉลี่ย:</span><span class="detail-value">${avg}</span></div>`;
                html += '</div>';
            }
        }
        html += '</div>';
    }

    html += '</div>';
    
    detailContent.innerHTML = html;
    detailsDiv.style.display = 'block';
}

// Delete a specific record
function deleteHistory(index) {
    if (!confirm('คุณต้องการลบข้อมูลนี้ใช่ไหม?')) return;
    
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    history.splice(index, 1);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    
    loadHistory();
    
    // Hide details if visible
    document.getElementById('historyDetails').style.display = 'none';
}

// Clear all history
function clearHistory() {
    if (!confirm('คุณต้องการล้างข้อมูลประวัติทั้งหมดใช่ไหม?')) return;
    
    localStorage.removeItem(HISTORY_KEY);
    loadHistory();
    
    // Hide details if visible
    document.getElementById('historyDetails').style.display = 'none';
}

// Load history on page load
document.addEventListener('DOMContentLoaded', function() {
    loadHistory();
});
