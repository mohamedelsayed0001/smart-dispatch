package com.smartdispatch.dispatcher.services;

import java.util.List;

import com.smartdispatch.dispatcher.domains.dtos.AssignmentDto;
import com.smartdispatch.dispatcher.domains.dtos.AssignmentRequest;
import com.smartdispatch.dispatcher.domains.dtos.IncidentDto;
import com.smartdispatch.dispatcher.domains.dtos.ReassignRequest;
import com.smartdispatch.dispatcher.domains.dtos.VehicleDto;

public interface IDispatcherService {
  List<IncidentDto> getPendingIncidents();

  List<AssignmentDto> getAllAssignments();

  List<VehicleDto> getAvailableVehicles(String type);

  List<VehicleDto> getAllVehicles();

  AssignmentDto assignVehicleToIncident(AssignmentRequest assignmentRequest);

  AssignmentDto reassignAssignment(ReassignRequest request);

  List<IncidentDto> getAllIncidents();

  AssignmentDto autoAssignClosestVehicle(Integer incidentId);
  
  AssignmentDto autoAssignPendingIncidentToVehicle(Integer vehicleId);
}
