// Dashboard Management for Chicken Hatching Records

// Global chart instances
let passTrendChart = null;
let passPieChart = null;
let cabinetBarChart = null;
let progressRingChart = null;

// Load dashboard data
async function loadDashboard() {
    const history = await firebaseApi.getRecords();

    // Update summary cards
    updateSummaryCards(history);

    // Update charts
    updatePassTrendChart(history);
    updatePassPieChart(history);
    updateCabinetBarChart(history);
    updateProgressRingChart(history);

    // Update performance lists
    updatePerformanceLists(history);

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
        // Estimate chicks: assume 100 chicks per cabinet (adjust as needed)
        totalChicks += (record.total_cabinets || 0) * 100;
    });

    const avgPassRate = totalCabinets > 0 ? Math.round((totalPassed / totalCabinets) * 100) : 0;

    document.getElementById('totalRecords').textContent = totalRecords;
    document.getElementById('avgPassRate').textContent = avgPassRate + '%';
    document.getElementById('totalCabinets').textContent = totalCabinets;
    document.getElementById('totalChicks').textContent = totalChicks.toLocaleString();

    // Update trends (comparing with previous period if available)
    const previousPeriod = history.slice(10); // Compare with older records
    if (previousPeriod.length > 0) {
        let prevCabinets = 0;
        let prevPassed = 0;
        previousPeriod.forEach(record => {
            prevCabinets += record.total_cabinets || 0;
            prevPassed += record.passed_cabinets || 0;
        });
        const prevPassRate = prevCabinets > 0 ? Math.round((prevPassed / prevCabinets) * 100) : 0;
        
        updateTrend('totalRecordsTrend', totalRecords, previousPeriod.length);
        updateTrend('totalCabinetsTrend', totalCabinets, prevCabinets);
        updateTrend('avgPassRateTrend', avgPassRate, prevPassRate);
        updateTrend('totalChicksTrend', totalChicks, prevCabinets * 100);
    } else {
        updateTrend('totalRecordsTrend', totalRecords, 0);
        updateTrend('totalCabinetsTrend', totalCabinets, 0);
        updateTrend('avgPassRateTrend', avgPassRate, 0);
        updateTrend('totalChicksTrend', totalChicks, 0);
    }
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

// Update pass trend line chart (Chart.js)
function updatePassTrendChart(history) {
    const canvas = document.getElementById('passTrendChart');
    if (!canvas) return;

    // Destroy existing chart
    if (passTrendChart) {
        passTrendChart.destroy();
    }

    if (history.length === 0) {
        return;
    }

    // Get last 10 records for the chart
    const recentHistory = history.slice(0, 10).reverse();
    const labels = recentHistory.map((record, index) => {
        const date = new Date(record.timestamp);
        return `${date.getDate()}/${date.getMonth() + 1}`;
    });
    const data = recentHistory.map(record => {
        const total = record.total_cabinets || 0;
        const passed = record.passed_cabinets || 0;
        return total > 0 ? Math.round((passed / total) * 100) : 0;
    });

    passTrendChart = new Chart(canvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'อัตราการผ่าน (%)',
                data: data,
                borderColor: '#2563EB',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointBackgroundColor: '#2563EB',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}

// Update pass pie chart (Chart.js)
function updatePassPieChart(history) {
    const canvas = document.getElementById('passPieChart');
    if (!canvas) return;

    // Destroy existing chart
    if (passPieChart) {
        passPieChart.destroy();
    }

    let totalCabinets = 0;
    let totalPassed = 0;

    history.forEach(record => {
        totalCabinets += record.total_cabinets || 0;
        totalPassed += record.passed_cabinets || 0;
    });

    const totalFailed = totalCabinets - totalPassed;

    passPieChart = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: ['ผ่าน', 'ไม่ผ่าน'],
            datasets: [{
                data: [totalPassed, totalFailed],
                backgroundColor: ['#10B981', '#EF4444'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Update cabinet bar chart (Chart.js)
function updateCabinetBarChart(history) {
    const canvas = document.getElementById('cabinetBarChart');
    if (!canvas) return;

    // Destroy existing chart
    if (cabinetBarChart) {
        cabinetBarChart.destroy();
    }

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
        return;
    }

    // Prepare data
    const labels = [];
    const data = [];
    const backgroundColors = [];
    for (let i = 1; i <= cabinetCount; i++) {
        if (cabinetStats[i]) {
            const stats = cabinetStats[i];
            labels.push(`ตู้ ${i}`);
            const passRate = stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0;
            data.push(passRate);
            
            // Color based on pass rate
            if (passRate >= 80) {
                backgroundColors.push('#10B981');
            } else if (passRate >= 60) {
                backgroundColors.push('#F59E0B');
            } else {
                backgroundColors.push('#EF4444');
            }
        }
    }

    cabinetBarChart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'อัตราการผ่าน (%)',
                data: data,
                backgroundColor: backgroundColors,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}

// Update progress ring chart (Chart.js)
function updateProgressRingChart(history) {
    const canvas = document.getElementById('progressRingChart');
    if (!canvas) return;

    // Destroy existing chart
    if (progressRingChart) {
        progressRingChart.destroy();
    }

    let totalCabinets = 0;
    let totalPassed = 0;

    history.forEach(record => {
        totalCabinets += record.total_cabinets || 0;
        totalPassed += record.passed_cabinets || 0;
    });

    const passRate = totalCabinets > 0 ? Math.round((totalPassed / totalCabinets) * 100) : 0;

    // Update text
    document.getElementById('overallPassRate').textContent = passRate + '%';

    progressRingChart = new Chart(canvas, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [passRate, 100 - passRate],
                backgroundColor: ['#2563EB', '#E5E7EB'],
                borderWidth: 0,
                cutout: '75%'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: false
                }
            }
        }
    });
}

