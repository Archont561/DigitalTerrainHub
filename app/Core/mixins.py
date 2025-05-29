from django.apps import apps
from django.template.loader import render_to_string
from django.http import HttpResponse

app_config = apps.get_app_config("Core")

class MessagesMixin:
    messages_template_name = app_config.templates.cotton.notifications.alert

    def render_with_oob_messages(self, request, template_name, context):
        main_html = render_to_string(template_name, context, request=request)
        messages_html = render_to_string(self.messages_template_name, {}, request=request)
        return HttpResponse(main_html + messages_html)