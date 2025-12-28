package com.smartdispatch.util;

import com.smartdispatch.vehiclemanagement.init.VehicleLocationInitializer;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RedisLocationUtil {

  private final RedisTemplate<String, String> redisTemplate;

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

  public void updateVehicleLocationInRedis(Long vehicleId, Double latitude, Double longitude) {
    if (vehicleId == null || latitude == null || longitude == null) {
      return;
    }

    redisTemplate.opsForHash().put(
        VehicleLocationInitializer.VEHICLE_LOCATIONS_KEY,
        vehicleId.toString(),
        longitude + "," + latitude);
  }
}
