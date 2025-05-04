/**
 * NutriNova Food Entry JavaScript
 * Handles food entry form submissions, speech input, and image upload
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all food entry components
    initManualEntryForm();
    initSpeechInput();
    initImageUpload();
});

/**
 * Initialize the manual entry form
 */
function initManualEntryForm() {
    const manualForm = document.getElementById('manual-entry-form');
    
    manualForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const foodName = manualForm.querySelector('[name="food_name"]').value;
        const quantity = manualForm.querySelector('[name="quantity"]').value;
        
        if (!foodName || !quantity) {
            showMessage('Please enter both food name and quantity', 'error');
            return;
        }
        
        // Submit the food entry
        submitFoodEntry({
            food_name: foodName,
            quantity: parseFloat(quantity),
            method: 'manual'
        });
        
        // Reset the form
        manualForm.reset();
    });
}

/**
 * Initialize speech input functionality
 */
function initSpeechInput() {
    const speechBtn = document.getElementById('speech-btn');
    const speechResult = document.getElementById('speech-result');
    
    // Check if browser supports speech recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        speechBtn.disabled = true;
        speechResult.textContent = 'Speech recognition is not supported in your browser.';
        return;
    }
    
    speechBtn.addEventListener('click', function() {
        // In a real app, this would use the Web Speech API
        // For now, simulate with a mock API call
        speechBtn.disabled = true;
        speechBtn.textContent = 'Listening...';
        speechResult.textContent = 'Listening for your food entry...';
        
        // Simulate API call
        setTimeout(() => {
            fetch('/api/speech_to_text', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    speechResult.textContent = data.text;
                    // Parse the text to extract food information
                    // This would be more sophisticated in a real app
                    const foodMatch = data.text.match(/([\w\s]+) for (breakfast|lunch|dinner|snack)/i);
                    if (foodMatch) {
                        const foodName = foodMatch[1].trim();
                        const mealType = foodMatch[2].toLowerCase();
                        
                        // Create a food entry from speech
                        submitFoodEntry({
                            food_name: foodName,
                            quantity: 1, // Default quantity
                            meal_type: mealType,
                            method: 'speech'
                        });
                    } else {
                        showMessage('Could not identify food from speech. Please try again or use manual entry.', 'warning');
                    }
                } else {
                    showMessage('Speech recognition failed. Please try again.', 'error');
                }
            })
            .catch(error => {
                console.error('Speech recognition error:', error);
                showMessage('Speech recognition error. Please try again.', 'error');
            })
            .finally(() => {
                speechBtn.disabled = false;
                speechBtn.textContent = 'Speak';
            });
        }, 1500); // Simulate processing time
    });
}

/**
 * Initialize image upload functionality
 */
function initImageUpload() {
    const imageForm = document.getElementById('image-upload-form');
    
    imageForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const fileInput = imageForm.querySelector('[name="food_image"]');
        if (!fileInput.files || fileInput.files.length === 0) {
            showMessage('Please select an image to upload', 'error');
            return;
        }
        
        const formData = new FormData();
        formData.append('food_image', fileInput.files[0]);
        
        // Show loading state
        const submitBtn = imageForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Analyzing...';
        
        // Submit the image for analysis
        fetch('/api/image_analysis', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success && data.detected_foods && data.detected_foods.length > 0) {
                // Show detected foods
                showDetectedFoods(data.detected_foods);
            } else {
                showMessage('No foods detected in the image. Please try another image or use manual entry.', 'warning');
            }
        })
        .catch(error => {
            console.error('Image analysis error:', error);
            showMessage('Error analyzing image. Please try again.', 'error');
        })
        .finally(() => {
            // Reset form state
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
            imageForm.reset();
        });
    });
}

/**
 * Display detected foods from image analysis and allow user to select
 * @param {Array} foods - Array of detected food objects
 */
function showDetectedFoods(foods) {
    // Create a modal or dropdown to select from detected foods
    const foodList = document.createElement('div');
    foodList.className = 'detected-foods';
    
    const heading = document.createElement('h3');
    heading.textContent = 'Detected Foods';
    foodList.appendChild(heading);
    
    const list = document.createElement('ul');
    foods.forEach(food => {
        const item = document.createElement('li');
        item.innerHTML = `
            <div class="food-item">
                <span>${food.name} (${Math.round(food.confidence * 100)}% confidence)</span>
                <button class="add-food-btn" data-food="${food.name}">Add</button>
            </div>
        `;
        list.appendChild(item);
    });
    foodList.appendChild(list);
    
    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.className = 'close-btn';
    foodList.appendChild(closeBtn);
    
    // Add to page
    const imageSection = document.querySelector('section:nth-of-type(3)');
    imageSection.appendChild(foodList);
    
    // Add event listeners
    const addButtons = foodList.querySelectorAll('.add-food-btn');
    addButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const foodName = this.getAttribute('data-food');
            submitFoodEntry({
                food_name: foodName,
                quantity: 1, // Default quantity
                method: 'image'
            });
        });
    });
    
    closeBtn.addEventListener('click', function() {
        foodList.remove();
    });
}

/**
 * Submit a food entry to the API
 * @param {Object} foodData - Food entry data
 */
function submitFoodEntry(foodData) {
    fetch('/api/food_entry', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(foodData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showMessage(data.message, 'success');
        } else {
            showMessage(data.error || 'Error adding food entry', 'error');
        }
    })
    .catch(error => {
        console.error('Food entry error:', error);
        showMessage('Error adding food entry. Please try again.', 'error');
    });
}

/**
 * Display a message to the user
 * @param {string} message - The message to display
 * @param {string} type - Message type (success, error, warning)
 */
function showMessage(message, type = 'info') {
    const messageEl = document.createElement('div');
    messageEl.className = `message ${type}`;
    messageEl.textContent = message;
    
    const main = document.querySelector('main');
    main.prepend(messageEl);
    
    // Remove the message after 5 seconds
    setTimeout(() => {
        messageEl.remove();
    }, 5000);
}