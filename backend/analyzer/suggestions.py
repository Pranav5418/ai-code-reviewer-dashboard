def generate_suggestions(code):
    suggestions = []

    if "for i in range(len(" in code:
        suggestions.append("Use direct iteration instead of range(len())")

    if "==" in code and "None" in code:
        suggestions.append("Use 'is None' instead of '== None'")

    if len(code.split("\n")) > 50:
        suggestions.append("Consider breaking code into smaller functions")

    if "print(" in code:
        suggestions.append("Avoid print statements in production code")

    return suggestions