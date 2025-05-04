from flask import Blueprint, render_template, redirect, url_for, request, jsonify, flash
from flask_login import login_required, current_user
from datetime import datetime, timedelta
from .models import db, FoodEntry, NutritionRecommendation, NutritionReport

bp = Blueprint('routes', __name__)

@bp.route('/')
def index():
    if current_user.is_authenticated:
        return redirect(url_for('routes.dashboard'))
    return render_template('home.html')

@bp.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html')

@bp.route('/food_entry')
@login_required
def food_entry():
    return render_template('food_entry.html')

@bp.route('/reports')
@login_required
def reports():
    return render_template('reports.html')

# API Endpoints

@bp.route('/api/dashboard_data')
@login_required
def dashboard_data():
    # Get today's date
    today = datetime.utcnow().date()
    
    # Get today's food entries
    today_entries = FoodEntry.query.filter_by(
        user_id=current_user.id,
        entry_date=today
    ).all()
    
    # Calculate daily totals
    daily_totals = {
        'calories': sum(entry.calories or 0 for entry in today_entries),
        'protein': sum(entry.protein or 0 for entry in today_entries),
        'carbs': sum(entry.carbs or 0 for entry in today_entries),
        'fat': sum(entry.fat or 0 for entry in today_entries)
    }
    
    # Get calorie goal from user profile or default to 2000
    calorie_goal = 2000
    if current_user.profile and current_user.profile.calorie_goal:
        calorie_goal = current_user.profile.calorie_goal
    
    # Group entries by meal type
    meals = {}
    for entry in today_entries:
        meal_type = entry.meal_type or 'Other'
        if meal_type not in meals:
            meals[meal_type] = []
        
        meals[meal_type].append({
            'id': entry.id,
            'food_name': entry.food_name,
            'quantity': entry.quantity,
            'unit': entry.unit,
            'calories': entry.calories
        })
    
    # Get recent recommendations
    recent_recommendations = NutritionRecommendation.query.filter_by(
        user_id=current_user.id,
        is_read=False
    ).order_by(NutritionRecommendation.created_at.desc()).limit(3).all()
    
    recommendations = []
    for rec in recent_recommendations:
        recommendations.append({
            'id': rec.id,
            'type': rec.recommendation_type,
            'text': rec.recommendation_text,
            'created_at': rec.created_at.strftime('%Y-%m-%d %H:%M')
        })
    
    return jsonify({
        'daily_totals': daily_totals,
        'calorie_goal': calorie_goal,
        'meals': meals,
        'recommendations': recommendations
    })

@bp.route('/api/food_entry', methods=['POST'])
@login_required
def add_food_entry():
    data = request.json
    
    # Validate required fields
    if not data or 'food_name' not in data or 'quantity' not in data:
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Create new food entry
    entry = FoodEntry(
        user_id=current_user.id,
        food_name=data['food_name'],
        quantity=float(data['quantity']),
        unit=data.get('unit', 'serving'),
        entry_method=data.get('method', 'manual'),
        meal_type=data.get('meal_type', 'Other'),
        entry_date=datetime.utcnow().date()
    )
    
    # If calories and nutrients are provided, use them
    if 'calories' in data:
        entry.calories = float(data['calories'])
    if 'protein' in data:
        entry.protein = float(data['protein'])
    if 'carbs' in data:
        entry.carbs = float(data['carbs'])
    if 'fat' in data:
        entry.fat = float(data['fat'])
    
    # Otherwise, we would normally look up nutrition data from a database or API
    # For now, just set some placeholder values
    if 'calories' not in data:
        # In a real app, this would call a nutrition API
        entry.calories = 100  # placeholder
        entry.protein = 5     # placeholder
        entry.carbs = 15      # placeholder
        entry.fat = 3         # placeholder
    
    # Save to database
    db.session.add(entry)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'entry_id': entry.id,
        'message': f'Added {entry.food_name} to your food log'
    })

