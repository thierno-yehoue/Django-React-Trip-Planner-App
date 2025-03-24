from rest_framework.views import APIView 
from rest_framework.response import Response 
from rest_framework import status
from .trip_logic import calculate_trip_plan

class TripView(APIView):
    def post(self, request):
        data = request.data
        current_loc = data.get('currentLocation')
        pickup_loc = data.get('pickupLocation')
        dropoff_loc = data.get('dropoffLocation')
        current_cycle_used = float(data.get('currentCycleUsed', 0))

        if not all([current_loc, pickup_loc, dropoff_loc]):
            return Response({"error": "Missing required fields."},
                            status=status.HTTP_400_BAD_REQUEST)

        result = calculate_trip_plan(
            current_loc, pickup_loc, dropoff_loc, current_cycle_used
        )

        return Response(result, status=status.HTTP_200_OK)
