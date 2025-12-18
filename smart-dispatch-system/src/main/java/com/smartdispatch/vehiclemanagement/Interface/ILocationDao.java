package com.smartdispatch.vehiclemanagement.Interface;

import com.smartdispatch.vehiclemanagement.model.LocationVehicle;

import java.sql.SQLException;
import java.util.List;

public interface ILocationDao <L>{

    LocationVehicle findNewestByVehicleId(Long id) throws SQLException;

    List<Long> findAllDistinctCarIds() throws SQLException;

}
