package com.smartdispatch.vehiclemanagement.rowmapper;

import com.smartdispatch.vehiclemanagement.Status;
import com.smartdispatch.vehiclemanagement.model.VehicleEntity;

import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Component;

import java.sql.ResultSet;
import java.sql.SQLException;
@Component

public class VehicleMapper implements RowMapper<VehicleEntity>{

@Override
    public VehicleEntity mapRow(ResultSet rs, int rowNum) throws SQLException {
    VehicleEntity vehicle = new VehicleEntity();

    vehicle.setId(rs.getLong("id"));
    vehicle.setType(rs.getString("type"));

    String statusStr = rs.getString("status");
    if (statusStr != null) {
        vehicle.setStatus(Status.valueOf(statusStr));
    }

    vehicle.setCapacity(rs.getInt("capacity"));
    vehicle.setOperatorId(rs.getLong("operator_id"));

    return vehicle;
}

}