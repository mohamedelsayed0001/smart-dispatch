package com.smartdispatch.dispatcher.daos;

import com.smartdispatch.admin.dto.VehicleTypeCount;
import com.smartdispatch.dispatcher.domains.entities.Vehicle;

import java.util.List;

public interface VehicleDao {
    List<Vehicle> findAvailableVehiclesByType(String type);
    List<Vehicle> findAvailableVehicles();
    List<Vehicle> findAllVehicles();
    boolean updateStatus(Integer vehicleId, String status);
    Vehicle findById(Integer id);
    List<VehicleTypeCount> findCountOfVehiclesByType();
    Vehicle findClosestAvailableVehicle(String type, double latitude, double longitude);
}