@bp.route('/api/report_data')
@login_required
def report_data():
    # Get date range parameters
    report_type = request.args.get('type', 'daily')
    date_str = request.args.get('date')
    
    if date_str:
        try:
            selected_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            selected_date = datetime.utcnow().date()
    else:
        selected_date = datetime.utcnow().date()
    
    # Determine date range based on report type
    if report_type == 'weekly':
        start_date = selected_date - timedelta(days=selected_date.weekday())
        end_date = start_date + timedelta(days=6)
    elif report_type == 'monthly':
        start_date = selected_date.replace(day=1)
        # Calculate last day of month
        if selected_date.month == 12:
            end_date = selected_date.replace(year=selected_date.year + 1, month=1, day=1) - timedelta(days=1)
        else:
            end_date = selected_date.replace(month=selected_date.month + 1, day=1) - timedelta(days=1)
    else:  # daily
        start_date = selected_date
        end_date = selected_date
    
    # Check if we have a cached report
    existing_report = NutritionReport.query.filter_by(
        user_id=current_user.id,
        report_type=report_type,
        start_date=start_date,
        end_date=end_date
    ).first()
    
    if existing_report and existing_report.report_data:
        return jsonify(existing_report.report_data)
    
    # Get food entries for the date range
    entries = FoodEntry.query.filter(
        FoodEntry.user_id == current_user.id,
        FoodEntry.entry_date >= start_date,
        FoodEntry.entry_date <= end_date
    ).order_by(FoodEntry.entry_date).all()
    
    # Process entries to generate report data
    # This would be more complex in a real app
    daily_data = {}
    total_calories = 0
    total_protein = 0
    total_carbs = 0
    total_fat = 0
    
    for entry in entries:
        date_str = entry.entry_date.strftime('%Y-%m-%d')
        if date_str not in daily_data:
            daily_data[date_str] = {
                'calories': 0,
                'protein': 0,
                'carbs': 0,
                'fat': 0,
                'entries': []
            }
        
        daily_data[date_str]['calories'] += entry.calories or 0
        daily_data[date_str]['protein'] += entry.protein or 0
        daily_data[date_str]['carbs'] += entry.carbs or 0
        daily_data[date_str]['fat'] += entry.fat or 0
        daily_data[date_str]['entries'].append({
            'id': entry.id,
            'food_name': entry.food_name,
            'quantity': entry.quantity,
            'unit': entry.unit,
            'calories': entry.calories
        })
        
        total_calories += entry.calories or 0
        total_protein += entry.protein or 0
        total_carbs += entry.carbs or 0
        total_fat += entry.fat or 0
    
    # Generate recommendations based on the data
    recommendations = []
    
    # Example recommendation logic (simplified)
    if total_protein < 50 * (end_date - start_date).days + 50:
        recommendations.append({
            'type': 'nutrient',
            'nutrient': 'Protein',
            'status': 'low',
            'text': 'Your protein intake is below recommended levels. Consider adding more lean meats, fish, or plant-based proteins.'
        })
    
    if total_calories < 1500 * (end_date - start_date).days + 1500:
        recommendations.append({
            'type': 'calorie',
            'status': 'low',
            'text': 'Your calorie intake is below recommended levels. Make sure you are eating enough to fuel your body.'
        })
    
    # Prepare the report data
    report_data = {
        'report_type': report_type,
        'start_date': start_date.strftime('%Y-%m-%d'),
        'end_date': end_date.strftime('%Y-%m-%d'),
        'daily_data': daily_data,
        'totals': {
            'calories': total_calories,
            'protein': total_protein,
            'carbs': total_carbs,
            'fat': total_fat
        },
        'recommendations': recommendations
    }
    
    # Cache the report
    new_report = NutritionReport(
        user_id=current_user.id,
        report_type=report_type,
        start_date=start_date,
        end_date=end_date,
        report_data=report_data
    )
    db.session.add(new_report)
    db.session.commit()
    
    return jsonify(report_data)

@bp.route('/api/speech_to_text', methods=['POST'])
@login_required
def speech_to_text():
    # In a real app, this would process audio data and use a speech-to-text API
    # For now, just return a mock response
    return jsonify({
        'success': True,
        'text': 'I had a chicken salad with olive oil dressing for lunch.'
    })

@bp.route('/api/image_analysis', methods=['POST'])
@login_required
def image_analysis():
    # Check if the post request has the file part
    if 'food_image' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['food_image']
    
    # If user does not select file, browser also
    # submit an empty part without filename
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    # In a real app, this would process the image and use a food recognition API
    # For now, just return a mock response
    return jsonify({
        'success': True,
        'detected_foods': [
            {'name': 'Apple', 'confidence': 0.95},
            {'name': 'Banana', 'confidence': 0.85}
        ]
    })

@bp.route('/api/mark_recommendation_read', methods=['POST'])
@login_required
def mark_recommendation_read():
    data = request.json
    
    if not data or 'recommendation_id' not in data:
        return jsonify({'error': 'Missing recommendation ID'}), 400
    
    recommendation = NutritionRecommendation.query.filter_by(
        id=data['recommendation_id'],
        user_id=current_user.id
    ).first()
    
    if not recommendation:
        return jsonify({'error': 'Recommendation not found'}), 404
    
    recommendation.is_read = True
    db.session.commit()
    
    return jsonify({'success': True})