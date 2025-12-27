package com.smartdispatch.dispatcher.services;

import java.util.List;

import com.smartdispatch.dispatcher.dtos.AssignmentDto;
import com.smartdispatch.dispatcher.dtos.AssignmentRequest;
import com.smartdispatch.dispatcher.dtos.IncidentDto;
import com.smartdispatch.dispatcher.dtos.ReassignRequest;
import com.smartdispatch.dispatcher.dtos.VehicleDto;

public interface IDispatcherService {
  List<IncidentDto> getPendingIncidents();

  List<AssignmentDto> getAllAssignments();

  List<VehicleDto> getAvailableVehicles(String type);

  List<VehicleDto> getAllVehicles();

  AssignmentDto assignVehicleToIncident(AssignmentRequest assignmentRequest);

  AssignmentDto reassignAssignment(ReassignRequest request);

  List<IncidentDto> getAllIncidents();

  AssignmentDto autoAssignClosestVehicle(Long incidentId);
  
  AssignmentDto autoAssignPendingIncidentToVehicle(Long vehicleId);
}
