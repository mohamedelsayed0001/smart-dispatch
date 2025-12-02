package com.smartdispatch.vehiclemanagement.rowmapper;

import com.smartdispatch.vehiclemanagement.model.LocationVehicle;


import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Component;

import java.sql.ResultSet;
import java.sql.SQLException;
@Component
public class LocationRowMapper implements RowMapper<LocationVehicle> {

    @Override
    public LocationVehicle mapRow(ResultSet rs, int rowNum) throws SQLException {

        LocationVehicle locationVehicle = new LocationVehicle();

        locationVehicle.setId(rs.getLong("id"));
        locationVehicle.setVehicle_id(rs.getLong("vehicle_id"));
        locationVehicle.setLongitude(rs.getDouble("longitude"));
        locationVehicle.setLatitude(rs.getDouble("latitude"));
        locationVehicle.setTime_stamp(rs.getTimestamp("time_stamp"));
        return locationVehicle;
    }
}
