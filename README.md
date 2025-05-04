# NutriNova

NutriNova is an AI-powered smart nutrition assistant designed to help users track, understand, and optimize their daily food intake. Leveraging GenAI, speech-to-text, and smart APIs, NutriNova empowers users to log meals effortlessly, decode nutritional value, and receive personalized health insights—promoting a data-driven, healthier lifestyle.

## Objectives
- Enable effortless food logging via text, image, and speech input.
- Provide automatic nutrition analysis using external APIs.
- Deliver personalized, AI-powered dietary recommendations.
- Visualize nutrition data and trends for actionable insights.
- Support modular, scalable development for future integrations.

## Features & Modules
- **Food Logging**: Log meals and beverages via text, image, or speech.
- **Nutrition Analysis**: Auto-fetch calorie, protein, fat, and carb content using APIs (CalorieNinjas/Edamam).
- **Speech Input Module**: Converts user speech into food items (Whisper API or Google Speech-to-Text).
- **Food Image Analysis**: Identifies food from uploaded images (Vision API or Teachable Machine).
- **GenAI Recommendations**: GPT-powered personalized suggestions based on history and goals.
- **Dashboard & Insights**: Visual charts, nutrient summaries, and meal history.
- **Smart Recall (RAG)**: Retrieves previous meals and health tips via vector similarity search.
- **User Profile**: Stores preferences, allergies, and nutrition goals.

## Architecture
- Modular Python package structure for each feature.
- API integrations for nutrition data and AI services.
- Scalable design for future integration with smart devices and wearables.

### Module Structure
- `food_logging/` — Food and beverage logging
- `nutrition_analysis/` — Nutrition data retrieval and analysis
- `speech_input/` — Speech-to-text food entry
- `image_analysis/` — Food image recognition
- `genai_recommendations/` — Personalized AI suggestions
- `dashboard/` — Data visualization and insights
- `smart_recall/` — Retrieval-augmented generation for meal recall
- `user_profile/` — User preferences and goals

## Getting Started
1. Clone the repository.
2. Install dependencies: `pip install -r requirements.txt`
3. Develop modules independently as needed.

## License
Specify license information here.