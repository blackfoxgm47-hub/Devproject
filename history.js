// History Management for Chicken Hatching Records

// Global variables
let allHistoryData = [];
let filteredData = [];
let currentPage = 1;
const itemsPerPage = 10;
let deleteRecordId = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadHistory();
    setupSearchInput();
});

// Setup search input with debounce
function setupSearchInput() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', function() {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                applyFilters();
            }, 300);
        });
    }
}

// Load history from Firebase and localStorage
async function loadHistory() {
    if (window.ux && window.ux.showLoading) {
        window.ux.showLoading();
    }
    try {
        // Try to load from Firebase first
        const history = await firebaseApi.getRecords();
        allHistoryData = history;
        
        // Also load from localStorage (fallback records)
        const localRecord = localStorage.getItem('lastEvaluationRecord');
        if (localRecord) {
            try {
                const parsedRecord = JSON.parse(localRecord);
                // Add a flag to identify it's from localStorage
                parsedRecord.isLocal = true;
                parsedRecord.id = 'local-' + Date.now();
                parsedRecord.sequence_number = allHistoryData.length + 1;
                
                // Check if this record already exists in Firebase data (by timestamp)
                const exists = allHistoryData.some(r => 
                    r.timestamp === parsedRecord.timestamp && 
                    r.start_prod_time === parsedRecord.start_prod_time
                );
                
                if (!exists) {
                    allHistoryData.unshift(parsedRecord); // Add to beginning
                }
            } catch (e) {
                console.error('Error parsing localStorage record:', e);
            }
        }
        
        filteredData = [...allHistoryData];
        renderTable();
        if (window.ux && window.ux.hideLoading) {
            window.ux.hideLoading();
        }
    } catch (error) {
        console.error('Error loading history:', error);
        
        // Fallback: Load from localStorage only if Firebase fails
        const localRecord = localStorage.getItem('lastEvaluationRecord');
        if (localRecord) {
            try {
                const parsedRecord = JSON.parse(localRecord);
                parsedRecord.isLocal = true;
                parsedRecord.id = 'local-' + Date.now();
                parsedRecord.sequence_number = 1;
                allHistoryData = [parsedRecord];
                filteredData = [...allHistoryData];
                renderTable();
            } catch (e) {
                console.error('Error parsing localStorage record:', e);
                allHistoryData = [];
                filteredData = [];
                renderTable();
            }
        } else {
            allHistoryData = [];
            filteredData = [];
            renderTable();
        }
        
        if (window.ux && window.ux.hideLoading) {
            window.ux.hideLoading();
        }
        if (window.ux && window.ux.showToast) {
            window.ux.showToast('โหลดข้อมูลจาก localStorage (Firebase ไม่สามารถเข้าถึงได้)', 'warning');
        }
    }
}

// Apply filters
function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const sortValue = document.getElementById('sortSelect').value;

    filteredData = allHistoryData.filter(record => {
        // Search filter
        const date = new Date(record.timestamp).toLocaleString('th-TH').toLowerCase();
        const startProd = (record.start_prod_time || '').toLowerCase();
        const hatchTime = (record.hatch_time || '').toLowerCase();
        const searchMatch = searchTerm === '' || 
                          date.includes(searchTerm) || 
                          startProd.includes(searchTerm) || 
                          hatchTime.includes(searchTerm);

        // Date filter
        const recordDate = new Date(record.timestamp);
        const startMatch = startDate === '' || recordDate >= new Date(startDate);
        const endMatch = endDate === '' || recordDate <= new Date(endDate + 'T23:59:59');

        return searchMatch && startMatch && endMatch;
    });

    // Sort
    sortData(sortValue);

    currentPage = 1;
    renderTable();
}

// Sort data
function sortData(sortValue) {
    switch(sortValue) {
        case 'date-desc':
            filteredData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            break;
        case 'date-asc':
            filteredData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            break;
        case 'cabinets-desc':
            filteredData.sort((a, b) => (b.total_cabinets || 0) - (a.total_cabinets || 0));
            break;
        case 'cabinets-asc':
            filteredData.sort((a, b) => (a.total_cabinets || 0) - (b.total_cabinets || 0));
            break;
        case 'percentage-desc':
            const pctA = a.total_cabinets > 0 ? (a.passed_cabinets / a.total_cabinets) : 0;
            const pctB = b.total_cabinets > 0 ? (b.passed_cabinets / b.total_cabinets) : 0;
            filteredData.sort((a, b) => pctB - pctA);
            break;
        case 'percentage-asc':
            const pctA2 = a.total_cabinets > 0 ? (a.passed_cabinets / a.total_cabinets) : 0;
            const pctB2 = b.total_cabinets > 0 ? (b.passed_cabinets / b.total_cabinets) : 0;
            filteredData.sort((a, b) => pctA2 - pctB2);
            break;
    }
}

// Reset filters
function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    document.getElementById('sortSelect').value = 'date-desc';
    
    filteredData = [...allHistoryData];
    sortData('date-desc');
    currentPage = 1;
    renderTable();
    
    showToast('success', 'รีเซ็ตตัวกรองแล้ว');
}

