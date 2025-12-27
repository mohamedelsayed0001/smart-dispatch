package com.smartdispatch.emergency_responder.service;

import lombok.RequiredArgsConstructor;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smartdispatch.emergency_responder.dao.*;
import com.smartdispatch.emergency_responder.dto.*;
import com.smartdispatch.emergency_responder.model.*;
import com.smartdispatch.vehiclemanagement.init.VehicleLocationInitializer;
import com.smartdispatch.websockets.NotificationService;
import com.smartdispatch.websockets.websocketDto.*;
import com.smartdispatch.dispatcher.domains.dtos.AssignmentDto;
import com.smartdispatch.dispatcher.domains.dtos.IncidentDto;
import com.smartdispatch.dispatcher.domains.dtos.VehicleDto;

import java.util.List;
import java.util.Map;
import java.util.Optional;
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
  private final RedisTemplate<String, String> redisTemplate;
  private final com.smartdispatch.dispatcher.services.DispatcherService dispatcherService;
  
  public Map<String, Object> getResponderProfile(Integer responderId) {
    User responder = userDAO.findById(responderId)
        .orElseThrow(() -> new RuntimeException("Responder not found"));

    if (!"OPERATOR".equals(responder.getRole())) {
      throw new RuntimeException("User is not a responder");
    }

    Vehicle vehicle = vehicleDAO.findByOperatorId(responderId).orElse(null);

    VehicleDto vehicleDTO = null;
    if (vehicle != null) {
      VehicleLocation location = vehicleLocationDAO.findTopByVehicleIdOrderByTimeStampDesc(vehicle.getId())
          .orElse(null);
      Double lat = location != null ? location.getLatitude() : null;
      Double lon = location != null ? location.getLongitude() : null;

      vehicleDTO = new VehicleDto(
          vehicle.getId(),
          vehicle.getType(),
          vehicle.getStatus(),
          vehicle.getCapacity(),
          vehicle.getOperatorId(),
          lat,
          lon);
    }

    return Map.of(
        "id", responder.getId(),
        "name", responder.getName(),
        "email", responder.getEmail(),
        "role", responder.getRole(),
        "assignedVehicle", vehicleDTO);
  }

  public List<AssignmentDto> getAllAssignments(Integer responderId, int page, int size) {
    Vehicle vehicle = vehicleDAO.findByOperatorId(responderId)
        .orElseThrow(() -> new RuntimeException("No vehicle assigned to responder"));

    // Get all assignments, not filtered by status
    List<Assignment> assignments = assignmentDAO
        .findByVehicleIdOrderByTimeAssignedDesc(vehicle.getId());

    return assignments.stream()
        .skip((long) page * size)
        .limit(size)
        .map(this::convertToDto)
        .collect(Collectors.toList());
  }

  private AssignmentDto convertToDto(Assignment assignment) {
    Incident incident = incidentDAO.findById(assignment.getIncidentId())
        .orElseThrow(() -> new RuntimeException("Incident not found"));

    Vehicle vehicle = vehicleDAO.findById(assignment.getVehicleId())
        .orElseThrow(() -> new RuntimeException("Vehicle not found"));

    VehicleLocation location = vehicleLocationDAO.findTopByVehicleIdOrderByTimeStampDesc(vehicle.getId())
        .orElse(null);

    return AssignmentDto.builder()
        .id(assignment.getId())
        .dispatcherId(assignment.getDispatcherId())
        .incidentId(assignment.getIncidentId())
        .vehicleId(assignment.getVehicleId())
        .timeAssigned(assignment.getTimeAssigned())
        .timeResolved(assignment.getTimeResolved())
        .status(assignment.getStatus())
        .incidentType(incident.getType())
        .description(incident.getDescription())
        .currentLatitude(location != null ? location.getLatitude() : null)
        .currentLongitude(location != null ? location.getLongitude() : null)
        .build();
  }

 public IncidentDto getIncidentDetails(Integer incidentId) {
    Incident incident = incidentDAO.findById(incidentId)
        .orElseThrow(() -> new RuntimeException("Incident not found"));

    return IncidentDto.builder()
        .id(incident.getId())
        .type(incident.getType())
        .description(incident.getDescription())
        .latitude(incident.getLatitude())
        .longitude(incident.getLongitude())
        .build();
  }
  
  @Transactional
  public void updateVehicleLocation(Integer responderId, VehicleUpdateDto locationDTO) {
    Vehicle vehicle = vehicleDAO.findByOperatorId(responderId)
        .orElseThrow(() -> new RuntimeException("No vehicle assigned"));

    String vehicleId = vehicle.getId().toString();
    if (vehicleId == null)
      return;

    redisTemplate.opsForHash().put(
        VehicleLocationInitializer.VEHICLE_LOCATIONS_KEY,
        vehicleId,
        locationDTO.getLongitude() + "," + locationDTO.getLatitude());

    notificationService.notifyVehicleUpdate(
        new VehicleUpdateDto(
            vehicle.getId(),
            vehicle.getStatus(),
            locationDTO.getLatitude(),
            locationDTO.getLongitude()));
  }

  @Transactional
  public void updateStatus(Integer assignmentId, StatusUpdateDTO statusDTO) {
    Assignment assignment = assignmentDAO.findById(assignmentId)
        .orElseThrow(() -> new RuntimeException("Assignment not found"));

    Vehicle vehicle = vehicleDAO.findById(assignment.getVehicleId())
        .orElseThrow(() -> new RuntimeException("Vehicle not found"));

    Incident incident = incidentDAO.findById(assignment.getIncidentId())
        .orElseThrow(() -> new RuntimeException("Incident not found"));

    if (statusDTO.getVehicleStatus() != null) {
      vehicleDAO.updateStatus(vehicle.getId(), statusDTO.getVehicleStatus());

      Optional<VehicleLocation> locationOpt = vehicleLocationDAO
          .findTopByVehicleIdOrderByTimeStampDesc(vehicle.getId());

      if (locationOpt.isPresent()) {
        VehicleLocation location = locationOpt.get();

        notificationService.notifyVehicleUpdate(new VehicleUpdateDto(
            vehicle.getId(),
            statusDTO.getVehicleStatus(),
            location.getLatitude(),
            location.getLongitude()));
      }
    }

    if (statusDTO.getAssignmentStatus() != null) {
      assignmentDAO.updateStatusWithCurrentTime(assignmentId, statusDTO.getAssignmentStatus());

      notificationService.notifyAssignmentUpdate(new AssignmentUpdateDto(
          vehicle.getOperatorId(),
          assignmentId,
          statusDTO.getAssignmentStatus()));
    }

    if (statusDTO.getIncidentStatus() != null) {
      if ("COMPLETED".equals(statusDTO.getAssignmentStatus())) {
        incidentDAO.updateTimeResolved(assignment.getIncidentId(), statusDTO.getIncidentStatus());

        try {
            dispatcherService.autoAssignPendingIncidentToVehicle(vehicle.getId());
        } catch (Exception e) {
            System.err.println("Failed to auto-assign pending incident: " + e.getMessage());
        }
      } else {
        incidentDAO.updateStatus(incident.getId(), statusDTO.getIncidentStatus(), null);
      }

      notificationService.notifyIncidentUpdate(new IncidentDto(
          incident.getId(),
          incident.getType(),
          incident.getLevel(),
          incident.getDescription(),
          incident.getLatitude(),
          incident.getLongitude(),
          incident.getStatus(),
          incident.getTimeReported(),
          "COMPLETED".equals(statusDTO.getAssignmentStatus()) ? incident.getTimeResolved() : null,
          incident.getCitizenId()));
    }
  }
}