import os
from flask import Blueprint, jsonify, send_from_directory
from app.service import gpu_info

general_bp = Blueprint('general_bp', __name__)

@general_bp.route("/", methods=["GET"])
def index():
    return jsonify({"service": "Background Remover API", "version": "1.0.0"})

@general_bp.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ok", "gpu": gpu_info()})

@general_bp.route("/outputs/<path:filename>")
def serve_output(filename):
    # Use absolute path to ensure correct directory resolution
    outputs_dir = os.path.join(os.getcwd(), 'outputs')
    return send_from_directory(outputs_dir, filename)
