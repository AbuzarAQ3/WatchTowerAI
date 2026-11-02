from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import UserSerializer
from django.contrib.auth.models import User
# Create your views here.

class Dashboard(APIView):

    def get(self, request):
        user= User.objects.all()
        serializer=UserSerializer(user,many=True)
        return Response(serializer.data)