// Render table with pagination
function renderTable() {
    const historyBody = document.getElementById('historyBody');
    const totalRecords = document.getElementById('totalRecords');
    const pageInfo = document.getElementById('pageInfo');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    // Update total records
    totalRecords.textContent = `${filteredData.length} รายการ`;

    if (filteredData.length === 0) {
        historyBody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #6c757d; padding: 40px;">ไม่มีข้อมูลประวัติ</td></tr>';
        pageInfo.textContent = 'หน้า 1 จาก 1';
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        return;
    }

    // Calculate pagination
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredData.length);
    const pageData = filteredData.slice(startIndex, endIndex);

    // Update page info
    pageInfo.textContent = `หน้า ${currentPage} จาก ${totalPages}`;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;

    // Render rows
    let html = '';
    pageData.forEach((record, index) => {
        const sequenceNumber = record.sequence_number || (startIndex + index + 1);
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
                    <button onclick="viewDetail('${record.id}')" class="btn btn-add" style="padding: 6px 12px; font-size: 12px;">ดู</button>
                    <button onclick="showDeleteModal('${record.id}')" class="btn btn-delete" style="padding: 6px 12px; font-size: 12px;">ลบ</button>
                </td>
            </tr>
        `;
    });

    historyBody.innerHTML = html;
}

// Pagination functions
function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderTable();
    }
}

function nextPage() {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderTable();
    }
}

// View detail of a specific record (Modal)
async function viewDetail(id) {
    showLoading();
    try {
        const record = await firebaseApi.getRecord(id);

        if (!record) {
            hideLoading();
            showToast('error', 'ไม่พบข้อมูล');
            return;
        }

        const modalBody = document.getElementById('modalBody');
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

        // Cabinet details
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

        modalBody.innerHTML = html;
        hideLoading();
        openModal();
    } catch (error) {
        console.error('Error viewing detail:', error);
        hideLoading();
        showToast('error', 'เกิดข้อผิดพลาดในการดูรายละเอียด');
    }
}

// Modal functions
function openModal() {
    document.getElementById('detailModal').classList.add('show');
}

function closeModal() {
    document.getElementById('detailModal').classList.remove('show');
}

function showDeleteModal(id) {
    deleteRecordId = id;
    document.getElementById('deleteModal').classList.add('show');
}

function closeDeleteModal() {
    deleteRecordId = null;
    document.getElementById('deleteModal').classList.remove('show');
}

async function confirmDelete() {
    if (!deleteRecordId) return;

    showLoading();
    try {
        // Find the record in allHistoryData
        const recordToDelete = allHistoryData.find(r => r.id === deleteRecordId);
        
        if (recordToDelete && recordToDelete.isLocal) {
            // Delete from localStorage
            localStorage.removeItem('lastEvaluationRecord');
            console.log('Deleted record from localStorage');
        } else {
            // Try to delete from Firebase
            try {
                await firebaseApi.deleteRecord(deleteRecordId);
                console.log('Deleted record from Firebase');
            } catch (firebaseError) {
                console.error('Firebase delete error:', firebaseError);
                // If Firebase fails, check if it's in localStorage and remove it
                const localRecord = localStorage.getItem('lastEvaluationRecord');
                if (localRecord) {
                    try {
                        const parsed = JSON.parse(localRecord);
                        if (parsed.timestamp === recordToDelete?.timestamp) {
                            localStorage.removeItem('lastEvaluationRecord');
                            console.log('Fallback: Deleted from localStorage');
                        }
                    } catch (e) {
                        console.error('Error parsing localStorage:', e);
                    }
                }
                // Don't throw error, continue with reload
            }
        }
        
        closeDeleteModal();
        await loadHistory();
        hideLoading();
        showToast('success', 'ลบรายการเรียบร้อย');
    } catch (error) {
        console.error('Error deleting record:', error);
        hideLoading();
        showToast('error', 'เกิดข้อผิดพลาดในการลบข้อมูล');
    }
}

// Delete a specific record (legacy function, replaced by modal)
async function deleteHistory(id) {
    showDeleteModal(id);
}

// Clear all history (removed, use individual delete instead)
async function clearHistory() {
    showToast('warning', 'กรุณาลบรายการแต่ละรายการ');
}

// Export data to CSV
async function exportToCSV() {
    showLoading();
    try {
        const history = await firebaseApi.getRecords();
        
        if (history.length === 0) {
            hideLoading();
            showToast('warning', 'ไม่มีข้อมูลสำหรับ export');
            return;
        }

        // CSV headers
        let csv = 'ลำดับที่,วันที่,เวลา Start prod,จำนวนตู้ทั้งหมด,จำนวนตู้ที่ผ่าน,%จำนวนตู้ที่มีคะแนน ≥4 คะแนน,เวลาออกลูกไก่,สรุป\n';

        // CSV rows
        history.forEach(record => {
            const date = new Date(record.timestamp).toLocaleString('th-TH');
            const percentage = record.total_cabinets > 0 
                ? Math.round((record.passed_cabinets / record.total_cabinets) * 100) 
                : 0;
            
            csv += `${record.sequence_number},"${date}","${record.start_prod_time || ''}",${record.total_cabinets},${record.passed_cabinets},${percentage}%,"${record.hatch_time || ''}","${record.summary || ''}"\n`;
        });

        // Add BOM for Excel to recognize UTF-8 encoding
        const BOM = '\uFEFF';
        const dataBlob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `chicken_hatching_summary_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        URL.revokeObjectURL(url);
        hideLoading();
        showToast('success', 'Export ข้อมูลเรียบร้อย');
    } catch (error) {
        console.error('Error exporting to CSV:', error);
        hideLoading();
        showToast('error', 'เกิดข้อผิดพลาดในการ export ข้อมูล');
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
