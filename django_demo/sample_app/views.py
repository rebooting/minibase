
from django.http import HttpResponse
from django.shortcuts import render
from django.shortcuts import render

# Create your views here.
def index(request):
    # return "hello world from sample_app"
    return HttpResponse("hello world from sample_app")

def page_two(request):
    return HttpResponse("hello world from page_two")