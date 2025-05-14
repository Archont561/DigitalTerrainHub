from django.utils.html import strip_spaces_between_tags

class SpacelessMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        if 'text/html' in response.get('Content-Type', ''):
            content = response.content.decode('utf-8')
            stripped_content = strip_spaces_between_tags(content)
            response.content = stripped_content.encode('utf-8')

        return response