import re

class SpacelessMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        if 'text/html' in response.get('Content-Type', ''):
            content = response.content.decode('utf-8')
            stripped_content = self.strip(content)
            response.content = stripped_content.encode('utf-8')
        return response

    def strip(self, content):
        content = re.sub(r'>\s*<', '><', content)
        content = re.sub(r'\s+', ' ', content)
        return content.strip()