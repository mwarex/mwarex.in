import os
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
from local_pipeline import build_graph

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

 
pipeline_app = build_graph()

@app.route('/api/edit-video', methods=['POST'])
def edit_video():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    if file:
        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        
        print(f"[API] Received video: {filepath}")
        
        # Run the pipeline
        initial_state = {
            "video_path": filepath,
            "audio_path": "",
            "video_duration": 0.0,
            "words": [],
            "segments": [],
            "brolls": [],
            "output_video_path": "",
            "status": "Started"
        }
        
        try:
            # We invoke the graph synchronously for now (local fast test)
            final_state = pipeline_app.invoke(initial_state)
            output_path = final_state.get("output_video_path")
            
            if output_path and os.path.exists(output_path):
                # Return just the filename so the frontend can request it via /media
                out_filename = os.path.basename(output_path)
                return jsonify({
                    "status": "success", 
                    "video_url": f"http://localhost:5002/media/{out_filename}"
                })
            else:
                return jsonify({"error": "Pipeline failed to produce output"}), 500
        except Exception as e:
            print(f"[API] Pipeline Error: {e}")
            return jsonify({"error": str(e)}), 500

@app.route('/media/<filename>')
def serve_media(filename):
    """Serve the final output video back to the frontend."""
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    if os.path.exists(filepath):
        return send_file(filepath)
    return "File not found", 404

if __name__ == '__main__':
    print("🚀 Top 0.1% Editor Bridge running on http://localhost:5002")
    app.run(host='0.0.0.0', port=5002, debug=True)
