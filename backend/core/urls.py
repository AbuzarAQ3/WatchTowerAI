from django.urls import path
from . import views

urlpatterns = [
    path('', views.core_debug, name='core_debug'),
]
