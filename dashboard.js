// Dashboard Management for Chicken Hatching Records

const HISTORY_KEY = 'chickenHatchingHistory';

// Load dashboard data
function loadDashboard() {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');

    // Update summary cards
    updateSummaryCards(history);

    // Update pass trend chart
    updatePassTrendChart(history);

    // Update cabinet statistics
    updateCabinetStatistics(history);

    // Update recent records
    updateRecentRecords(history);
}

// Update summary cards
function updateSummaryCards(history) {
    const totalRecords = history.length;
    let totalCabinets = 0;
    let totalPassed = 0;

    history.forEach(record => {
        totalCabinets += record.totalCabinets || 0;
        totalPassed += record.passedCabinets || 0;
    });

    const avgPassRate = totalCabinets > 0 ? Math.round((totalPassed / totalCabinets) * 100) : 0;

    document.getElementById('totalRecords').textContent = totalRecords;
    document.getElementById('avgPassRate').textContent = avgPassRate + '%';
    document.getElementById('totalCabinets').textContent = totalCabinets;
    document.getElementById('totalPassed').textContent = totalPassed;
}

// Update pass trend chart
function updatePassTrendChart(history) {
    const canvas = document.getElementById('passTrendChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = 300;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (history.length === 0) {
        ctx.fillStyle = '#6c757d';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('ไม่มีข้อมูล', canvas.width / 2, canvas.height / 2);
        return;
    }

    // Get last 10 records for the chart
    const recentHistory = history.slice(0, 10).reverse();
    const labels = recentHistory.map((record, index) => index + 1);
    const data = recentHistory.map(record => {
        const total = record.totalCabinets || 0;
        const passed = record.passedCabinets || 0;
        return total > 0 ? Math.round((passed / total) * 100) : 0;
    });

    // Draw chart
    const padding = 50;
    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;
    const barWidth = chartWidth / data.length - 10;

    // Draw axes
    ctx.strokeStyle = '#dee2e6';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    // Draw bars
    data.forEach((value, index) => {
        const x = padding + 10 + index * (barWidth + 10);
        const barHeight = (value / 100) * chartHeight;
        const y = canvas.height - padding - barHeight;

        // Color based on pass rate
        ctx.fillStyle = value >= 80 ? '#4caf50' : (value >= 60 ? '#ff9800' : '#f44336');
        ctx.fillRect(x, y, barWidth, barHeight);

        // Draw value
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(value + '%', x + barWidth / 2, y - 5);

        // Draw label
        ctx.fillText(labels[index], x + barWidth / 2, canvas.height - padding + 20);
    });

    // Draw Y-axis labels
    ctx.textAlign = 'right';
    for (let i = 0; i <= 100; i += 20) {
        const y = canvas.height - padding - (i / 100) * chartHeight;
        ctx.fillText(i + '%', padding - 10, y + 4);
    }
}

// Update cabinet statistics
function updateCabinetStatistics(history) {
    const cabinetStats = {};
    let cabinetCount = 0;

    history.forEach(record => {
        if (record.cabinetRows) {
            for (let cabinet in record.cabinetRows) {
                if (!cabinetStats[cabinet]) {
                    cabinetStats[cabinet] = { total: 0, passed: 0 };
                }
                cabinetStats[cabinet].total++;
                const avg = record.cabinetRows[cabinet].rows[0]?.cabinetAvg;
                if (avg !== '-' && parseFloat(avg) >= 4.00) {
                    cabinetStats[cabinet].passed++;
                }
                cabinetCount = Math.max(cabinetCount, parseInt(cabinet));
            }
        }
    });

    const container = document.getElementById('cabinetStats');
    if (Object.keys(cabinetStats).length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #6c757d;">ไม่มีข้อมูล</p>';
        return;
    }

    let html = '<div class="cabinet-stats-grid">';
    for (let i = 1; i <= cabinetCount; i++) {
        if (cabinetStats[i]) {
            const stats = cabinetStats[i];
            const passRate = stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0;
            const statusClass = passRate >= 80 ? 'status-pass' : (passRate >= 60 ? 'status-warning' : 'status-fail');

            html += `
                <div class="cabinet-stat-item">
                    <div class="cabinet-stat-header">ตู้ที่ ${i}</div>
                    <div class="cabinet-stat-details">
                        <div class="stat-detail">
                            <span class="stat-label">ประเมิน:</span>
                            <span class="stat-value">${stats.total} ครั้ง</span>
                        </div>
                        <div class="stat-detail">
                            <span class="stat-label">ผ่าน:</span>
                            <span class="stat-value">${stats.passed} ครั้ง</span>
                        </div>
                        <div class="stat-detail">
                            <span class="stat-label">เปอร์เซ็นต์:</span>
                            <span class="stat-value ${statusClass}">${passRate}%</span>
                        </div>
                    </div>
                </div>
            `;
        }
    }
    html += '</div>';
    container.innerHTML = html;
}

// Update recent records
function updateRecentRecords(history) {
    const recentRecords = history.slice(0, 5);
    const tbody = document.getElementById('recentRecords');

    if (recentRecords.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #6c757d;">ไม่มีข้อมูล</td></tr>';
        return;
    }

    let html = '';
    recentRecords.forEach((record, index) => {
        const sequenceNumber = record.sequenceNumber !== undefined ? record.sequenceNumber : history.length - index;
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
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

// Load dashboard on page load
document.addEventListener('DOMContentLoaded', function() {
    loadDashboard();
});

// Handle window resize for chart
window.addEventListener('resize', function() {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    updatePassTrendChart(history);
});
