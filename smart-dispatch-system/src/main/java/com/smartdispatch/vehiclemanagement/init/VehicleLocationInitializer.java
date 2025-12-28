package com.smartdispatch.vehiclemanagement.init;

import jakarta.annotation.PostConstruct;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import lombok.RequiredArgsConstructor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import com.smartdispatch.dao.ILocationDao;
import com.smartdispatch.vehiclemanagement.Dto.VehicleLiveLocationDto;

@Component
@RequiredArgsConstructor
public class VehicleLocationInitializer {

    private static final Logger logger = LoggerFactory.getLogger(VehicleLocationInitializer.class);

    private final RedisTemplate<String, String> redisTemplate;
    private final ILocationDao locationDao;

    public static final String VEHICLE_LOCATIONS_KEY = "vehicles:locations";

    @PostConstruct
    public void loadVehicleLocations() {
        List<VehicleLiveLocationDto> vehicles = locationDao.findAllLiveLocations();

        Map<String, String> map = new HashMap<>(vehicles.size());

        for (VehicleLiveLocationDto v : vehicles) {
            map.put(
                    v.getVehicleId().toString(),
                    v.getLongitude() + "," + v.getLatitude());
        }

        redisTemplate.opsForHash().putAll(VEHICLE_LOCATIONS_KEY, map);

        logger.info("Loaded {} vehicles into Redis", vehicles.size());
    }
}
