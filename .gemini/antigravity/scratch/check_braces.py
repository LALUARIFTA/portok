
with open('src/style.css', 'r', encoding='utf-8') as f:
    content = f.read()
    open_count = content.count('{')
    close_count = content.count('}')
    print(f"Open: {open_count}, Close: {close_count}")
    
    stack = []
    for i, char in enumerate(content):
        if char == '{':
            stack.append(i)
        elif char == '}':
            if not stack:
                print(f"Extra closing brace at index {i}")
            else:
                stack.pop()
    if stack:
        print(f"Unclosed braces starting at indices: {stack}")
