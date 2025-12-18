package com.smartdispatch.vehiclemanagement.Dao;

import com.smartdispatch.vehiclemanagement.model.LocationVehicle;
import com.smartdispatch.vehiclemanagement.rowmapper.LocationRowMapper;

import lombok.RequiredArgsConstructor;

import com.smartdispatch.vehiclemanagement.Dto.VehicleLiveLocationDto;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class LocationDao {

    private final JdbcTemplate jdbcTemplate;

    public List<VehicleLiveLocationDto> findAllLiveLocations() {
        String sql = """
            SELECT
                vehicle_id AS vehicleId,
                latitude,
                longitude
            FROM (
                SELECT
                    vehicle_id,
                    latitude,
                    longitude,
                    ROW_NUMBER() OVER (
                        PARTITION BY vehicle_id
                        ORDER BY time_stamp DESC
                    ) AS rn
                FROM vehicle_location
            ) t
            WHERE rn = 1
        """;

        return jdbcTemplate.query(sql, (rs, rowNum) ->
            VehicleLiveLocationDto.builder()
                .vehicleId(rs.getInt("vehicleId"))
                .latitude(rs.getDouble("latitude"))
                .longitude(rs.getDouble("longitude"))
                .build()
        );
    }

    public void saveBatch(List<VehicleLiveLocationDto> locations) {

        String sql = """
            INSERT INTO vehicle_location (vehicle_id, latitude, longitude, time_stamp)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        """;

        if (locations == null) {
            System.out.println("Didn't save live locations because locations is null");
            return;
        }

        jdbcTemplate.<VehicleLiveLocationDto>batchUpdate(
            sql,
            locations,
            1000,
            (ps, location) -> {
                ps.setInt(1, location.getVehicleId());
                ps.setDouble(2, location.getLatitude());
                ps.setDouble(3, location.getLongitude());
            }
        );
    }

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