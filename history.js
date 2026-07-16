// History Management for Chicken Hatching Records

// Load history from API
async function loadHistory() {
    const history = await api.getRecords();
    const historyBody = document.getElementById('historyBody');

    if (history.length === 0) {
        historyBody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #6c757d;">ไม่มีข้อมูลประวัติ</td></tr>';
        return;
    }

    let html = '';
    history.forEach((record, index) => {
        const sequenceNumber = record.sequence_number;
        const date = new Date(record.timestamp).toLocaleString('th-TH');
        const passedCabinets = record.passed_cabinets || 0;
        const totalCabinets = record.total_cabinets || 0;
        const percentage = totalCabinets > 0 ? Math.round((passedCabinets / totalCabinets) * 100) : 0;
        const hatchTime = record.hatch_time || '-';

        html += `
            <tr>
                <td>${sequenceNumber}</td>
                <td>${date}</td>
                <td>${record.start_prod_time || '-'}</td>
                <td>${totalCabinets}</td>
                <td>${percentage}% (${passedCabinets}/${totalCabinets})</td>
                <td>${hatchTime}</td>
                <td>
                    <button onclick="viewDetail(${record.id})" class="btn btn-add" style="padding: 6px 12px; font-size: 12px;">ดู</button>
                    <button onclick="deleteHistory(${record.id})" class="btn btn-delete">ลบ</button>
                </td>
            </tr>
        `;
    });

    historyBody.innerHTML = html;
}

// View detail of a specific record
async function viewDetail(id) {
    const record = await api.getRecord(id);

    if (!record) return;

    const detailsDiv = document.getElementById('historyDetails');
    const detailContent = document.getElementById('detailContent');

    let html = '<div class="summary-details">';

    // Summary info
    html += '<div class="overall-summary">';
    html += '<div class="overall-title">ข้อมูลสรุป</div>';
    html += `<div class="overall-detail"><span class="detail-label">วันที่:</span><span class="detail-value">${new Date(record.timestamp).toLocaleString('th-TH')}</span></div>`;
    html += `<div class="overall-detail"><span class="detail-label">เวลา Start prod:</span><span class="detail-value">${record.start_prod_time || '-'}</span></div>`;
    html += `<div class="overall-detail"><span class="detail-label">จำนวนตู้ทั้งหมด:</span><span class="detail-value">${record.total_cabinets}</span></div>`;
    html += `<div class="overall-detail"><span class="detail-label">จำนวนตู้ที่ผ่าน:</span><span class="detail-value">${record.passed_cabinets}</span></div>`;
    const percentage = record.total_cabinets > 0 ? Math.round((record.passed_cabinets / record.total_cabinets) * 100) : 0;
    html += `<div class="overall-detail"><span class="detail-label">%จำนวนตู้ที่มีคะแนน ≥4 คะแนน:</span><span class="detail-value">${percentage}%</span></div>`;
    html += `<div class="overall-detail"><span class="detail-label">เวลาออกลูกไก่:</span><span class="detail-value">${record.hatch_time || '-'}</span></div>`;
    html += '</div>';

    // Cabinet details - ผลลัพธ์ของแต่ละตู้
    let cabinetRows = record.cabinet_rows;
    if (typeof cabinetRows === 'string') {
        cabinetRows = JSON.parse(cabinetRows);
    }

    if (cabinetRows) {
        html += '<div class="summary-cabinet-grid">';
        for (let cabinet = 1; cabinet <= 12; cabinet++) {
            if (cabinetRows[cabinet]) {
                const cabinetData = cabinetRows[cabinet];
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
async function deleteHistory(id) {
    if (!confirm('คุณต้องการลบข้อมูลนี้ใช่ไหม?')) return;

    try {
        await api.deleteRecord(id);
        await loadHistory();

        // Hide details if visible
        document.getElementById('historyDetails').style.display = 'none';
    } catch (error) {
        console.error('Error deleting record:', error);
        alert('เกิดข้อผิดพลาดในการลบข้อมูล');
    }
}

// Clear all history
async function clearHistory() {
    if (!confirm('คุณต้องการล้างข้อมูลประวัติทั้งหมดใช่ไหม?')) return;

    try {
        await api.deleteAllRecords();
        await loadHistory();

        // Hide details if visible
        document.getElementById('historyDetails').style.display = 'none';
    } catch (error) {
        console.error('Error clearing history:', error);
        alert('เกิดข้อผิดพลาดในการล้างข้อมูล');
    }
}

// Load history on page load
document.addEventListener('DOMContentLoaded', function() {
    loadHistory();
});
