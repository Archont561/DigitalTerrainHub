from django import template

register = template.Library()

@register.filter
def get_notification_pk(tags):
    if "notification_pk:" in tags:
        return tags.split("notification_pk:")[-1]
    return None