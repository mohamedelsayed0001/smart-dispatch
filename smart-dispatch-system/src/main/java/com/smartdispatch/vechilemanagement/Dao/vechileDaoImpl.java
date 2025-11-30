package com.smartdispatch.vechilemanagement.Dao;

import com.smartdispatch.vechilemanagement.Interface.vechileDao;
import com.smartdispatch.vechilemanagement.model.vehicleEntity;
import com.smartdispatch.vechilemanagement.rowmapper.VehicleMapper;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;

import java.sql.SQLException;
import java.util.List;

public class vechileDaoImpl implements vechileDao<vehicleEntity> {


        private final JdbcTemplate jdbcTemplate;

        public vechileDaoImpl(JdbcTemplate jdbcTemplate) {
            this.jdbcTemplate = jdbcTemplate;

        }
        @Override
        public void save(vehicleEntity vehicle) throws SQLException {
            try {
                String sql = "INSERT INTO vehicle(type, status, capacity, operator_id) " +
                        "VALUES (?, ?, ?, ?)";

                jdbcTemplate.update(
                        sql,
                        vehicle.getType(),
                        vehicle.getStatus(),
                        vehicle.getCapacity(),
                        vehicle.getOperator_id()
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
        public void update(long id, vehicleEntity vehicle) throws SQLException {
            try {
                String sql = "UPDATE service SET type = ?, status = ?, " +
                        "capacity = ?, operator_id = ? where id = ?";

                int rowsAffected=jdbcTemplate.update(
                        sql,
                        vehicle.getType(),
                        vehicle.getStatus(),
                        vehicle.getCapacity(),
                        vehicle.getOperator_id(),
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
        public vehicleEntity get(long id) throws SQLException {
            try {
                String sql = "SELECT type, status, capacity, operator_id" +
                        "FROM vehicle WHERE id = ?";
                return jdbcTemplate.queryForObject(sql, new VehicleMapper(), id);
            } catch (EmptyResultDataAccessException e) {
                return null;
            } catch (DataAccessException e) {
                throw new SQLException("Failed to fetch vehicle: " + e.getMessage(), e);
            }
        }

        @Override
        public List<vehicleEntity> getAll() throws SQLException {
            try {
                String sql = "SELECT id, type, status, capacity, operator_id" +
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
//        public ServiceEntity findById(long id) throws Exception {
//            try {
//                String sql = "SELECT serviceID, name, description, imageData, imageName, imageType " +
//                        "FROM service WHERE serviceID = ?";
//                return jdbcTemplate.queryForObject(sql, new ServiceMapRow(), id);
//            } catch (EmptyResultDataAccessException e) {
//                return null;
//            } catch (DataAccessException e) {
//                throw new Exception("Failed to find service by ID: " + e.getMessage(), e);
//            }
//        }
//
//        public Integer isServiceInUse(long id) {
//            try {
//                String sql = "SELECT COUNT(*) FROM Task WHERE serviceID = ? AND status != 'done'";
//                return jdbcTemplate.queryForObject(sql, Integer.class, id);
//            } catch (DataAccessException e) {
//                return null;
//            }
//        }
//    }
}
