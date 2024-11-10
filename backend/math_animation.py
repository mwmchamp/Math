from manim import *
from manim_voiceover import VoiceoverScene
from manim_voiceover.services.gtts import GTTSService

class MathAnimation(VoiceoverScene):
    def construct(self):
        self.set_speech_service(GTTSService())

        # Initial equation
        eq = MathTex(r"\int_0^1 (x^3 - 3x^2 + 2x + 1) \, dx").to_edge(UP, buff=0.5)
        eq.shift(LEFT * 3)

        # Create coordinate system
        axes = NumberPlane(
            x_range=[-0.5, 1.5, 0.5],
            y_range=[-1, 2, 0.5],
            background_line_style={"stroke_opacity": 0.2}
        ).shift(RIGHT * 3)

        # Function and graph
        def func(x):
            return x**3 - 3*x**2 + 2*x + 1

        graph = axes.plot(func, color=BLUE)
        
        # Area to fill
        area = axes.get_area(graph, x_range=[0, 1], color=BLUE_D, opacity=0.3)
        
        # Vertical lines for bounds
        x0_line = DashedLine(
            axes.c2p(0, -1), 
            axes.c2p(0, 2),
            color=YELLOW
        )
        x1_line = DashedLine(
            axes.c2p(1, -1),
            axes.c2p(1, 2),
            color=YELLOW
        )

        with self.voiceover(text="Let's evaluate the integral of x cubed minus three x squared plus two x plus one from zero to one."):
            self.play(Write(eq), run_time=2)
            self.play(Create(axes), run_time=2)
            self.play(Create(graph), run_time=2)

        with self.voiceover(text="First, let's visualize the bounds of integration."):
            self.play(Create(x0_line), Create(x1_line), run_time=2)

        # Moving vertical line for integration visualization
        moving_line = DashedLine(
            axes.c2p(0, -1),
            axes.c2p(0, 2),
            color=YELLOW
        )
        
        with self.voiceover(text="As we integrate from left to right, we're finding the area under this curve."):
            self.play(
                moving_line.animate.shift(RIGHT * 3),
                UpdateFromAlphaFunc(area, lambda m, a: m.become(
                    axes.get_area(graph, x_range=[0, a], color=BLUE_D, opacity=0.3)
                )),
                run_time=3
            )

        # Solution steps
        step1 = MathTex(r"\left[\frac{x^4}{4} - x^3 + x^2 + x\right]_0^1").next_to(eq, DOWN, buff=0.5).align_to(eq, LEFT)
        step2 = MathTex(r"= \left(\frac{1}{4} - 1 + 1 + 1\right) - \left(0 - 0 + 0 + 0\right)").next_to(step1, DOWN, buff=0.5).align_to(step1, LEFT)
        step3 = MathTex(r"= \frac{5}{4}").next_to(step2, DOWN, buff=0.5).align_to(step2, LEFT)

        with self.voiceover(text="Let's solve this step by step. First, we find the antiderivative."):
            self.play(Write(step1), run_time=2)

        with self.voiceover(text="Then we evaluate at the upper and lower bounds."):
            self.play(Write(step2), run_time=2)

        with self.voiceover(text="Finally, we get our answer: five fourths or one point two five."):
            self.play(Write(step3), run_time=2)
            self.wait(1)

        with self.voiceover(text="And that completes our evaluation of the integral."):
            self.play(
                FadeOut(axes),
                FadeOut(graph),
                FadeOut(area),
                FadeOut(x0_line),
                FadeOut(x1_line),
                FadeOut(moving_line),
                run_time=2
            )
            self.wait(1)