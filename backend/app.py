"""
Flask entry point for the Retail Digital Twin API.

Run from the project root:
    python -m backend.app
"""
from flask import Flask
from flask_cors import CORS

from backend.api.overview import overview_bp


def create_app() -> Flask:
    app = Flask(__name__)

    # TanStack Start dev server runs on Vite's default port.
    # Tighten this list to your actual frontend origin in production.
    CORS(app, resources={r"/api/*": {"origins": [
        "http://localhost:3000",
        "http://localhost:5173",
    ]}})

    app.register_blueprint(overview_bp)

    @app.route('/api/health')
    def health():
        return {'status': 'ok'}

    return app


app = create_app()

if __name__ == '__main__':
    app.run(debug=True, port=5000)