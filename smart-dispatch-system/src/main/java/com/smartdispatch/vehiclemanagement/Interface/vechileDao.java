package com.smartdispatch.vehiclemanagement.Interface;

import com.smartdispatch.vehiclemanagement.model.VehicleEntity;

import java.sql.SQLException;
import java.util.List;

public interface vechileDao<v> {
    void save(VehicleEntity v) throws SQLException;

    void delete(long id) throws SQLException;

    void update(long id, VehicleEntity v) throws SQLException;

    VehicleEntity get(long id) throws SQLException;

    List<VehicleEntity> getAll() throws SQLException;
}
