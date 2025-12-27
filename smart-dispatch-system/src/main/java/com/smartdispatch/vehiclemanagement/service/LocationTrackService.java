package com.smartdispatch.vehiclemanagement.service;

import com.smartdispatch.vehiclemanagement.init.VehicleLocationInitializer;
import com.smartdispatch.dao.ILocationDao;
import com.smartdispatch.vehiclemanagement.Dto.VehicleLiveLocationDto;
import com.smartdispatch.model.VehicleLocation;

import lombok.RequiredArgsConstructor;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class LocationTrackService {

    private final ILocationDao locationDao;
    private final RedisTemplate<String, String> redisTemplate;

    public VehicleLocation getNewestLocation(Long id) throws SQLException {
        return locationDao.findNewestByVehicleId(id);
    }

    public Map<String, String> getAllLiveLocations() {
        Map<Object, Object> entries = redisTemplate.opsForHash()
                .entries(VehicleLocationInitializer.VEHICLE_LOCATIONS_KEY);

        Map<String, String> liveLocations = new java.util.HashMap<>();

        for (var entry : entries.entrySet()) {
            String vehicleId = entry.getKey().toString();
            String coordinates = entry.getValue().toString();
            liveLocations.put(vehicleId, coordinates);
        }

        return liveLocations;
    }

    @Scheduled(fixedRate = 5000000) // Reduced rate for demo/sanity or keep original
    public void saveLiveLocations() {

        Map<Object, Object> entries = redisTemplate.opsForHash()
                .entries(VehicleLocationInitializer.VEHICLE_LOCATIONS_KEY);

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
                            .build());
        }

        locationDao.saveBatch(locations);
    }
}