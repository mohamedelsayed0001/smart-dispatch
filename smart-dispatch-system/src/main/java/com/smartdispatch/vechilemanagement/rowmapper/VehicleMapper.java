package com.smartdispatch.vechilemanagement.rowmapper;

import com.smartdispatch.vechilemanagement.model.vehicleEntity;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Component;

import java.sql.ResultSet;
import java.sql.SQLException;
@Component

public class VehicleMapper implements RowMapper<vehicleEntity>{

@Override
    public vehicleEntity mapRow(ResultSet rs, int rowNum) throws SQLException {
    vehicleEntity vehicle = new vehicleEntity();

    vehicle.setId(rs.getLong("id"));
    vehicle.set(rs.getString("type"));
    vehicle.setDescription(rs.getString("status"));
    vehicle.setImageData(rs.getBytes("capacity"));
    vehicle.setImageName(rs.getString("operator_id"));
    return vehicle;
    }

}