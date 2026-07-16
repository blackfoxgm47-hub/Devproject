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
    // history[0] is the newest record (unshift is used when saving), so it's shown on top.
    // The sequence number reflects the order the record was originally saved in
    // (oldest = 1, counting up), not its position in this array.
    const totalRecords = history.length;
    history.forEach((record, index) => {
        // Use the persistent sequence number saved with the record; fall back to a
        // calculated value for older records that were saved before this field existed.
        const sequenceNumber = record.sequenceNumber !== undefined
            ? record.sequenceNumber
            : totalRecords - index;
        const date = new Date(record.timestamp).toLocaleString('th-TH');
        const passedCabinets = record.passedCabinets || 0;
        const totalCabinets = record.totalCabinets || 0;
        const percentage = totalCabinets > 0 ? Math.round((passedCabinets / totalCabinets) * 100) : 0;
        const hatchTime = record.hatchTime || '-';

        html += `
            <tr>
                <td>${sequenceNumber}</td>
                <td>${date}</td>
                <td>${record.startProdTime || '-'}</td>
                <td>${totalCabinets}</td>
                <td>${percentage}% (${passedCabinets}/${totalCabinets})</td>
                <td>${hatchTime}</td>
                <td>
                    <button onclick="viewDetail(${index})" class="btn btn-add" style="padding: 6px 12px; font-size: 12px;">ดู</button>
                    <button onclick="deleteHistory(${index})" class="btn btn-delete">ลบ</button>
                </td>
            </tr>
        `;
    });

    historyBody.innerHTML = html;
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
    const percentage = record.totalCabinets > 0 ? Math.round((record.passedCabinets / record.totalCabinets) * 100) : 0;
    html += `<div class="overall-detail"><span class="detail-label">%จำนวนตู้ที่มีคะแนน ≥4 คะแนน:</span><span class="detail-value">${percentage}%</span></div>`;
    html += `<div class="overall-detail"><span class="detail-label">เวลาออกลูกไก่:</span><span class="detail-value">${record.hatchTime || '-'}</span></div>`;
    html += '</div>';

    // Cabinet details - ผลลัพธ์ของแต่ละตู้
    if (record.cabinetRows) {
        html += '<div class="summary-cabinet-grid">';
        for (let cabinet = 1; cabinet <= 12; cabinet++) {
            if (record.cabinetRows[cabinet]) {
                const cabinetData = record.cabinetRows[cabinet];
                const avg = cabinetData.rows[0]?.cabinetAvg || '-';
                const status = cabinetData.rows[0]?.status || '-';

                html += '<div class="summary-cabinet-item">';
                html += `<div class="cabinet-header">ตู้ที่ ${cabinet}</div>`;
                html += `<div class="cabinet-detail"><span class="detail-label">ค่าเฉลี่ย:</span><span class="detail-value">${avg}</span></div>`;
                const statusClass = status === 'ผ่าน' ? 'status-pass' : (status === 'ไม่ผ่าน' ? 'status-fail' : '');
                html += `<div class="cabinet-detail"><span class="detail-label">สถานะ:</span><span class="detail-value ${statusClass}">${status}</span></div>`;
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
