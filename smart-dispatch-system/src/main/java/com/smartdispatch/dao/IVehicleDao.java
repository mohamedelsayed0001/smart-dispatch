package com.smartdispatch.dao;

import com.smartdispatch.admin.dto.ResponseTimeDTO;
import com.smartdispatch.admin.dto.UnitDto;
import com.smartdispatch.admin.dto.VehicleTypeCount;
import com.smartdispatch.model.Vehicle;
import com.smartdispatch.model.enums.VehicleStatus;
import com.smartdispatch.model.enums.VehicleType;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface IVehicleDao {
  List<Vehicle> getAllVehicles();

  List<Vehicle> findAvailableVehicles();

  List<Vehicle> findAvailableVehiclesByType(VehicleType type);

  Vehicle findById(Long id);

  Vehicle findByIdForUpdate(Long id);

  Optional<Vehicle> findOptionalById(Long id);

  Optional<Vehicle> findByOperatorId(Long operatorId);

  boolean updateStatus(Long id, VehicleStatus status);

  List<VehicleTypeCount> findCountOfVehiclesByType();

  Vehicle findClosestAvailableVehicle(VehicleType type, double latitude, double longitude);

  void save(Vehicle vehicle);

  void delete(Long id);

  void update(Long id, Vehicle vehicle);

  int isVehicleInUse(Long id);

  boolean isOperatorCorrect(Long operatorId);

  List<UnitDto> getTop10(LocalDateTime st,LocalDateTime et);

    List<ResponseTimeDTO> getResponseTime(LocalDateTime startDate, LocalDateTime endDate);
}
