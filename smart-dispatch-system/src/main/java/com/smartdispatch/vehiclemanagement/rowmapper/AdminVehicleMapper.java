package com.smartdispatch.vehiclemanagement.rowmapper;

import com.smartdispatch.vehiclemanagement.Enum.Status;
import com.smartdispatch.vehiclemanagement.Enum.Type;
import com.smartdispatch.vehiclemanagement.model.VehicleEntity;

import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Component;

import java.sql.ResultSet;
import java.sql.SQLException;
@Component

public class AdminVehicleMapper implements RowMapper<VehicleEntity>{

@Override
    public VehicleEntity mapRow(ResultSet rs, int rowNum) throws SQLException {
    VehicleEntity vehicle = new VehicleEntity();

    vehicle.setId(rs.getLong("id"));

    String typeStr = rs.getString("type");
    vehicle.setType(Type.valueOf(typeStr));

    // Map ENUM status - handle as String from database
    String statusStr = rs.getString("status");
    vehicle.setStatus(Status.valueOf(statusStr));


    vehicle.setCapacity(rs.getInt("capacity"));
    vehicle.setOperatorId(rs.getLong("operator_id"));

    return vehicle;
}

}