package com.smartdispatch.mapper;

import com.smartdispatch.model.VehicleLocation;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Component;

import java.sql.ResultSet;
import java.sql.SQLException;

@Component
public class LocationRowMapper implements RowMapper<VehicleLocation> {

  @Override
  public VehicleLocation mapRow(ResultSet rs, int rowNum) throws SQLException {
    VehicleLocation location = new VehicleLocation();
    location.setId(rs.getLong("id"));
    location.setVehicleId(rs.getLong("vehicle_id"));
    location.setLatitude(rs.getDouble("latitude"));
    location.setLongitude(rs.getDouble("longitude"));
    if (rs.getTimestamp("time_stamp") != null) {
      location.setTimeStamp(rs.getTimestamp("time_stamp").toLocalDateTime());
    }
    return location;
  }
}
