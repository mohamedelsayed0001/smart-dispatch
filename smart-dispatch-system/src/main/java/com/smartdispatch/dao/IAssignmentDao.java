package com.smartdispatch.dao;

import com.smartdispatch.model.Assignment;
import com.smartdispatch.model.enums.AssignmentStatus;
import java.util.List;

public interface IAssignmentDao {
  Long createAssignment(Assignment assignment);

  List<Assignment> getAllAssignments();

  Assignment findById(Long id);
  Assignment findByIdForUpdate(Long id);

  List<Assignment> findByVehicleIdOrderByTimeAssignedDesc(Long vehicleId);

  boolean updateStatus(Long id, AssignmentStatus status);

  int updateStatusWithCurrentTime(Long assignmentId, AssignmentStatus status);

  boolean updateVehicle(Long id, Long vehicleId);
}
