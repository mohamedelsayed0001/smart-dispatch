package com.smartdispatch.emergency_responder.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smartdispatch.emergency_responder.dao.*;
import com.smartdispatch.emergency_responder.dto.*;
import com.smartdispatch.emergency_responder.model.*;
import com.smartdispatch.security.service.NotificationService;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResponderService {

  private final UserDAO userDAO;
  private final VehicleDAO vehicleDAO;
  private final AssignmentDAO assignmentDAO;
  private final IncidentDAO incidentDAO;
  private final VehicleLocationDAO vehicleLocationDAO;
  private final NotificationService notificationService;

  public Map<String, Object> getResponderProfile(Integer responderId) {
    User responder = userDAO.findById(responderId)
        .orElseThrow(() -> new RuntimeException("Responder not found"));

    if (!"OPERATOR".equals(responder.getRole())) {
      throw new RuntimeException("User is not a responder");
    }

    Vehicle vehicle = vehicleDAO.findByOperatorId(responderId).orElse(null);

    VehicleDetailsDTO vehicleDTO = null;
    if (vehicle != null) {
      vehicleDTO = new VehicleDetailsDTO(
          vehicle.getId(),
          vehicle.getType(),
          vehicle.getStatus(),
          vehicle.getCapacity());
    }

    return Map.of(
        "id", responder.getId(),
        "name", responder.getName(),
        "email", responder.getEmail(),
        "role", responder.getRole(),
        "assignedVehicle", vehicleDTO);
  }

  public AssignmentDTO getAssignmentDetails(Integer assignmentId, Integer responderId) {
    Assignment assignment = assignmentDAO.findById(assignmentId)
        .orElseThrow(() -> new RuntimeException("Assignment not found"));

    Vehicle vehicle = vehicleDAO.findByOperatorId(responderId)
        .orElseThrow(() -> new RuntimeException("No vehicle assigned"));

    if (!assignment.getVehicleId().equals(vehicle.getId())) {
      throw new RuntimeException("Not authorized to view this assignment");
    }

    return convertToDTO(assignment);
  }

  public List<AssignmentDTO> getAllAssignments(Integer responderId, int page, int size) {
    Vehicle vehicle = vehicleDAO.findByOperatorId(responderId)
        .orElseThrow(() -> new RuntimeException("No vehicle assigned to responder"));

    // Get all assignments, not filtered by status
    List<Assignment> assignments = assignmentDAO
        .findByVehicleIdOrderByTimeAssignedDesc(vehicle.getId());

    return assignments.stream()
        .skip((long) page * size)
        .limit(size)
        .map(this::convertToDTO)
        .collect(Collectors.toList());
  }

  public LocationsResponseDTO getAssignmentLocations(Integer assignmentId, Integer responderId) {
    Assignment assignment = assignmentDAO.findById(assignmentId)
        .orElseThrow(() -> new RuntimeException("Assignment not found"));

    Vehicle vehicle = vehicleDAO.findByOperatorId(responderId)
        .orElseThrow(() -> new RuntimeException("No vehicle assigned"));

    if (!assignment.getVehicleId().equals(vehicle.getId())) {
      throw new RuntimeException("Not authorized");
    }

    // Get latest vehicle location
    VehicleLocation latestLocation = vehicleLocationDAO
        .findTopByVehicleIdOrderByTimeStampDesc(vehicle.getId())
        .orElseThrow(() -> new RuntimeException("No location data for vehicle"));

    LocationDTO vehicleLocation = new LocationDTO(
        latestLocation.getLatitude(),
        latestLocation.getLongitude(),
        latestLocation.getTimeStamp());

    VehicleLocationDTO vehicleDTO = new VehicleLocationDTO(
        vehicle.getId(),
        vehicle.getType(),
        vehicleLocation);

    // Get incident location
    Incident incident = incidentDAO.findById(assignment.getIncidentId())
        .orElseThrow(() -> new RuntimeException("Incident not found"));

    LocationDTO incidentLocation = new LocationDTO(
        incident.getLatitude(),
        incident.getLongitude(),
        incident.getTimeReported());

    IncidentLocationDTO incidentDTO = new IncidentLocationDTO(
        incident.getId(),
        incident.getType(),
        incident.getLevel(),
        incidentLocation);

    return new LocationsResponseDTO(vehicleDTO, incidentDTO);
  }

  @Transactional
  public void updateVehicleLocation(Integer responderId, LocationDTO locationDTO) {
    Vehicle vehicle = vehicleDAO.findByOperatorId(responderId)
        .orElseThrow(() -> new RuntimeException("No vehicle assigned"));

    vehicleLocationDAO.saveWithCoordinates(
        vehicle.getId(),
        locationDTO.getLatitude(),
        locationDTO.getLongitude());
  }

  @Transactional
  public void updateStatus(Integer assignmentId, Integer responderId, StatusUpdateDTO statusDTO) {
    Assignment assignment = assignmentDAO.findById(assignmentId)
        .orElseThrow(() -> new RuntimeException("Assignment not found"));

    Vehicle vehicle = vehicleDAO.findByOperatorId(responderId)
        .orElseThrow(() -> new RuntimeException("No vehicle assigned"));

    if (!assignment.getVehicleId().equals(vehicle.getId())) {
      throw new RuntimeException("Not authorized");
    }

    // Validate status transition
    validateStatusTransition(vehicle.getStatus(), statusDTO.getVehicleStatus());

    // Update vehicle status
    if (statusDTO.getVehicleStatus() != null) {
      vehicleDAO.updateStatus(vehicle.getId(), statusDTO.getVehicleStatus());
    }

    // Update assignment status
    if (statusDTO.getAssignmentStatus() != null) {
      Timestamp timeResolved = null;

      if ("COMPLETED".equals(statusDTO.getAssignmentStatus())) {
        timeResolved = Timestamp.valueOf(LocalDateTime.now());

        // Update incident status
        incidentDAO.updateStatus(
            assignment.getIncidentId(),
            "RESOLVED",
            timeResolved);

        // Return vehicle to available
        vehicleDAO.updateStatus(vehicle.getId(), "AVAILABLE");
      }

      assignmentDAO.updateStatus(
          assignmentId,
          statusDTO.getAssignmentStatus(),
          timeResolved);
    }

    // Notify dispatcher
    User dispatcher = userDAO.findById(assignment.getDispatcherId())
        .orElse(null);

    if (dispatcher != null) {
      notificationService.notifyChannel(
          "vehicle/status",
          java.util.Map.of(
              "dispatcherId", dispatcher.getId(),
              "vehicleId", vehicle.getId(),
              "newStatus", statusDTO.getVehicleStatus()));
    }
  }

  @Transactional
  public AssignmentActionResponseDTO respondToAssignment(
      Integer assignmentId,
      Integer responderId,
      String response) {

    Assignment assignment = assignmentDAO.findById(assignmentId)
        .orElseThrow(() -> new RuntimeException("Assignment not found"));

    Vehicle vehicle = vehicleDAO.findByOperatorId(responderId)
        .orElseThrow(() -> new RuntimeException("No vehicle assigned"));

    if (!assignment.getVehicleId().equals(vehicle.getId())) {
      throw new RuntimeException("Not authorized for this assignment");
    }

    Incident incident = incidentDAO.findById(assignment.getIncidentId())
        .orElseThrow(() -> new RuntimeException("Incident not found"));

    if ("ACCEPTED".equalsIgnoreCase(response)) {
      // ACCEPT: Update statuses
      assignmentDAO.updateStatus(assignmentId, "ACTIVE", null);
      vehicleDAO.updateStatus(vehicle.getId(), "ONROUTE");
      incidentDAO.updateStatus(assignment.getIncidentId(), "ASSIGNED", null);

      notificationService.notifyChannel(
          "vehicle/assignment",
          java.util.Map.of(
              "responderId", responderId,
              "assignmentId", assignmentId,
              "response", "ACCEPTED"));

      return new AssignmentActionResponseDTO(
          true,
          "Assignment accepted",
          convertToDTO(assignment),
          null,
          null);

    } else if ("REJECTED".equalsIgnoreCase(response)) {
      // REJECT: Update statuses
      assignmentDAO.updateStatus(assignmentId, "REJECTED", null);
      // Vehicle stays AVAILABLE
      incidentDAO.updateStatus(assignment.getIncidentId(), "PENDING", null);

      notificationService.notifyChannel(
          "vehicle/assignment",
          java.util.Map.of(
              "responderId", responderId,
              "assignmentId", assignmentId,
              "response", "REJECTED"));

      return new AssignmentActionResponseDTO(
          true,
          "Assignment rejected",
          null,
          null,
          null);

    } else {
      throw new RuntimeException("Invalid response: " + response);
    }
  }

  @Transactional
  public AssignmentActionResponseDTO cancelAssignment(Integer assignmentId, Integer responderId) {
    Assignment assignment = assignmentDAO.findById(assignmentId)
        .orElseThrow(() -> new RuntimeException("Assignment not found"));

    Vehicle vehicle = vehicleDAO.findByOperatorId(responderId)
        .orElseThrow(() -> new RuntimeException("No vehicle assigned"));

    if (!assignment.getVehicleId().equals(vehicle.getId())) {
      throw new RuntimeException("Not authorized");
    }

    // Update statuses
    assignmentDAO.updateStatus(assignmentId, "CANCELED", null);
    vehicleDAO.updateStatus(vehicle.getId(), "AVAILABLE");
    incidentDAO.updateStatus(assignment.getIncidentId(), "PENDING", null);

    notificationService.notifyChannel(
        "vehicle/assignment",
        java.util.Map.of(
            "responderId", responderId,
            "assignmentId", assignmentId,
            "response", "CANCELED"));

    return new AssignmentActionResponseDTO(
        true,
        "Assignment cancelled",
        convertToDTO(assignment),
        null,
        null);
  }

  private void validateStatusTransition(String currentStatus, String newStatus) {
    if (newStatus == null)
      return;

    boolean isValid = false;
    switch (currentStatus) {
      case "AVAILABLE":
        isValid = "ONROUTE".equals(newStatus);
        break;
      case "ONROUTE":
        isValid = "RESOLVING".equals(newStatus) || "AVAILABLE".equals(newStatus);
        break;
      case "RESOLVING":
        isValid = "AVAILABLE".equals(newStatus);
        break;
    }

    if (!isValid) {
      throw new RuntimeException(
          String.format("Invalid status transition from %s to %s",
              currentStatus, newStatus));
    }
  }

  private AssignmentDTO convertToDTO(Assignment assignment) {
    Incident incident = incidentDAO.findById(assignment.getIncidentId())
        .orElseThrow(() -> new RuntimeException("Incident not found"));

    Vehicle vehicle = vehicleDAO.findById(assignment.getVehicleId())
        .orElseThrow(() -> new RuntimeException("Vehicle not found"));

    IncidentDetailsDTO incidentDTO = new IncidentDetailsDTO(
        incident.getId(),
        incident.getType(),
        incident.getLevel(),
        incident.getDescription(),
        incident.getLatitude(),
        incident.getLongitude(),
        incident.getStatus(),
        incident.getTimeReported());

    VehicleDetailsDTO vehicleDTO = new VehicleDetailsDTO(
        vehicle.getId(),
        vehicle.getType(),
        vehicle.getStatus(),
        vehicle.getCapacity());

    return new AssignmentDTO(
        assignment.getId(),
        incident.getId(),
        vehicle.getId(),
        assignment.getStatus(),
        assignment.getTimeAssigned(),
        assignment.getTimeResolved(),
        incidentDTO,
        vehicleDTO);
  }
}