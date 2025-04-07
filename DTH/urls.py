from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('', include('Users.urls')),
    path('pyodm', include('PyODM.urls')),
    path('admin/', admin.site.urls),
]
