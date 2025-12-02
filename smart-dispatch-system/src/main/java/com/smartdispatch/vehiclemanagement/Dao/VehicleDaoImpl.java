package com.smartdispatch.vehiclemanagement.Dao;

import com.smartdispatch.vehiclemanagement.Interface.vechileDao;
import com.smartdispatch.vehiclemanagement.model.VehicleEntity;
import com.smartdispatch.vehiclemanagement.rowmapper.VehicleMapper;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.sql.SQLException;
import java.util.List;
@Component
public class VehicleDaoImpl implements vechileDao<VehicleEntity> {


        private final JdbcTemplate jdbcTemplate;

        public VehicleDaoImpl(JdbcTemplate jdbcTemplate) {
            this.jdbcTemplate = jdbcTemplate;

        }
        @Override
        public void save(VehicleEntity vehicle) throws SQLException {
            try {
                String sql = "INSERT INTO vehicle(type, status, capacity, operator_id) " +
                        "VALUES (?, ?, ?, ?)";

                jdbcTemplate.update(
                        sql,
                        vehicle.getType().name(),
                        vehicle.getStatus().name(),
                        vehicle.getCapacity(),
                        vehicle.getOperatorId()
                );
            } catch (DataAccessException e) {
                throw new SQLException("Failed to create vehicle: " + e.getMessage(), e);
            }
        }

        @Override
        public void delete(long id) throws SQLException {
            try {
                String sql = "DELETE FROM vehicle WHERE id = ?";
                int rowsAffected = jdbcTemplate.update(sql, id);

                if (rowsAffected == 0) {
                    throw new SQLException("vehicle with ID " + id + " not found");
                }
            } catch (DataAccessException e) {
                if (e.getMessage() != null &&
                        (e.getMessage().contains("foreign key") ||
                                e.getMessage().contains("constraint"))) {
                    throw new SQLException(
                            "Cannot delete vehicle - it has an assigned incident", e);
                }
                throw new SQLException("Failed to delete vehicle: " + e.getMessage(), e);
            }
        }

    @Override
    public void update(long id, VehicleEntity vehicle) throws SQLException {
        try {
            String sql = "UPDATE vehicle SET type = ?, status = ?, " +
                    "capacity = ?, operator_id = ? WHERE id = ?";

            int rowsAffected = jdbcTemplate.update(
                    sql,
                    vehicle.getType().name(),
                    vehicle.getStatus().name(),
                    vehicle.getCapacity(),
                    vehicle.getOperatorId(),
                    id
            );

            if (rowsAffected == 0) {
                throw new SQLException("vehicle with ID " + id + " not found");
            }
        } catch (DataAccessException e) {
            throw new SQLException("Failed to update vehicle: " + e.getMessage(), e);
        }
    }

    @Override
    public VehicleEntity get(long id) throws SQLException {
        try {
            String sql = "SELECT id, type, status, capacity, operator_id " +
                    "FROM vehicle WHERE id = ?";
            return jdbcTemplate.queryForObject(sql, new VehicleMapper(), id);
        } catch (EmptyResultDataAccessException e) {
            return null;
        } catch (DataAccessException e) {
            throw new SQLException("Failed to fetch vehicle: " + e.getMessage(), e);
        }
    }

        @Override
        public List<VehicleEntity> getAll() throws SQLException {
            try {
                String sql = "SELECT id, type, status, capacity, operator_id " +
                        "FROM vehicle";
                return jdbcTemplate.query(sql, new VehicleMapper());
            } catch (DataAccessException e) {
                throw new SQLException("Failed to fetch vehicles: " + e.getMessage(), e);
            }
        }

//        @Override
//        public int countCompletedTasksByServiceId(Long serviceID) throws Exception {
//            try {
//                String sql = "SELECT COUNT(*) FROM Task WHERE serviceID = ? AND status = 'done'";
//                Integer count = jdbcTemplate.queryForObject(sql, Integer.class, serviceID);
//                return count != null ? count : 0;
//            } catch (DataAccessException e) {
//                throw new Exception("Failed to count completed tasks: " + e.getMessage(), e);
//            }
//        }
//
//        @Override
//        public int countTasker(long serviceID) throws Exception {
//            try {
//                String sql = "SELECT COUNT(*) FROM Tasker WHERE serviceID = ?";
//                Integer count = jdbcTemplate.queryForObject(sql, Integer.class, serviceID);
//                return count != null ? count : 0;
//            } catch (DataAccessException e) {
//                throw new Exception("Failed to count taskers: " + e.getMessage(), e);
//            }
//        }
//
//        public Long findIdByName(String name) throws Exception {
//            try {
//                String sql = "SELECT serviceID FROM service WHERE name = ?";
//                return jdbcTemplate.queryForObject(sql, Long.class, name);
//            } catch (EmptyResultDataAccessException e) {
//                return null;
//            } catch (DataAccessException e) {
//                throw new Exception("Failed to find service by name: " + e.getMessage(), e);
//            }
//        }
//
        public VehicleEntity findById(long id) throws Exception {
            try {
                String sql = "SELECT id, type, status, capacity, operator_id " +
                        "FROM vehicle WHERE id = ?";
                return jdbcTemplate.queryForObject(sql, new VehicleMapper(), id);
            } catch (EmptyResultDataAccessException e) {
                return null;
            } catch (DataAccessException e) {
                throw new Exception("Failed to find service by ID: " + e.getMessage(), e);
            }
        }

    public int isVehicleInUse(long id) {
        try {
            String sql = "SELECT COUNT(*) FROM Assignment WHERE vehicle_id = ? AND status = 'active'";
            Integer count = jdbcTemplate.queryForObject(sql, Integer.class, id);
            return count != null ? count : 0;
        } catch (DataAccessException e) {
            return 0;
        }
    }

    public boolean isopertorCorrect(Long operatorId) {
       String sql="SELECT COUNT(*) FROM operator WHERE id = ?";
       int num=jdbcTemplate.queryForObject(sql,Integer.class,operatorId);
      if(num>0)
            return true;
      return false;
        }
}

