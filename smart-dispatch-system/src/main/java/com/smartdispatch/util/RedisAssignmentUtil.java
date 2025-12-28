package com.smartdispatch.util;

import com.smartdispatch.dao.IIncidentDao;
import com.smartdispatch.dao.IVehicleDao;
import com.smartdispatch.model.Incident;
import com.smartdispatch.model.Vehicle;
import com.smartdispatch.model.enums.IncidentType;
import com.smartdispatch.model.enums.VehicleType;
import com.smartdispatch.vehiclemanagement.init.VehicleLocationInitializer;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class RedisAssignmentUtil {

  private final RedisTemplate<String, String> redisTemplate;
  private final IVehicleDao vehicleDao;
  private final IIncidentDao incidentDao;

  public Vehicle findClosestAvailableVehicleFromRedis(VehicleType type, double incidentLat, double incidentLon) {
    // Get all available vehicles of the specified type from database
    List<Vehicle> availableVehicles = vehicleDao.findAvailableVehiclesByType(type);
    
    if (availableVehicles.isEmpty()) {
      return null;
    }

    Vehicle closestVehicle = null;
    double closestDistance = Double.MAX_VALUE;

    // For each available vehicle, get its location from Redis and calculate distance
    for (Vehicle vehicle : availableVehicles) {
      LocationCoordinates coords = getVehicleLocationFromRedis(vehicle.getId());
      
      if (coords != null) {
        double distance = calculateHaversineDistance(
            incidentLat, incidentLon,
            coords.getLatitude(), coords.getLongitude()
        );
        
        if (distance < closestDistance) {
          closestDistance = distance;
          closestVehicle = vehicle;
        }
      }
    }

    return closestVehicle;
  }

  public Incident findClosestPendingIncidentFromDatabase(IncidentType type, double vehicleLat, double vehicleLon) {
    // Get all pending incidents of the specified type from database
    List<Incident> pendingIncidents = incidentDao.getAllPendingIncidentsOfType(type);
    
    if (pendingIncidents.isEmpty()) {
      return null;
    }

    Incident closestIncident = null;
    double closestDistance = Double.MAX_VALUE;

    // Calculate distance for each incident
    for (Incident incident : pendingIncidents) {
      double distance = calculateHaversineDistance(
          vehicleLat, vehicleLon,
          incident.getLatitude(), incident.getLongitude()
      );
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIncident = incident;
      }
    }

    return closestIncident;
  }

  public LocationCoordinates getVehicleLocationFromRedis(Long vehicleId) {
    if (vehicleId == null) {
      return null;
    }

    String redisLocation = (String) redisTemplate.opsForHash().get(
        VehicleLocationInitializer.VEHICLE_LOCATIONS_KEY,
        vehicleId.toString()
    );

    if (redisLocation != null && redisLocation.contains(",")) {
      String[] coords = redisLocation.split(",");
      try {
        Double longitude = Double.parseDouble(coords[0]);
        Double latitude = Double.parseDouble(coords[1]);
        return new LocationCoordinates(latitude, longitude);
      } catch (NumberFormatException e) {
        return null;
      }
    }

    return null;
  }

  private double calculateHaversineDistance(double lat1, double lon1, double lat2, double lon2) {
    final double EARTH_RADIUS_KM = 6371.0;

    double dLat = Math.toRadians(lat2 - lat1);
    double dLon = Math.toRadians(lon2 - lon1);

    double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

    double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return EARTH_RADIUS_KM * c;
  }
}
