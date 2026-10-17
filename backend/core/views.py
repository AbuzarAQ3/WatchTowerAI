from django.shortcuts import render
from django.http import HttpResponse

def core(request):
    return render(request, 'core.html')