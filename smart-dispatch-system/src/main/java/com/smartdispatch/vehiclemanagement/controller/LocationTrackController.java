package com.smartdispatch.vehiclemanagement.controller;
import com.smartdispatch.vehiclemanagement.model.LocationVehicle;
import com.smartdispatch.vehiclemanagement.service.LocationTrackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.SQLException;

@RestController
@RequestMapping("/api/location")
public class LocationTrackController {

    @Autowired
    private LocationTrackService service;


    @GetMapping("/newest/{carId}")
    public ResponseEntity<LocationVehicle> getNewestLocation(@PathVariable Long carId) throws SQLException {
        try{    LocationVehicle locationVehicle=service.getNewestLocation(carId);
           if (locationVehicle!=null)
            return ResponseEntity.ok(locationVehicle);
         else {
            return ResponseEntity.notFound().build();
        }
        }
        catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
}
}