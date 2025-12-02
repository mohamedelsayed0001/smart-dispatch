package com.smartdispatch.vehiclemanagement.Interface;

import com.smartdispatch.vehiclemanagement.model.LocationVehicle;
import org.springframework.stereotype.Component;

import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.List;

public interface ILocationDao <L>{

    LocationVehicle findNewestByVehicleId(Long id) throws SQLException;

    List<Long> findAllDistinctCarIds() throws SQLException;

}
