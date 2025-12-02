package com.smartdispatch.dispatcher.daos;

import com.smartdispatch.dispatcher.domains.entities.Vehicle;

import java.util.List;

public interface VehicleDao {
    List<Vehicle> findAvailableVehiclesByType(String type);
    List<Vehicle> findAvailableVehicles();
    List<Vehicle> findAllVehicles();
    boolean updateStatus(Integer vehicleId, String status);
    Vehicle findById(Integer id);
}
