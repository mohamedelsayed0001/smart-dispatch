package com.smartdispatch.vehiclemanagement.service;

import com.smartdispatch.vehiclemanagement.Dao.LocationDao;
import com.smartdispatch.vehiclemanagement.model.LocationVehicle;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.sql.SQLException;
import java.util.List;

@Service
public class LocationTrackService {

    @Autowired
    private LocationDao locationDao;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public LocationVehicle getNewestLocation(Long id) throws SQLException {
        return locationDao.findNewestByVehicleId(id);
    }

    @Scheduled(fixedRate = 2000)
    public void monitorAndBroadcastNewLocations() {
        try {
            List<Long> carIds = locationDao.findAllDistinctCarIds();

            if (carIds == null || carIds.isEmpty()) {
                System.out.println("⚠️ No vehicles found in database");
                return;
            }

            System.out.println("📡 Broadcasting locations for " + carIds.size() + " vehicles");

            for (Long carId : carIds) {
                try {
                    detectAndBroadcastNewLocation(carId);
                } catch (Exception e) {
                    System.err.println("❌ Error processing vehicle " + carId + ": " + e.getMessage());
                }
            }

        } catch (Exception e) {
            System.err.println("❌ Error monitoring locations: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void detectAndBroadcastNewLocation(Long vehicleId) throws SQLException {
        LocationVehicle newest = locationDao.findNewestByVehicleId(vehicleId);

        if (newest != null) {
            broadcastLocation(newest);
        } else {
            System.out.println("⚠️ No location data for vehicle: " + vehicleId);
        }
    }

    private void broadcastLocation(LocationVehicle location) {
        try {
            // Broadcast to specific vehicle topic
            messagingTemplate.convertAndSend(
                    "/topic/location/" + location.getVehicle_id(),
                    location
            );

            // Broadcast to all vehicles topic
            messagingTemplate.convertAndSend("/topic/locations/all", location);


                    } catch (Exception e) {
            System.err.println("❌ Error broadcasting location: " + e.getMessage());
            e.printStackTrace();
        }
    }
}