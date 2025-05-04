/**
 * NutriNova Reports JavaScript
 * Handles reports data visualization and interactions
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the reports page
    initReports();
    setupExportButtons();
});

/**
 * Initialize the reports components
 */
function initReports() {
    // Fetch user's nutrition report data
    fetchReportData()
        .then(data => {
            renderNutritionSummary(data.summary);
            renderRecommendations(data.recommendations);
        })
        .catch(error => {
            console.error('Error loading report data:', error);
            showErrorMessage('Could not load your report data. Please try again later.');
        });
}

/**
 * Fetch report data from the server
 * @returns {Promise} Promise resolving to report data object
 */
async function fetchReportData() {
    // This would be replaced with actual API call
    // For now, return mock data
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                summary: {
                    daily: {
                        date: new Date().toLocaleDateString(),
                        calories: {
                            consumed: 1850,
                            target: 2000
                        },
                        macros: {
                            protein: { value: 75, target: 80, unit: 'g' },
                            carbs: { value: 220, target: 250, unit: 'g' },
                            fat: { value: 60, target: 65, unit: 'g' }
                        }
                    },
                    weekly: {
                        dates: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                        calories: [1750, 1900, 1800, 2100, 1950, 2200, 1850],
                        protein: [70, 85, 75, 90, 80, 95, 75],
                        carbs: [200, 230, 210, 250, 220, 260, 220],
                        fat: [55, 65, 60, 70, 65, 75, 60]
                    }
                },
                recommendations: {
                    dietary: [
                        "Consider increasing protein intake by adding more lean meats, fish, or plant-based proteins.",
                        "Your fiber intake is below recommended levels. Try adding more whole grains, fruits, and vegetables.",
                        "Your water intake has been consistently below target. Aim for at least 2.5 liters daily."
                    ],
                    nutrients: [
                        {
                            nutrient: "Vitamin D",
                            status: "low",
                            recommendation: "Consider more sun exposure or foods like fatty fish, egg yolks, or fortified foods."
                        },
                        {
                            nutrient: "Iron",
                            status: "adequate",
                            recommendation: "Continue consuming iron-rich foods like lean meats, beans, and leafy greens."
                        },
                        {
                            nutrient: "Calcium",
                            status: "low",
                            recommendation: "Increase intake of dairy products, fortified plant milks, or leafy greens."
                        }
                    ]
                }
            });
        }, 500);
    });
}

/**
 * Render the nutrition summary section with charts
 * @param {Object} summaryData - Nutrition summary data
 */
function renderNutritionSummary(summaryData) {
    renderDailyChart(summaryData.daily);
    renderDailyStats(summaryData.daily);
    renderWeeklyChart(summaryData.weekly);
}

/**
 * Render the daily nutrition chart
 * @param {Object} dailyData - Daily nutrition data
 */
function renderDailyChart(dailyData) {
    const dailyChartEl = document.getElementById('daily-chart');
    
    // In a real implementation, this would use a charting library like Chart.js
    // For now, create a simple visual representation
    let chartHTML = `
        <div class="chart-container">
            <h4>Calories: ${dailyData.calories.consumed} / ${dailyData.calories.target}</h4>
            <div class="chart-bar">
                <div class="chart-fill" style="width: ${Math.min(dailyData.calories.consumed / dailyData.calories.target * 100, 100)}%"></div>
            </div>
            
            <h4>Macronutrients</h4>
            ${Object.entries(dailyData.macros).map(([key, macro]) => `
                <div class="macro-item">
                    <div class="macro-label">${key.charAt(0).toUpperCase() + key.slice(1)}: ${macro.value}${macro.unit} / ${macro.target}${macro.unit}</div>
                    <div class="chart-bar">
                        <div class="chart-fill ${key}" style="width: ${Math.min(macro.value / macro.target * 100, 100)}%"></div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    dailyChartEl.innerHTML = chartHTML;
}

/**
 * Render daily nutrition statistics
 * @param {Object} dailyData - Daily nutrition data
 */
