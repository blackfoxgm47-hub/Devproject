// Dashboard Management for Chicken Hatching Records

// Load dashboard data
async function loadDashboard() {
    const history = await firebaseApi.getRecords();

    // Update summary cards
    updateSummaryCards(history);

    // Update pass trend line chart
    updatePassTrendChart(history);

    // Update cabinet bar chart
    updateCabinetBarChart(history);

    // Update recent records
    updateRecentRecords(history);
}

// Update summary cards
function updateSummaryCards(history) {
    const totalRecords = history.length;
    let totalCabinets = 0;
    let totalPassed = 0;
    let totalChicks = 0;

    history.forEach(record => {
        totalCabinets += record.total_cabinets || 0;
        totalPassed += record.passed_cabinets || 0;
        totalChicks += record.total_chicks || 0;
    });

    const avgPassRate = totalCabinets > 0 ? Math.round((totalPassed / totalCabinets) * 100) : 0;

    document.getElementById('totalRecords').textContent = totalRecords;
    document.getElementById('avgPassRate').textContent = avgPassRate + '%';
    document.getElementById('totalCabinets').textContent = totalCabinets;
    document.getElementById('totalChicks').textContent = totalChicks;

    // Update trends
    updateTrend('totalRecordsTrend', history.length > 1 ? history.length - (history.length - 1) : 0, 0);
    updateTrend('totalCabinetsTrend', totalCabinets, 0);
    updateTrend('avgPassRateTrend', avgPassRate, 0);
    updateTrend('totalChicksTrend', totalChicks, 0);
}

// Update trend indicator
function updateTrend(elementId, current, previous) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const icon = element.querySelector('.trend-icon');
    const value = element.querySelector('.trend-value');

    if (!previous || previous === 0) {
        icon.textContent = '-';
        value.textContent = '-';
        element.className = 'card-trend trend-neutral';
        return;
    }

    const diff = current - previous;
    const percent = Math.round((diff / previous) * 100);

    if (diff > 0) {
        icon.textContent = '↑';
        value.textContent = `+${percent}%`;
        element.className = 'card-trend trend-up';
    } else if (diff < 0) {
        icon.textContent = '↓';
        value.textContent = `${percent}%`;
        element.className = 'card-trend trend-down';
    } else {
        icon.textContent = '-';
        value.textContent = '0%';
        element.className = 'card-trend trend-neutral';
    }
}

