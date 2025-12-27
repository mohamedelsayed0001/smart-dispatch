package com.smartdispatch.mapper;

import com.smartdispatch.model.Vehicle;
import com.smartdispatch.model.enums.VehicleStatus;
import com.smartdispatch.model.enums.VehicleType;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Component;

import java.sql.ResultSet;
import java.sql.SQLException;

@Component
public class VehicleRowMapper implements RowMapper<Vehicle> {

  @Override
  public Vehicle mapRow(ResultSet rs, int rowNum) throws SQLException {
    Vehicle vehicle = new Vehicle();
    vehicle.setId(rs.getLong("id"));
    vehicle.setType(VehicleType.valueOf(rs.getString("type")));
    vehicle.setStatus(VehicleStatus.valueOf(rs.getString("status")));
    vehicle.setCapacity(rs.getInt("capacity"));
    vehicle.setOperatorId(rs.getLong("operator_id"));
    return vehicle;
  }
}
