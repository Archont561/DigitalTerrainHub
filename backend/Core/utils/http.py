import requests
from urllib.parse import urljoin
from django.template.response import TemplateResponse
from django.http import HttpResponse, HttpResponseServerError
from django.conf import settings
from django.middleware.csrf import get_token


class AstroTemplateResponse(TemplateResponse):

    def render(self):
        astro_url = urljoin(settings.ASTRO_URL, self.template_name)
        headers = {
            'Content-Type': 'application/json',
            'X-CSRFToken': self._request and get_token(self._request),
        }

        try:
            astro_response = requests.post(
                astro_url,
                headers=headers,
                json=self.context_data,
                timeout=5,
            )
            return HttpResponse(astro_response.text, status=astro_response.status_code)
        except requests.RequestException as e:
            return HttpResponseServerError()
