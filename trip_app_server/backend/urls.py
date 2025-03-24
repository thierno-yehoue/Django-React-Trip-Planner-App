from django.contrib import admin
from django.urls import path
from trips.views import TripView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/trip/', TripView.as_view(), name='trip'),
]
