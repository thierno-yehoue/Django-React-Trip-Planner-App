# trips/trip_logic.py

import requests
import os
import math
from datetime import datetime, timedelta
from dotenv import load_dotenv

#  .env 
load_dotenv()

#  ORS_API_KEY from .env
ORS_API_KEY = os.getenv("ORS_API_KEY")

class DutyStatus:
    OFF_DUTY = "off_duty"
    SLEEPER = "sleeper"
    DRIVING = "driving"
    ON_DUTY_NOT_DRIVING = "on_duty_not_driving"

def geocode(address):
    """
    Geocode an address string using ORS's geocoding endpoint.
    Returns (lat, lon) or None if not found.
    """
    print(os.getenv('ORS_API_KEY'))
    print( os.environ.get('ORS_API_KEY'))
    
    url = "https://api.openrouteservice.org/geocode/search"
    params = {
        "api_key": ORS_API_KEY,
        "text": address,
        "size": 1
    }
    resp = requests.get(url, params=params)
    data = resp.json()
    features = data.get("features", [])
    if not features:
        return None
    coords = features[0]["geometry"]["coordinates"]  # [lon, lat]
    lon, lat = coords
    return (lat, lon)


def get_route_geometry(coord_list):
    """
    coord_list: list of (lat, lon) in order
    Calls ORS directions to get route geometry + distance in meters
    """
    # ORS directions wants [lon, lat] for each coordinate, in the 'coordinates' field
    # So we have to flip lat/lon to lon/lat
    coords_for_ors = []
    for (lat, lon) in coord_list:
        coords_for_ors.append([lon, lat])

    url = "https://api.openrouteservice.org/v2/directions/driving-car/geojson"
    headers = {"Authorization": ORS_API_KEY, "Content-Type": "application/json"}
    json_data = {
        "coordinates": coords_for_ors
    }
    resp = requests.post(url, headers=headers, json=json_data)
    data = resp.json()

    # Extract geometry (encoded polyline or geojson) and total distance
    # The default is "application/json" with a geometry type "polyline"
    features = data.get("features", [])
    if not features:
        return None, 0
    geometry = features[0]["geometry"]  # GeoJSON geometry
    distance_meters = features[0]["properties"]["summary"]["distance"]
    duration_hr = features[0]['properties']['summary']['duration'] / 3600
    return geometry, distance_meters, duration_hr

def calculate_trip_plan(current_loc, pickup_loc, dropoff_loc, current_cycle_used):
    """
    1) Geocode each location -> (lat, lon)
    2) Route from current->pickup, pickup->dropoff
    3) Convert total distance to miles
    4) Calculate daily logs
    5) Return geometry + logs
    """
    coord_current = geocode(current_loc)
    coord_pickup = geocode(pickup_loc)
    coord_dropoff = geocode(dropoff_loc)

    if not coord_current or not coord_pickup or not coord_dropoff:
        return {"error": "Could not geocode one or more addresses."}

    # 2. get route geometry for current->pickup
    geom1, dist_m1, duration_m1 = get_route_geometry([coord_current, coord_pickup])
    # 3. get route geometry for pickup->dropoff
    geom2, dist_m2, duration_m2 = get_route_geometry([coord_pickup, coord_dropoff])

    # total distance in meters
    total_dist_m = dist_m1 + dist_m2
    # convert to miles
    distance_miles = total_dist_m * 0.000621371
     
    # total duration in hours
    total_duration = duration_m1 + duration_m2
    
    route_geometry = [geom1, geom2]

    daily_logs = calculate_daily_logs(distance_miles, current_cycle_used)
    
     # Return route geometry + fueling stops + lat/lon for the three key points
    fueling_stops = compute_fueling_stops(geom1, geom2)

    return {

        "latLonCurrent": coord_current,
        "latLonPickup": coord_pickup,
        "latLonDropoff": coord_dropoff,
        "currentLocation": current_loc,
        "pickupLocation": pickup_loc,
        "dropoffLocation": dropoff_loc,
        "currentCycleUsed": current_cycle_used,
        "totalDuration":round(total_duration, 2),
        "distanceMiles": round(distance_miles, 2),
        "dailyLogs": daily_logs,
        "routeGeometry": route_geometry,
        "fuelingStops" : fueling_stops
    }

