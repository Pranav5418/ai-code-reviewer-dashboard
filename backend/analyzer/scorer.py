def calculate_score(complexity, lint_output):
    score = 100

    # 🔥 Complexity penalty (more realistic)
    if complexity > 15:
        score -= 40
    elif complexity > 10:
        score -= 25
    elif complexity > 5:
        score -= 10

    # 🔥 Detect lint issues properly
    issue_count = 0

    for line in lint_output.split("\n"):
        if any(code in line for code in ["C", "W", "E", "R"]):
            issue_count += 1

    score -= issue_count * 3

    # 🔥 Extra penalty for bad practices
    if "print(" in lint_output:
        score -= 5

    # Clamp score
    if score < 0:
        score = 0

    return score