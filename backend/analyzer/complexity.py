import ast

def calculate_complexity(code):
    tree = ast.parse(code)
    complexity = 0

    for node in ast.walk(tree):
        if isinstance(node, (ast.If, ast.For, ast.While, ast.FunctionDef)):
            complexity += 1

    return complexity