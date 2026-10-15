from django.shortcuts import render
from django.http import HttpResponse

def core_debug(request):
    return HttpResponse('200 BACKEND SUCCESS')