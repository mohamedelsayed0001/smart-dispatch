package com.smartdispatch.vechilemanagement.Interface;

import com.smartdispatch.vechilemanagement.model.vehicleEntity;

import java.sql.SQLException;
import java.util.List;

public interface vechileDao<v> {
    void save(vehicleEntity vehicle) throws SQLException;

    void delete(long id) throws SQLException;

    void update(long id, vehicleEntity vehicle) throws SQLException;

    vehicleEntity get(long id) throws SQLException;

    List<vehicleEntity> getAll() throws SQLException;
}
