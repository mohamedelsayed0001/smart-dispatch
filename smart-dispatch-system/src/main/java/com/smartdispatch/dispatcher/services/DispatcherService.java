package com.smartdispatch.dispatcher.services;

import com.smartdispatch.dispatcher.domains.dtos.AssignmentDto;
import com.smartdispatch.dispatcher.domains.dtos.AssignmentRequest;
import com.smartdispatch.dispatcher.domains.dtos.ReassignRequest;
import com.smartdispatch.dispatcher.domains.dtos.IncidentDto;
import com.smartdispatch.dispatcher.domains.dtos.VehicleDto;
import com.smartdispatch.dispatcher.domains.entities.Assignment;

import java.util.List;

public interface DispatcherService {
   List<IncidentDto> getPendingIncidents();
  List<AssignmentDto> getAllAssignments();
   List<VehicleDto> getAvailableVehicles();
   List<VehicleDto> getAllVehicles();
  AssignmentDto assignVehicleToIncident(AssignmentRequest assignmentRequest);
  AssignmentDto reassignAssignment(ReassignRequest request);
    List<IncidentDto> getAllIncidents();
}
