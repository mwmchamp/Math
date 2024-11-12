from flask import Flask, request, jsonify
from flask_cors import CORS
from io import BytesIO
from PIL import Image
import shutil
import boto3
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
        self.manim_path = '/home/crystalmath/site/venv/bin/manim'
        self.bucket_name = 'hackit-crystalmath'
        self.s3_client = boto3.client('s3', aws_access_key_id='', aws_secret_access_key='', region_name='us-east-1')
        
    def _solve_math(self, problem):
        try:
            result = self.wolfram_client.query(problem)
            answer = list(result.results)[-1].text
            return answer
        except Exception as e:
            return f"Error solving problem: {str(e)}"

    def _generate_manim_code(self, latex_expr):
        solution = self._solve_math(latex_expr)
        
        # open the file and read the content
        prompt = "Templates:\n"
        for file in ["derivative.txt", "single_integral.txt", "double_integral.txt", "plot2d.txt", "plot3d.txt"]:
            with open(f"{file}", "r") as f:
                prompt += f"{file} Template:\n{f.read()}\n\n"
        
        prompt += ( f"\n\nProblem:\n"
        f"{latex_expr}"
        "\nSolution:\n"
        f"{solution}"
        "\nPlease VISUALIZE AND SOLVE the problem.\n"
        "If the problem is a double_integral use the double_integral template, if it is a single_integral use the single_integral template, if it is a derivative use the derivative template, if it is a plot use the plot template\n"
        "If using a template, try to only make a few necesssary changes to the code, but be sure to answer the question fully."
        "\nThe scene MUST be named MathAnimation."
        "\nMake sure to edit the voiceover text in the code as needed."
        "\nBe very meticulous on the steps, make sure they are correct and lead to the given solution. Skip all simple algebraic and simplifying steps, only show the logical steps."
        "\nThe number of steps should equal the number of LaTeX expressions in the step-by-step solution. Put the entire equation in one step."
        "\nMake sure all the text will be visible on screen, if there are too many steps, reduce the scale of the text."
        "\nIf no template code is relevant, generate your own manim code using the FOLLOWING GUIDELINES:"
        "\nI want the writing of math to be on the left! The graph and visualizations should be on the right so that they don't overlap over each other!"
        "\nEnsure the animations fit on the screen, when it gets lengthy this doesn't happen"
        "\nENSURE NO OVERLAPS!!"
        "\nI observe that the animation quality drops with speaking, so still use some complex animations to ensure that it is conveyed well VISUALLY"
        "\nI want the integral animations to clearly highlight how the area is being filled"           
        "\nCode must be complete and runnable, meaning no hanging functions or variables, missing imports, etc."
        "\nEnsure the animations fit on the screen, when it gets lengthy this doesn't happen"
        "\nTHE VOICEOVER MUST explain the STEPS TO SOLVE THE QUESTION with = THE VISUALIZATION"
        "\nTHE VIDEO MUST HAVE AUDIO"
        "\nTHE VOICEOVER IS VERY IMPORTANT, do from manim_voiceover import * and use the self.voiceover method to add a voiceover to the animation"
        "\nDon't use get_riemman_rectangles"
        "\nSOLVE TILL THE FINAL NUMERICAL ANSWER(if the question has one), DONT LEAVE ANYTHING FOR THE VIEWER TO SOLVE"
        "\nAdd a voiceover using the self.voiceover method to explain the animation steps."
        "\nYou need to add the text so that the voiceover matches the timing of the animations. THIS IS VERY IMPORTANT"
        "\nAlso the audio doesn't show up sometimes so fix that. Ensure text fits in the screen"
        "\n- Use Manim Community Edition syntax version 0.18.0"
        "\n- For all animations:\n"
        "- Always use .animate when animating methods:\n"
        "    - self.play(mobject.animate.method())\n"
        "- Group arrangements must be animated:\n"
        "    - self.play(group.animate.arrange(DOWN, buff=0.5))\n"
        "- Use run_time=2 for all animations\n"
        "- Use self.wait(1) between animations\n"
        "- 3D scenes should inherit from ThreeDScene and VoiceoverScene\n"
        "- 2D scenes should inherit from Scene and VoiceoverScene\n"
        "- Ensure no text is cut off"
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
                        # Upload the file to S3
                        s3_key = f"animations/{video_file.name}"
                        self.s3_client.upload_file(str(video_file), self.bucket_name, s3_key)
                        
                        # Generate a public URL for the uploaded file
                        s3_url = f"https://{self.bucket_name}.s3.amazonaws.com/{s3_key}"
                        
                        print(f"Video uploaded successfully to S3: {s3_url}")
                        
                        # Optionally, delete the local file after upload
                        video_file.unlink()
                        
                        return s3_url
                    
                    except Exception as e:
                        print(f"Error uploading video file to S3: {e}")
                        return None
                else:
                    print("Video file was not found in the expected location.")
                    return None
            else:
                print("Manim animation generation failed.")
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

    crystal_math = CrystalMath2D("", "")
    video_path = crystal_math.generate_animation(text)
        
    if video_path:
            print(f"Animation generated successfully: {video_path}")
    else:
            print("Failed to generate animation")
        
    video_url = video_path
        
    return jsonify({'videoUrl': video_url})
    
    # return jsonify({'error': 'Invalid file type'}), 400

def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

if __name__ == '__main__':
    app.run(threaded=True)