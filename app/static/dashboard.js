/**
 * NutriNova Dashboard JavaScript
 * Handles dashboard data visualization and interactions
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the dashboard
    initDashboard();
});

/**
 * Initialize the dashboard components
 */
function initDashboard() {
    // Fetch user's nutrition data
    fetchDashboardData()
        .then(data => {
            renderDailySummary(data.daily);
            renderNutritionalStats(data.nutritional);
        })
        .catch(error => {
            console.error('Error loading dashboard data:', error);
            showErrorMessage('Could not load your dashboard data. Please try again later.');
        });
}

/**
 * Fetch dashboard data from the server
 * @returns {Promise} Promise resolving to dashboard data object
 */
async function fetchDashboardData() {
    // This would be replaced with actual API call
    // For now, return mock data
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                daily: {
                    date: new Date().toLocaleDateString(),
                    calories: {
                        consumed: 1850,
                        target: 2000
                    },
                    water: {
                        consumed: 1.5, // liters
                        target: 2.5
                    },
                    meals: [
                        {
                            name: 'Breakfast',
                            time: '8:00 AM',
                            items: ['Oatmeal with berries', 'Coffee']
                        },
                        {
                            name: 'Lunch',
                            time: '12:30 PM',
                            items: ['Chicken salad', 'Apple']
                        },
                        {
                            name: 'Snack',
                            time: '3:00 PM',
                            items: ['Greek yogurt', 'Almonds']
                        }
                    ]
                },
                nutritional: {
                    macros: {
                        protein: { value: 75, target: 80, unit: 'g' },
                        carbs: { value: 220, target: 250, unit: 'g' },
                        fat: { value: 60, target: 65, unit: 'g' }
                    },
                    vitamins: [
                        { name: 'Vitamin A', value: 85 }, // percentage of daily value
                        { name: 'Vitamin C', value: 120 },
                        { name: 'Vitamin D', value: 60 },
                        { name: 'Calcium', value: 75 },
                        { name: 'Iron', value: 90 }
                    ]
                }
            });
        }, 500);
    });
}

/**
 * Render the daily summary section
 * @param {Object} dailyData - Daily summary data
 */
function renderDailySummary(dailyData) {
    const dailySummaryEl = document.getElementById('daily-summary');
    
    // Create the daily summary content
    let summaryHTML = `
        <div class="summary-header">
            <h3>Today (${dailyData.date})</h3>
        </div>
        
        <div class="calorie-summary">
            <div class="calorie-progress">
                <div class="progress-bar" style="width: ${Math.min(dailyData.calories.consumed / dailyData.calories.target * 100, 100)}%"></div>
            </div>
            <div class="calorie-text">
                <span>${dailyData.calories.consumed}</span> / ${dailyData.calories.target} calories
            </div>
        </div>
        
        <div class="water-summary">
            <h4>Water Intake</h4>
            <div class="water-progress">
                <div class="progress-bar" style="width: ${Math.min(dailyData.water.consumed / dailyData.water.target * 100, 100)}%"></div>
            </div>
            <div class="water-text">
                <span>${dailyData.water.consumed}</span> / ${dailyData.water.target} liters
            </div>
        </div>
        
        <div class="meals-summary">
            <h4>Today's Meals</h4>
            <ul class="meal-list">
                ${dailyData.meals.map(meal => `
                    <li class="meal-item">
                        <div class="meal-header">
                            <span class="meal-name">${meal.name}</span>
                            <span class="meal-time">${meal.time}</span>
                        </div>
                        <ul class="meal-foods">
                            ${meal.items.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </li>
                `).join('')}
            </ul>
        </div>
    `;
    
    dailySummaryEl.innerHTML = summaryHTML;
}

/**
 * Render the nutritional stats section
 * @param {Object} nutritionalData - Nutritional stats data
 */
function renderNutritionalStats(nutritionalData) {
    const statsEl = document.getElementById('nutritional-stats');
    
    // Create the nutritional stats content
    let statsHTML = `
        <div class="macros-section">
            <h3>Macronutrients</h3>
            <div class="macro-grid">
                ${Object.entries(nutritionalData.macros).map(([key, macro]) => `
                    <div class="macro-item">
                        <div class="macro-name">${key.charAt(0).toUpperCase() + key.slice(1)}</div>
                        <div class="macro-progress">
                            <div class="progress-bar" style="width: ${Math.min(macro.value / macro.target * 100, 100)}%"></div>
                        </div>
                        <div class="macro-text">
                            <span>${macro.value}</span> / ${macro.target} ${macro.unit}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="vitamins-section">
            <h3>Vitamins & Minerals</h3>
            <div class="vitamin-grid">
                ${nutritionalData.vitamins.map(vitamin => `
                    <div class="vitamin-item">
                        <div class="vitamin-name">${vitamin.name}</div>
                        <div class="vitamin-progress">
                            <div class="progress-bar" style="width: ${Math.min(vitamin.value, 100)}%"></div>
                        </div>
                        <div class="vitamin-text">${vitamin.value}%</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    statsEl.innerHTML = statsHTML;
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