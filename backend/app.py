from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/generate-video')
def get_video():
    video_url = "http://localhost:5000/static/video.mp4"
    return jsonify({"videoUrl": video_url})

if __name__ == '__main__':
    app.run(debug=True)