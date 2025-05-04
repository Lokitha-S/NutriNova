from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from .models import db, User
from .auth import bp as auth_bp
from .routes import bp as routes_bp
import os

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'your-secret-key'  # Replace with a secure key in production
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///nutrinova.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Ensure the instance folder exists
    os.makedirs(app.instance_path, exist_ok=True)
    
    db.init_app(app)
    
    # Create database tables
    with app.app_context():
        db.create_all()

    login_manager = LoginManager()
    login_manager.login_view = 'auth.login'
    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/')
    app.register_blueprint(routes_bp, url_prefix='/')

    return app