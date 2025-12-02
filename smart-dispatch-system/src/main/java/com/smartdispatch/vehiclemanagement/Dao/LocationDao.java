package com.smartdispatch.vehiclemanagement.Dao;

import com.smartdispatch.vehiclemanagement.model.LocationVehicle;
import com.smartdispatch.vehiclemanagement.rowmapper.LocationRowMapper;
import com.smartdispatch.vehiclemanagement.Interface.ILocationDao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@Component
public class LocationDao implements ILocationDao {

    private final JdbcTemplate jdbcTemplate;

    @Autowired
    public LocationDao(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
        System.out.println("✅ LocationDao initialized with JdbcTemplate: " + (jdbcTemplate != null));
    }

    @Override
    public LocationVehicle findNewestByVehicleId(Long vehicleId) throws SQLException {
        if (jdbcTemplate == null) {
            System.err.println("❌ JdbcTemplate is NULL in findNewestByVehicleId!");
            throw new SQLException("JdbcTemplate not initialized");
        }

        try {
            String sql = "SELECT * FROM vehicle_location WHERE vehicle_id = ? ORDER BY time_stamp DESC LIMIT 1";

            LocationVehicle locationVehicle = jdbcTemplate.queryForObject(
                    sql,
                    new LocationRowMapper(),
                    vehicleId
            );

            return locationVehicle;

        } catch (EmptyResultDataAccessException e) {
            System.out.println("⚠️ No location found for vehicle_id: " + vehicleId);
            return null;
        } catch (Exception e) {
            System.err.println("❌ Error finding location for vehicle " + vehicleId + ": " + e.getMessage());

            throw new SQLException("Error retrieving location for vehicle " + vehicleId, e);
        }
    }

    @Override
    public List<Long> findAllDistinctCarIds() throws SQLException {
        if (jdbcTemplate == null) {
            System.err.println("❌ JdbcTemplate is NULL in findAllDistinctCarIds!");
            throw new SQLException("JdbcTemplate not initialized");
        }

        try {
            String sql = "SELECT DISTINCT vehicle_id FROM vehicle_location ORDER BY vehicle_id";
            List<Long> list = jdbcTemplate.queryForList(sql, Long.class);

            return list;

        } catch (EmptyResultDataAccessException e) {
            System.out.println("⚠️ No vehicles found in database");
            return new ArrayList<>();
        } catch (Exception e) {
            System.err.println("❌ Error finding distinct car IDs: " + e.getMessage());

            throw new SQLException("Error retrieving distinct car IDs", e);
        }
    }
}