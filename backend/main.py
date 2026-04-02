from fastapi import FastAPI
from pydantic import BaseModel

from analyzer.complexity import calculate_complexity
from analyzer.lint import run_lint
from analyzer.scorer import calculate_score
from analyzer.suggestions import generate_suggestions

# ✅ MUST BE HERE (before using @app)
app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CodeInput(BaseModel):
    code: str

@app.get("/")
def home():
    return {"message": "Code Reviewer API Running"}

@app.post("/analyze")
def analyze_code(data: CodeInput):
    code = data.code

    complexity = calculate_complexity(code)
    lint_output = run_lint(code)
    score = calculate_score(complexity, lint_output)
    suggestions = generate_suggestions(code)

    return {
        "complexity_score": complexity,
        "quality_score": score,
        "suggestions": suggestions,
        "lint_report": lint_output
    }