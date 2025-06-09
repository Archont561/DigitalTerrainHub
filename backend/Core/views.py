from django.shortcuts import render, redirect
from django.http import HttpRequest
from django.views.decorators.http import require_GET
from django.contrib.auth.decorators import login_required
from django.conf import settings
from .utils.http import AstroTemplateResponse


@require_GET
def home(request: HttpRequest):
    return AstroTemplateResponse(request, "", {
        "app_name": settings.APP_NAME,
        "is_logged": request.user.is_authenticated
    })

@require_GET
def login(request: HttpRequest):
    if request.user.is_authenticated:
        return redirect("core:profile")

    return AstroTemplateResponse(request, "login", {
        "app_name": settings.APP_NAME
    })

@require_GET
def register(request: HttpRequest):
    if request.user.is_authenticated:
        return redirect("core:profile")
        
    return AstroTemplateResponse(request, "register", {
        "app_name": settings.APP_NAME
    })

@require_GET
@login_required
def profile(request: HttpRequest):
    return AstroTemplateResponse(request, "profile", {
        "app_name": settings.APP_NAME
    })

def custom_404(request: HttpRequest, exception):
    return AstroTemplateResponse(request, "404", {
        "app_name": settings.APP_NAME,
        "is_logged": request.user.is_authenticated
    })

def custom_500(request: HttpRequest):
    return render(request, "500.html", status=500, context={
        "app_name": settings.APP_NAME,
        "is_logged": request.user.is_authenticated
    })
