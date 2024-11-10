from flask import Flask, request, jsonify
from flask_cors import CORS
from io import BytesIO
from PIL import Image
import shutil

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

import anthropic
import wolframalpha
from pathlib import Path
import subprocess

class CrystalMath2D:
    def __init__(self, api_key, wolfram_app_id):
        self.client = anthropic.Anthropic(api_key=api_key)
        self.wolfram_client = wolframalpha.Client(wolfram_app_id)
        
    def _solve_math(self, problem):
        try:
            result = self.wolfram_client.query(problem)
            answer = list(result.results)[-1].text
            return answer
        except Exception as e:
            return f"Error solving problem: {str(e)}"

    def _generate_manim_code(self, latex_expr):
        solution = self._solve_math(latex_expr)
        
        prompt = (
            f"Generate only the Manim code (Python) to animate the following LaTeX expression in 2D, and also uses the manim voiceover method to add a brief explanation: {latex_expr}\n"
            "Requirements:\n"
            "- Class name MUST be 'MathAnimation'\n"
            "- Use Scene class only, no 3D scenes allowed\n"
            "- Use MathTex for LaTeX rendering\n"
            "- All animations must be strictly 2D\n"
            "- Use TransformMatchingTex for smooth transitions between equations\n"
            "- For derivatives:\n"
            "    - Show original function in BLUE\n"
            "    - Show derivative function in RED\n"
            "    - Add YELLOW dots at key points (maxima, minima, intersections)\n"
            "    - Animate dots transforming from original to derivative curve\n"
            "- For integrals:\n"
            "    - Show the function curve first\n"
            "    - Animate the area filling from left to right\n"
            "    - Use BLUE_D color with opacity 0.3 for filled area\n"
            "    - Show bounds with vertical dashed lines\n"
            "    - Add a moving vertical line to show integration progress\n"
            "- Pin equations to the top with:\n"
            "    - to_edge(UP, buff=0.5)\n" 
            "- For graphs:\n"
            "    - Use NumberPlane\n"
            "    - Set background_line_style={\"stroke_opacity\": 0.2}\n"
            "    - Use proper scaling to show full function\n"
            "    - Add coordinate dots at key points\n"
            "    - Do not label axes\n"
            "- Animation sequence:\n"
            "    1. Write the initial equation\n"
            "    2. Create coordinate system\n"
            "    3. Draw function curve\n"
            "    4. Show integration/derivation visualization\n"
            "    5. Transform to final result\n"
            "    6. FadeOut(axes, graph, run_time=1)\n"
            "    7. Show solution steps:\n"
            "        - Keep original equation at top\n"
            "        - FadeIn() each step below previous\n"
            "        - Wait(1) between steps\n"
            "I want the writing of math to be on the left, and the graph and visualizations to the right so that they don't overlap over each other"
            "Ensure the animations fit on the screen, when it gets lengthy this doesn't happen"
            "ENSURE NO OVERLAPS"
            "I observe that the animation quality drops with speaking, so still use some complex animations to ensure that it is conveyed well VISUALLY"
            "I want the integral animations to clearly highlight how the area is being filled"           
            " Code must be complete and runnable\n"
            " Ensure the animations fit on the screen, when it gets lengthy this doesn't happen"
            " THE VOICEOVER MUST explain the STEPS TO SOLVE THE QUESTION with = THE VISUALIZATION"
            " THE VIDEO MUST HAVE AUDIO"
            " THE VOICEOVER IS VERY IMPORTANT, do from manim_voiceover import * and use the self.voiceover method to add a voiceover to the animation\n"
            " Don't use get_riemman_rectangles"
            " SOLVE TILL THE FINAL NUMERICAL ANSWER(if the question has one), DONT LEAVE ANYTHING FOR THE VIEWER TO SOLVE"
            "Add a voiceover using the self.voiceover method to explain the animation steps."
            "You need to add the text so that the voiceover matches the timing of the animations. THIS IS VERY IMPORTANT"
            "Also the audio doesn't show up sometimes so fix that. Ensure text fits in the screen"
            "- Use Manim Community Edition syntax version 0.18.0\n"
            "- For all animations:\n"
            "    - Always use .animate when animating methods:\n"
            "        - self.play(mobject.animate.method())\n"
            "    - Group arrangements must be animated:\n"
            "        - self.play(group.animate.arrange(DOWN, buff=0.5))\n"
            "    - Use run_time=2 for all animations\n"
            "    - Use self.wait(1) between animations\n"
        )
        
        # Claude API call
        response = self.client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=2000,
            temperature=0.2,
            system="You are a Manim code generator. Only output valid Manim code between triple backticks, nothing else.",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": prompt
                        }
                    ]
                }
            ]
        )
        
        # Extract code from response
        content = response.content[0].text
        code = content.split("```python")[1].split("```")[0].strip()
        return code

    def _save_code(self, code, filename="math_animation.py"):
        with open(filename, "w") as f:
            f.write(code)
        return filename

    def _run_manim(self, filename):
        try:
            subprocess.run([
                "manim", 
                "-ql",  # Production quality, low resolution
                filename,
                "MathAnimation2D"  # Scene name
            ], check=True)
            return True
        except subprocess.CalledProcessError:
            return False

    def generate_animation(self, latex_expr):
        # Generate the Manim code
        code = self._generate_manim_code(latex_expr)
        
        # Save to file
        filename = self._save_code(code)
        
        # Run Manim
        success = self._run_manim(filename)
        
        if success:
            # Define the media directory and the expected video file path
            media_dir = Path("media/videos/math_animation/480p15")
            video_file = media_dir / "MathAnimation.mp4"
            
            # Check if the video file exists
            if video_file.exists():
                try:
                    # Define the destination directory and ensure it exists
                    static_dir = Path("static")
                    static_dir.mkdir(exist_ok=True)
                    
                    # Define the path in the static directory
                    static_video_file = static_dir / video_file.name
                    
                    # Move the video file to the static directory
                    shutil.move(str(video_file), str(static_video_file))
                    print(f"Video moved successfully to {static_video_file}")
                    
                    return str(static_video_file)
                
                except Exception as e:
                    print(f"Error moving video file: {e}")
                    return None
            else:
                print("Video file was not found in the expected location.")
                return None
        
        print("Animation generation was unsuccessful.")
        return None


@app.route('/generate-video', methods=['POST'])
def generate_video():
    # if 'image' not in request.files:
    #     return jsonify({'error': 'No image file provided'}), 400
    
    # image_file = request.files['image']
    text = request.form.get('text')
    
    # if image_file.filename == '':
    #     return jsonify({'error': 'No selected image file'}), 400
    
    # if image_file and allowed_file(image_file.filename):

    #     image_data = image_file.read()
        
    #     image = Image.open(BytesIO(image_data))

    crystal_math = CrystalMath2D()
    video_path = crystal_math.generate_animation(text)
        
    if video_path:
            print(f"Animation generated successfully: {video_path}")
    else:
            print("Failed to generate animation")
        
    video_url = "http://localhost:5000/static/MathAnimation.mp4"
        
    return jsonify({'videoUrl': video_url})
    
    # return jsonify({'error': 'Invalid file type'}), 400

def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

if __name__ == '__main__':
    app.run(debug=True)