// Update performance lists
function updatePerformanceLists(history) {
    const cabinetStats = {};

    history.forEach(record => {
        if (record.cabinet_rows) {
            for (let cabinet in record.cabinet_rows) {
                if (!cabinetStats[cabinet]) {
                    cabinetStats[cabinet] = { total: 0, passed: 0, avgScore: 0, count: 0 };
                }
                cabinetStats[cabinet].total++;
                cabinetStats[cabinet].count++;
                const avg = record.cabinet_rows[cabinet].rows[0]?.cabinetAvg;
                if (avg !== '-') {
                    cabinetStats[cabinet].avgScore += parseFloat(avg);
                    if (parseFloat(avg) >= 4.00) {
                        cabinetStats[cabinet].passed++;
                    }
                }
            }
        }
    });

    // Calculate average scores
    const cabinetPerformance = [];
    for (let cabinet in cabinetStats) {
        const stats = cabinetStats[cabinet];
        const avgScore = stats.count > 0 ? stats.avgScore / stats.count : 0;
        const passRate = stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0;
        cabinetPerformance.push({
            cabinet: parseInt(cabinet),
            avgScore: avgScore,
            passRate: passRate
        });
    }

    // Sort by average score
    cabinetPerformance.sort((a, b) => b.avgScore - a.avgScore);

    // Top performance
    const topList = document.getElementById('topPerformanceList');
    const topPerformance = cabinetPerformance.slice(0, 5);
    topList.innerHTML = topPerformance.map((item, index) => `
        <div class="performance-item">
            <div class="performance-info">
                <div class="performance-rank rank-${index + 1}">${index + 1}</div>
                <div class="performance-name">ตู้ที่ ${item.cabinet}</div>
            </div>
            <div class="performance-score">
                <div class="performance-value">${item.avgScore.toFixed(2)}</div>
                <div class="performance-label">คะแนนเฉลี่ย</div>
            </div>
        </div>
    `).join('');

    // Worst performance
    const worstList = document.getElementById('worstPerformanceList');
    const worstPerformance = cabinetPerformance.slice(-5).reverse();
    worstList.innerHTML = worstPerformance.map((item, index) => `
        <div class="performance-item">
            <div class="performance-info">
                <div class="performance-rank rank-other">${index + 1}</div>
                <div class="performance-name">ตู้ที่ ${item.cabinet}</div>
            </div>
            <div class="performance-score">
                <div class="performance-value">${item.avgScore.toFixed(2)}</div>
                <div class="performance-label">คะแนนเฉลี่ย</div>
            </div>
        </div>
    `).join('');

    // Handle empty states
    if (topPerformance.length === 0) {
        topList.innerHTML = '<div style="text-align: center; color: #6c757d; padding: 20px;">ไม่มีข้อมูล</div>';
    }
    if (worstPerformance.length === 0) {
        worstList.innerHTML = '<div style="text-align: center; color: #6c757d; padding: 20px;">ไม่มีข้อมูล</div>';
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
    updatePassPieChart(history);
    updateCabinetBarChart(history);
    updateProgressRingChart(history);
});
