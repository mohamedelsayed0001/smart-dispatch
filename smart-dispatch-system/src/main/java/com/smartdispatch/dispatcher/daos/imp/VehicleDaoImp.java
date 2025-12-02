package com.smartdispatch.dispatcher.daos.imp;

import com.smartdispatch.dispatcher.daos.VehicleDao;
import com.smartdispatch.dispatcher.domains.entities.Incident;
import com.smartdispatch.dispatcher.domains.entities.Vehicle;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
@Repository
public class VehicleDaoImp implements VehicleDao {
    private final JdbcTemplate jdbcTemplate;
    private static final RowMapper<Vehicle> VEHICLE_ROW_MAPPER = new RowMapperVehicle();

    public VehicleDaoImp(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public List<Vehicle> findAvailableVehiclesByType(String type) {
        String sql = "SELECT v.*, " +
                "(SELECT latitude FROM vehicle_location vl WHERE vl.vehicle_id = v.id ORDER BY time_stamp DESC LIMIT 1) AS currentLatitude, " +
                "(SELECT longitude FROM vehicle_location vl WHERE vl.vehicle_id = v.id ORDER BY time_stamp DESC LIMIT 1) AS currentLongitude " +
                "FROM Vehicle v WHERE status ='AVAILABLE' AND type = ?";
        return jdbcTemplate.query(sql,VEHICLE_ROW_MAPPER,type);
    }

    @Override
    public List<Vehicle> findAvailableVehicles() {
        String sql = "SELECT v.*, " +
                "(SELECT latitude FROM vehicle_location vl WHERE vl.vehicle_id = v.id ORDER BY time_stamp DESC LIMIT 1) AS currentLatitude, " +
                "(SELECT longitude FROM vehicle_location vl WHERE vl.vehicle_id = v.id ORDER BY time_stamp DESC LIMIT 1) AS currentLongitude " +
                "FROM Vehicle v WHERE status ='Available'";
        return jdbcTemplate.query(sql,VEHICLE_ROW_MAPPER);
    }

    @Override
    public List<Vehicle> findAllVehicles() {
        String sql = "SELECT v.*, " +
                "(SELECT latitude FROM vehicle_location vl WHERE vl.vehicle_id = v.id ORDER BY time_stamp DESC LIMIT 1) AS currentLatitude, " +
                "(SELECT longitude FROM vehicle_location vl WHERE vl.vehicle_id = v.id ORDER BY time_stamp DESC LIMIT 1) AS currentLongitude " +
                "FROM Vehicle v";
        return jdbcTemplate.query(sql,VEHICLE_ROW_MAPPER);
    }

    @Override
    public boolean updateStatus(Integer vehicleId, String status) {
        String sql = "UPDATE Vehicle SET status = ? WHERE id = ?";
        int rowsAffected = jdbcTemplate.update(sql, status, vehicleId);
        return rowsAffected > 0;
    }


    @Override
    public Vehicle findById(Integer id) {
        String sql = "SELECT * FROM Vehicle WHERE id = ?";
        List<Vehicle> results = jdbcTemplate.query(sql, VEHICLE_ROW_MAPPER, id);
        return results.isEmpty() ? null : results.get(0);
    }



    private static class RowMapperVehicle implements RowMapper<Vehicle> {

        @Override
        public Vehicle mapRow(ResultSet rs, int rowNum) throws SQLException {
            Vehicle vehicle = new Vehicle();
            vehicle.setId(rs.getInt("id"));
            vehicle.setType(rs.getString("type"));
            vehicle.setStatus(rs.getString("status"));
            vehicle.setCapacity(rs.getInt("capacity"));
            vehicle.setOperatorId(rs.getInt("operator_id"));
            // map last known location if available
            try {
                double lat = rs.getDouble("currentLatitude");
                if (!rs.wasNull()) vehicle.setCurrentLatitude(lat);
            } catch (SQLException ignored) {}
            try {
                double lon = rs.getDouble("currentLongitude");
                if (!rs.wasNull()) vehicle.setCurrentLongitude(lon);
            } catch (SQLException ignored) {}
            return vehicle;
        }
    }
}