// Update pass trend line chart
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
        ctx.font = '16px Prompt, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('ไม่มีข้อมูล', canvas.width / 2, canvas.height / 2);
        return;
    }

    // Get last 10 records for the chart
    const recentHistory = history.slice(0, 10).reverse();
    const labels = recentHistory.map((record, index) => index + 1);
    const data = recentHistory.map(record => {
        const total = record.total_cabinets || 0;
        const passed = record.passed_cabinets || 0;
        return total > 0 ? Math.round((passed / total) * 100) : 0;
    });

    // Draw chart
    const padding = 50;
    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;

    // Draw axes
    ctx.strokeStyle = '#dee2e6';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    // Draw grid lines
    ctx.strokeStyle = '#f0f0f0';
    for (let i = 0; i <= 100; i += 20) {
        const y = canvas.height - padding - (i / 100) * chartHeight;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(canvas.width - padding, y);
        ctx.stroke();
    }

    // Draw line chart
    if (data.length > 1) {
        const stepX = chartWidth / (data.length - 1);
        
        // Draw line
        ctx.beginPath();
        ctx.strokeStyle = '#2563EB';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        data.forEach((value, index) => {
            const x = padding + index * stepX;
            const y = canvas.height - padding - (value / 100) * chartHeight;
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();

        // Draw gradient area under line
        ctx.beginPath();
        const gradient = ctx.createLinearGradient(0, padding, 0, canvas.height - padding);
        gradient.addColorStop(0, 'rgba(37, 99, 235, 0.3)');
        gradient.addColorStop(1, 'rgba(37, 99, 235, 0.05)');
        ctx.fillStyle = gradient;

        data.forEach((value, index) => {
            const x = padding + index * stepX;
            const y = canvas.height - padding - (value / 100) * chartHeight;
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.lineTo(padding + (data.length - 1) * stepX, canvas.height - padding);
        ctx.lineTo(padding, canvas.height - padding);
        ctx.closePath();
        ctx.fill();

        // Draw points
        data.forEach((value, index) => {
            const x = padding + index * stepX;
            const y = canvas.height - padding - (value / 100) * chartHeight;
            
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = '#2563EB';
            ctx.fill();
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.stroke();
        });
    }

    // Draw Y-axis labels
    ctx.fillStyle = '#6c757d';
    ctx.font = '12px Prompt, sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 100; i += 20) {
        const y = canvas.height - padding - (i / 100) * chartHeight;
        ctx.fillText(i + '%', padding - 10, y + 4);
    }

    // Draw X-axis labels
    ctx.textAlign = 'center';
    data.forEach((value, index) => {
        const stepX = data.length > 1 ? chartWidth / (data.length - 1) : chartWidth / 2;
        const x = padding + index * stepX;
        ctx.fillText(labels[index], x, canvas.height - padding + 20);
    });
}

// Update cabinet bar chart
function updateCabinetBarChart(history) {
    const canvas = document.getElementById('cabinetBarChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = 300;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cabinetStats = {};
    let cabinetCount = 0;

    history.forEach(record => {
        if (record.cabinet_rows) {
            for (let cabinet in record.cabinet_rows) {
                if (!cabinetStats[cabinet]) {
                    cabinetStats[cabinet] = { total: 0, passed: 0 };
                }
                cabinetStats[cabinet].total++;
                const avg = record.cabinet_rows[cabinet].rows[0]?.cabinetAvg;
                if (avg !== '-' && parseFloat(avg) >= 4.00) {
                    cabinetStats[cabinet].passed++;
                }
                cabinetCount = Math.max(cabinetCount, parseInt(cabinet));
            }
        }
    });

    if (Object.keys(cabinetStats).length === 0) {
        ctx.fillStyle = '#6c757d';
        ctx.font = '16px Prompt, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('ไม่มีข้อมูล', canvas.width / 2, canvas.height / 2);
        return;
    }

    // Prepare data
    const labels = [];
    const data = [];
    for (let i = 1; i <= cabinetCount; i++) {
        if (cabinetStats[i]) {
            const stats = cabinetStats[i];
            labels.push(`ตู้ ${i}`);
            const passRate = stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0;
            data.push(passRate);
        }
    }

    // Draw chart
    const padding = 50;
    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;
    const barWidth = Math.min(60, chartWidth / data.length - 20);

    // Draw axes
    ctx.strokeStyle = '#dee2e6';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    // Draw grid lines
    ctx.strokeStyle = '#f0f0f0';
    for (let i = 0; i <= 100; i += 20) {
        const y = canvas.height - padding - (i / 100) * chartHeight;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(canvas.width - padding, y);
        ctx.stroke();
    }

    // Draw bars
    const stepX = chartWidth / data.length;
    data.forEach((value, index) => {
        const x = padding + stepX * index + (stepX - barWidth) / 2;
        const barHeight = (value / 100) * chartHeight;
        const y = canvas.height - padding - barHeight;

        // Color based on pass rate
        ctx.fillStyle = value >= 80 ? '#10B981' : (value >= 60 ? '#F59E0B' : '#EF4444');
        ctx.fillRect(x, y, barWidth, barHeight);

        // Draw value
        ctx.fillStyle = '#1F2937';
        ctx.font = 'bold 12px Prompt, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(value + '%', x + barWidth / 2, y - 5);

        // Draw label
        ctx.fillStyle = '#6c757d';
        ctx.font = '11px Prompt, sans-serif';
        ctx.fillText(labels[index], x + barWidth / 2, canvas.height - padding + 15);
    });

    // Draw Y-axis labels
    ctx.fillStyle = '#6c757d';
    ctx.font = '12px Prompt, sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 100; i += 20) {
        const y = canvas.height - padding - (i / 100) * chartHeight;
        ctx.fillText(i + '%', padding - 10, y + 4);
    }
}

// Update recent records
function updateRecentRecords(history) {
    const recentRecords = history.slice(0, 5);
    const tbody = document.getElementById('recentRecords');

    if (recentRecords.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #6c757d;">ไม่มีข้อมูล</td></tr>';
        return;
    }

    let html = '';
    recentRecords.forEach((record, index) => {
        const date = new Date(record.timestamp).toLocaleString('th-TH');
        const passedCabinets = record.passed_cabinets || 0;
        const totalCabinets = record.total_cabinets || 0;
        const percentage = totalCabinets > 0 ? Math.round((passedCabinets / totalCabinets) * 100) : 0;
        const hatchTime = record.hatch_time || '-';

        html += `
            <tr>
                <td>${date}</td>
                <td>${record.start_prod_time || '-'}</td>
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

// Handle window resize for charts
window.addEventListener('resize', async function() {
    const history = await firebaseApi.getRecords();
    updatePassTrendChart(history);
    updateCabinetBarChart(history);
});
