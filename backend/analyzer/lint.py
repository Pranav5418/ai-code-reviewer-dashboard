from pylint.lint import Run
from io import StringIO
import sys

def run_lint(code):
    temp_file = "temp.py"

    with open(temp_file, "w") as f:
        f.write(code)

    old_stdout = sys.stdout
    sys.stdout = mystdout = StringIO()

    try:
        Run([temp_file], exit=False)
    except:
        pass

    sys.stdout = old_stdout
    return mystdout.getvalue()