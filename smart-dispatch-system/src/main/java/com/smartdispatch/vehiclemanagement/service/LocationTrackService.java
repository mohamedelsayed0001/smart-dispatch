package com.smartdispatch.vehiclemanagement.service;

import com.smartdispatch.vehiclemanagement.init.VehicleLocationInitializer;

import com.smartdispatch.vehiclemanagement.Dao.LocationDao;
import com.smartdispatch.vehiclemanagement.Dto.VehicleLiveLocationDto;
import com.smartdispatch.vehiclemanagement.model.LocationVehicle;

import lombok.RequiredArgsConstructor;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class LocationTrackService {

    private final LocationDao locationDao;
    private final SimpMessagingTemplate messagingTemplate;
    private final RedisTemplate<String, String> redisTemplate;

    public LocationVehicle getNewestLocation(Long id) throws SQLException {
        return locationDao.findNewestByVehicleId(id);
    }

    public Map<String, String> getAllLiveLocations() {
        Map<Object, Object> entries = 
                redisTemplate.opsForHash().entries(VehicleLocationInitializer.VEHICLE_LOCATIONS_KEY);
        
        Map<String, String> liveLocations = new java.util.HashMap<>();
        
        for (var entry : entries.entrySet()) {
            String vehicleId = entry.getKey().toString();
            String coordinates = entry.getValue().toString();
            liveLocations.put(vehicleId, coordinates);
        }
        
        return liveLocations;
    }

    // TODO optimize by saving only dirty locations
    @Scheduled(fixedRate = 500000000)
    public void saveLiveLocations() {

        Map<Object, Object> entries =
                redisTemplate.opsForHash().entries(VehicleLocationInitializer.VEHICLE_LOCATIONS_KEY);

        if (entries.isEmpty()) {
            return;
        }

        List<VehicleLiveLocationDto> locations = new ArrayList<>(entries.size());

        for (var entry : entries.entrySet()) {
            Integer vehicleId = Integer.valueOf(entry.getKey().toString());
            String[] coords = entry.getValue().toString().split(",");

            locations.add(
                VehicleLiveLocationDto.builder()
                    .vehicleId(vehicleId)
                    .latitude(Double.parseDouble(coords[1]))
                    .longitude(Double.parseDouble(coords[0]))
                    .build()
            );
        }

        locationDao.saveBatch(locations);
    }

    // @Scheduled(fixedRate = 2000)
    // public void monitorAndBroadcastNewLocations() {
    //     try {
    //         List<Long> carIds = locationDao.findAllDistinctCarIds();

    //         if (carIds == null || carIds.isEmpty()) {
    //             System.out.println("⚠️ No vehicles found in database");
    //             return;
    //         }

    //         // System.out.println("📡 Broadcasting locations for " + carIds.size() + " vehicles");

    //         for (Long carId : carIds) {
    //             try {
    //                 detectAndBroadcastNewLocation(carId);
    //             } catch (Exception e) {
    //                 System.err.println("❌ Error processing vehicle " + carId + ": " + e.getMessage());
    //             }
    //         }

    //     } catch (Exception e) {
    //         System.err.println("❌ Error monitoring locations: " + e.getMessage());
    //         e.printStackTrace();
    //     }
    // }

    // private void detectAndBroadcastNewLocation(Long vehicleId) throws SQLException {
    //     LocationVehicle newest = locationDao.findNewestByVehicleId(vehicleId);

    //     if (newest != null) {
    //         broadcastLocation(newest);
    //     } else {
    //         System.out.println("⚠️ No location data for vehicle: " + vehicleId);
    //     }
    // }

    // private void broadcastLocation(LocationVehicle location) {
    //     try {
    //         // Broadcast to specific vehicle topic
    //         messagingTemplate.convertAndSend(
    //                 "/topic/location/" + location.getVehicle_id(),
    //                 location
    //         );

    //         // Broadcast to all vehicles topic
    //         messagingTemplate.convertAndSend("/topic/locations/all", location);


    //                 } catch (Exception e) {
    //         // System.err.println("❌ Error broadcasting location: " + e.getMessage());
    //         e.printStackTrace();
    //     }
    // }
}