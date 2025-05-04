from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import json

db = SQLAlchemy()

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    
    # Relationships
    profile = db.relationship('UserProfile', backref='user', uselist=False)
    food_entries = db.relationship('FoodEntry', backref='user', lazy='dynamic')
    recommendations = db.relationship('NutritionRecommendation', backref='user', lazy='dynamic')
    reports = db.relationship('NutritionReport', backref='user', lazy='dynamic')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class UserProfile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    age = db.Column(db.Integer)
    gender = db.Column(db.String(10))
    height = db.Column(db.Float)  # in cm
    weight = db.Column(db.Float)  # in kg
    activity_level = db.Column(db.String(20))  # sedentary, light, moderate, active, very active
    dietary_restrictions = db.Column(db.String(200))  # comma-separated list
    calorie_goal = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class FoodEntry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    food_name = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Float, nullable=False)
    unit = db.Column(db.String(20), default='serving')
    calories = db.Column(db.Float)
    protein = db.Column(db.Float)  # in grams
    carbs = db.Column(db.Float)    # in grams
    fat = db.Column(db.Float)      # in grams
    meal_type = db.Column(db.String(20))  # breakfast, lunch, dinner, snack
    entry_date = db.Column(db.Date, nullable=False)
    entry_time = db.Column(db.Time, default=lambda: datetime.utcnow().time())
    entry_method = db.Column(db.String(20))  # manual, speech, image
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class NutritionRecommendation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    recommendation_type = db.Column(db.String(20))  # nutrient, calorie, meal, general
    recommendation_text = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class NutritionReport(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    report_type = db.Column(db.String(20))  # daily, weekly, monthly
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    _report_data = db.Column('report_data', db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    @property
    def report_data(self):
        return json.loads(self._report_data) if self._report_data else None
    
    @report_data.setter
    def report_data(self, value):
        self._report_data = json.dumps(value)