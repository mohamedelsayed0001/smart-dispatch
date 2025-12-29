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

  public Vehicle findClosestAvailableVehicleFromRedis(VehicleType type, Incident incident) {
    List<Vehicle> availableVehicles = vehicleDao.findAvailableVehiclesByType(type);
    
    if (availableVehicles.isEmpty()) {
      return null;
    }

    Vehicle bestVehicle = null;
    double lowestPriorityScore = Double.MAX_VALUE;

    for (Vehicle vehicle : availableVehicles) {
      LocationCoordinates coords = getVehicleLocationFromRedis(vehicle.getId());
      
      if (coords != null) {
        double priorityScore = calculatePriorityScore(
            incident, coords.getLatitude(), coords.getLongitude()
        );
        
        if (priorityScore < lowestPriorityScore) {
          lowestPriorityScore = priorityScore;
          bestVehicle = vehicle;
        }
      }
    }

    return bestVehicle;
  }

  public Incident findClosestPendingIncidentFromDatabase(IncidentType type, double vehicleLat, double vehicleLon) {
    List<Incident> pendingIncidents = incidentDao.getAllPendingIncidentsOfType(type);
    
    if (pendingIncidents.isEmpty()) {
      return null;
    }

    Incident bestIncident = null;
    double lowestPriorityScore = Double.MAX_VALUE;

    for (Incident incident : pendingIncidents) {
      double priorityScore = calculatePriorityScore(
          incident, vehicleLat, vehicleLon
      );
      
      if (priorityScore < lowestPriorityScore) {
        lowestPriorityScore = priorityScore;
        bestIncident = incident;
      }
    }

    return bestIncident;
  }

  private double calculatePriorityScore(Incident incident, double vehicleLat, double vehicleLon) {
    double levelWeight = switch (incident.getLevel()) {
      case HIGH -> 0;
      case MEDIUM -> 50;
      case LOW -> 100;
    };

    double latDiff = incident.getLatitude() - vehicleLat;
    double lonDiff = incident.getLongitude() - vehicleLon;
    double squaredDistance = (latDiff * latDiff) + (lonDiff * lonDiff);

    long waitingMinutes = 0;
    if (incident.getTimeReported() != null) {
      waitingMinutes = java.time.Duration.between(
          incident.getTimeReported(), 
          java.time.LocalDateTime.now()
      ).toMinutes();
    }

    return levelWeight + (10 * squaredDistance) - (2 * waitingMinutes);
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
}
