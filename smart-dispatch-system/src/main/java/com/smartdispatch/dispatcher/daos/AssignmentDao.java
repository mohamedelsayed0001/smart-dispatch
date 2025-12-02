package com.smartdispatch.dispatcher.daos;

import com.smartdispatch.dispatcher.domains.entities.Assignment;

import java.util.List;

public interface AssignmentDao {
     List<Assignment> getAllAssignments();
     Integer createAssignment(Assignment assignment);
     boolean updateStatus(Integer assignmentId, String status);
     Assignment findById(Integer id);
     boolean updateVehicle(Integer assignmentId, Integer vehicleId);
}