def calculate_daily_logs(total_distance, current_cycle_used):
    """
      - 70-hour cycle, 11-hour daily driving limit
      - Fueling exactly every 1000 miles (1 hour each fueling stop)
      - 1 hour pickup on Day 1, 1 hour drop-off on final day
      - Build ELD segments, compute statusTotals

    Returns: list of daily logs, each:
      {
        "date": "YYYY-MM-DD",
        "day": 1,
        "driving": 5.0,
        "onDutyNotDriving": 3.0,
        "offDuty": 16.0,
        "totalOnDuty": 8.0,
        "cycleHoursUsed": 48.0,
        "segments": [...],
        "statusTotals": {...}
      }
    """
    from datetime import datetime, timedelta
    start_date = datetime.now().date()

    daily_logs = []
    remaining_distance = total_distance
    day_count = 1
    cycle_hours = current_cycle_used
    miles_traveled = 0.0
    pickup_added = False  # track if we added 1 hr pickup

    while remaining_distance > 0:
        day_date = start_date + timedelta(days=day_count - 1)
        hours_available_today = min(11.0, 70.0 - cycle_hours)
        if hours_available_today <= 0:
            # No more cycle hours
            daily_logs.append({
                "date": day_date.isoformat(),
                "day": day_count,
                "driving": 0.0,
                "onDutyNotDriving": 0.0,
                "offDuty": 24.0,
                "totalOnDuty": 0.0,
                "cycleHoursUsed": cycle_hours,
                "segments": [],
                "statusTotals": {
                    "off_duty": 24.0,
                    "sleeper": 0.0,
                    "driving": 0.0,
                    "on_duty_not_driving": 0.0
                }
            })
            day_count += 1
            continue

        miles_we_can_drive = hours_available_today * 50.0
        miles_to_drive_today = min(remaining_distance, miles_we_can_drive)

        # fueling stops
        fueling_stops = 0
        start_of_day_miles = miles_traveled
        end_of_day_miles = start_of_day_miles + miles_to_drive_today
        boundary = ((int(start_of_day_miles // 1000)) + 1) * 1000
        while boundary <= end_of_day_miles:
            fueling_stops += 1
            boundary += 1000

        fueling_time_today = fueling_stops * 1.0
        hours_driven_today = miles_to_drive_today / 50.0
        day_on_duty_not_driving = 2.0 + fueling_time_today

        if not pickup_added:
            day_on_duty_not_driving += 1.0
            pickup_added = True

        total_on_duty = hours_driven_today + day_on_duty_not_driving
        off_duty = max(0.0, 24.0 - total_on_duty)

        cycle_hours += total_on_duty

        segments = build_segments(
            day_driving=hours_driven_today,
            day_on_duty_not_driving=day_on_duty_not_driving,
            day_off_duty=off_duty,
            day_sleeper=0.0
        )
        status_totals = compute_status_totals(segments)

        daily_logs.append({
            "date": day_date.isoformat(),
            "day": day_count,
            "driving": round(hours_driven_today, 2),
            "onDutyNotDriving": round(day_on_duty_not_driving, 2),
            "offDuty": round(off_duty, 2),
            "totalOnDuty": round(total_on_duty, 2),
            "cycleHoursUsed": round(cycle_hours, 2),
            "segments": segments,
            "statusTotals": status_totals
        })

        miles_traveled += miles_to_drive_today
        remaining_distance -= miles_to_drive_today
        day_count += 1

        if cycle_hours >= 70.0 and remaining_distance > 0:
            # out of cycle hours
            break

    # final day drop-off
    if daily_logs and miles_traveled >= total_distance:
        final_day = daily_logs[-1]
        old_on_duty = final_day["onDutyNotDriving"]
        final_day["onDutyNotDriving"] = round(old_on_duty + 1.0, 2)
        final_day["totalOnDuty"] = round(final_day["driving"] + final_day["onDutyNotDriving"], 2)
        new_off_duty = max(0.0, 24.0 - final_day["totalOnDuty"])
        final_day["offDuty"] = round(new_off_duty, 2)
        final_day["cycleHoursUsed"] = round(final_day["cycleHoursUsed"] + 1.0, 2)

        # rebuild segments
        segs = build_segments(
            day_driving=final_day["driving"],
            day_on_duty_not_driving=final_day["onDutyNotDriving"],
            day_off_duty=final_day["offDuty"]
        )
        final_day["segments"] = segs
        final_day["statusTotals"] = compute_status_totals(segs)
   
    print(day_count,hours_available_today, miles_to_drive_today)
    
    return daily_logs    
    


def build_segments(day_driving, day_on_duty_not_driving, day_off_duty, day_sleeper=0.0):
    """
    Builds a list of ELD segments (start hour, end hour, duty status) for a 24-hour day.
    Order:
      1) On Duty (Not Driving)
      2) Driving
      3) Sleeper
      4) Off Duty
    """
    segments = []
    current_start = 0.0

    if day_on_duty_not_driving > 0:
        segments.append({
            "start": current_start,
            "end": current_start + day_on_duty_not_driving,
            "status": DutyStatus.ON_DUTY_NOT_DRIVING
        })
        current_start += day_on_duty_not_driving

    if day_driving > 0:
        segments.append({
            "start": current_start,
            "end": current_start + day_driving,
            "status": DutyStatus.DRIVING
        })
        current_start += day_driving

    if day_sleeper > 0:
        segments.append({
            "start": current_start,
            "end": current_start + day_sleeper,
            "status": DutyStatus.SLEEPER
        })
        current_start += day_sleeper

    remaining = 24.0 - current_start
    if remaining > 0:
        segments.append({
            "start": current_start,
            "end": 24.0,
            "status": DutyStatus.OFF_DUTY
        })
        current_start = 24.0

    return segments

def compute_status_totals(segments):
    """
    Summarize how many hours are in each duty status.
    Returns a dict like:
      {
        "off_duty": 10.0,
        "sleeper": 0.0,
        "driving": 5.0,
        "on_duty_not_driving": 9.0
      }
    """
    totals = {
        DutyStatus.OFF_DUTY: 0.0,
        DutyStatus.SLEEPER: 0.0,
        DutyStatus.DRIVING: 0.0,
        DutyStatus.ON_DUTY_NOT_DRIVING: 0.0
    }

    for seg in segments:
        duration = seg["end"] - seg["start"]
        totals[seg["status"]] += duration

    return {
        "off_duty": round(totals[DutyStatus.OFF_DUTY], 2),
        "sleeper": round(totals[DutyStatus.SLEEPER], 2),
        "driving": round(totals[DutyStatus.DRIVING], 2),
        "on_duty_not_driving": round(totals[DutyStatus.ON_DUTY_NOT_DRIVING], 2)
    }


def haversine_miles(lat1, lon1, lat2, lon2):
    R = 3958.8  # Earth radius in miles
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)
    a = (math.sin(dLat/2)**2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dLon/2)**2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

def compute_fueling_stops(route1, route2):
    
    print(route1["coordinates"], route2["coordinates"])
 
    # decode polylines
    coords1 = route1["coordinates"] # list of (lat, lon)
    coords2 = route2["coordinates"]
    coords = coords1 + coords2[1:]  # avoid duplicating pickup if latlon_pickup is in both

    fueling_stops = []
    total_dist = 0.0
    next_boundary = 1000.0
    for i in range(len(coords) - 1):
        (lat1, lon1) = coords[i]
        (lat2, lon2) = coords[i+1]
        seg_dist = haversine_miles(lat1, lon1, lat2, lon2)
        # walk along this segment
        start_dist = total_dist
        end_dist = total_dist + seg_dist
        # check if we cross a boundary (1000, 2000, 3000, etc.)
        while next_boundary >= start_dist and next_boundary <= end_dist:
            # find ratio to place fueling stop
            ratio = (next_boundary - start_dist) / seg_dist
            # lat/lon fueling stop
            fueling_lat = lat1 + ratio * (lat2 - lat1)
            fueling_lon = lon1 + ratio * (lon2 - lon1)
            fueling_stops.append((fueling_lat, fueling_lon))
            next_boundary += 1000.0
        total_dist = end_dist
    return fueling_stops