function renderDailyStats(dailyData) {
    const dailyStatsEl = document.getElementById('daily-stats');
    
    // Calculate percentages of macros
    const totalMacros = Object.values(dailyData.macros).reduce(
        (sum, macro) => sum + macro.value, 0
    );
    
    const macroPercentages = {};
    Object.entries(dailyData.macros).forEach(([key, macro]) => {
        macroPercentages[key] = Math.round((macro.value / totalMacros) * 100);
    });
    
    let statsHTML = `
        <div class="stats-container">
            <div class="macro-distribution">
                <h4>Macro Distribution</h4>
                <div class="distribution-chart">
                    <div class="protein-segment" style="width: ${macroPercentages.protein}%"></div>
                    <div class="carbs-segment" style="width: ${macroPercentages.carbs}%"></div>
                    <div class="fat-segment" style="width: ${macroPercentages.fat}%"></div>
                </div>
                <div class="distribution-legend">
                    <div class="legend-item">
                        <div class="legend-color protein"></div>
                        <div class="legend-text">Protein: ${macroPercentages.protein}%</div>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color carbs"></div>
                        <div class="legend-text">Carbs: ${macroPercentages.carbs}%</div>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color fat"></div>
                        <div class="legend-text">Fat: ${macroPercentages.fat}%</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    dailyStatsEl.innerHTML = statsHTML;
}

/**
 * Render the weekly trends chart
 * @param {Object} weeklyData - Weekly nutrition data
 */
function renderWeeklyChart(weeklyData) {
    const weeklyChartEl = document.getElementById('weekly-chart');
    
    // In a real implementation, this would use a charting library like Chart.js
    // For now, create a simple visual representation
    let chartHTML = `
        <div class="weekly-chart-container">
            <h4>Weekly Calorie Intake</h4>
            <div class="weekly-chart">
                ${weeklyData.dates.map((date, index) => `
                    <div class="weekly-bar-container">
                        <div class="weekly-bar-label">${date}</div>
                        <div class="weekly-bar">
                            <div class="weekly-bar-fill" style="height: ${weeklyData.calories[index] / 2500 * 100}%"></div>
                        </div>
                        <div class="weekly-bar-value">${weeklyData.calories[index]}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    weeklyChartEl.innerHTML = chartHTML;
}

/**
 * Render the recommendations section
 * @param {Object} recommendationsData - Recommendations data
 */
function renderRecommendations(recommendationsData) {
    renderDietaryRecommendations(recommendationsData.dietary);
    renderNutrientRecommendations(recommendationsData.nutrients);
}

/**
 * Render dietary recommendations
 * @param {Array} dietaryRecs - Dietary recommendations
 */
function renderDietaryRecommendations(dietaryRecs) {
    const dietaryEl = document.getElementById('dietary-recommendations');
    
    let recHTML = `
        <ul class="recommendations-list">
            ${dietaryRecs.map(rec => `
                <li class="recommendation-item">${rec}</li>
            `).join('')}
        </ul>
    `;
    
    dietaryEl.innerHTML = recHTML;
}

/**
 * Render nutrient recommendations
 * @param {Array} nutrientRecs - Nutrient recommendations
 */
function renderNutrientRecommendations(nutrientRecs) {
    const nutrientEl = document.getElementById('nutrient-recommendations');
    
    let recHTML = `
        <div class="nutrient-recommendations">
            ${nutrientRecs.map(rec => `
                <div class="nutrient-item ${rec.status}">
                    <div class="nutrient-header">
                        <span class="nutrient-name">${rec.nutrient}</span>
                        <span class="nutrient-status">${rec.status.toUpperCase()}</span>
                    </div>
                    <div class="nutrient-recommendation">
                        ${rec.recommendation}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    nutrientEl.innerHTML = recHTML;
}

/**
 * Set up export buttons functionality
 */
function setupExportButtons() {
    document.getElementById('export-pdf').addEventListener('click', function() {
        alert('PDF export functionality will be implemented here');
        // In a real implementation, this would generate a PDF of the report
    });
    
    document.getElementById('export-csv').addEventListener('click', function() {
        alert('CSV export functionality will be implemented here');
        // In a real implementation, this would export nutrition data as CSV
    });
    
    document.getElementById('share-report').addEventListener('click', function() {
        alert('Share functionality will be implemented here');
        // In a real implementation, this would provide sharing options
    });
}

/**
 * Display an error message to the user
 * @param {string} message - The error message to display
 */
function showErrorMessage(message) {
    const mainEl = document.querySelector('main');
    const errorEl = document.createElement('div');
    errorEl.className = 'error-message';
    errorEl.textContent = message;
    
    mainEl.prepend(errorEl);
    
    // Remove the error after 5 seconds
    setTimeout(() => {
        errorEl.remove();
    }, 5000);
}