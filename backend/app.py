"""
Flask entry point for the Retail Digital Twin API.

Run from the project root:
    python -m backend.app
"""

from flask import Flask
from flask_cors import CORS

from backend.api.overview import overview_bp
from backend.api.twin import twin_bp
from backend.api.prediction import prediction_bp
from backend.api.recommendations import recommendations_bp
from backend.api.simulator import simulator_bp

def create_app() -> Flask:
    """Create and configure the Flask application."""

    app = Flask(__name__)

    # Allow requests from the development frontend.
    # Tighten these origins for production deployment.
    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": [
                    "http://localhost:3000",
                    "http://localhost:5173",
                    "http://localhost:8080",
                ]
            }
        },
    )

    # Register API blueprints
    app.register_blueprint(overview_bp)
    app.register_blueprint(twin_bp)
    app.register_blueprint(prediction_bp)
    app.register_blueprint(recommendations_bp)
    app.register_blueprint(simulator_bp)

    @app.route("/api/health")
    def health():
        return {"status": "ok"}

    return app


app = create_app()


if __name__ == "__main__":
    app.run(
        debug=True,
        port=5000,
    )