from rest_framework.renderers import BaseRenderer
from .http import AstroTemplateResponse

class AstroHTMLRenderer(BaseRenderer):
    media_type = "text/html"
    format = "astro"

    def render(self, data, accepted_media_type=None, renderer_context=None):
        request = renderer_context.get('request') if renderer_context else None
        view = renderer_context.get('view') if renderer_context else None
        template = getattr(view, "template_name", None)
        astroResponse = AstroTemplateResponse(request, template, data)
        return astroResponse.content