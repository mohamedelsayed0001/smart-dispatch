package com.smartdispatch.emergency_responder.service;

import com.smartdispatch.admin.service.AdminNotificationService;
import lombok.RequiredArgsConstructor;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smartdispatch.dao.*;
import com.smartdispatch.dispatcher.dtos.AssignmentDto;
import com.smartdispatch.dispatcher.dtos.IncidentDto;
import com.smartdispatch.dispatcher.dtos.VehicleDto;
import com.smartdispatch.emergency_responder.dto.*;
import com.smartdispatch.model.*;
import com.smartdispatch.model.enums.*;
import com.smartdispatch.vehiclemanagement.init.VehicleLocationInitializer;
import com.smartdispatch.websockets.NotificationService;
import com.smartdispatch.websockets.websocketDto.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResponderService {
  private final AdminNotificationService adminNotificationService;
  private final IUserDao userDAO;
  private final IVehicleDao vehicleDAO;
  private final IAssignmentDao assignmentDAO;
  private final IIncidentDao incidentDAO;
  private final ILocationDao locationDao;
  private final NotificationService notificationService;
  private final RedisTemplate<String, String> redisTemplate;
  private final com.smartdispatch.dispatcher.services.DispatcherService dispatcherService;

  public Map<String, Object> getResponderProfile(Long responderId) {
    User responder = userDAO.findById(responderId)
        .orElseThrow(() -> new RuntimeException("Responder not found"));

    if (responder.getRole() != UserRole.OPERATOR) {
      throw new RuntimeException("User is not a responder");
    }

    Vehicle vehicle = vehicleDAO.findByOperatorId(responderId).orElse(null);

    VehicleDto vehicleDTO = null;
    if (vehicle != null) {
      VehicleLocation location = locationDao.findLatestByVehicleId(vehicle.getId())
          .orElse(null);
      Double lat = location != null ? location.getLatitude() : null;
      Double lon = location != null ? location.getLongitude() : null;

      vehicleDTO = VehicleDto.builder()
          .id(vehicle.getId())
          .type(vehicle.getType().name())
          .status(vehicle.getStatus().name())
          .capacity(vehicle.getCapacity())
          .operatorId(vehicle.getOperatorId())
          .currentLatitude(lat)
          .currentLongitude(lon)
          .build();
    }

    return Map.of(
        "id", responder.getId(),
        "name", responder.getName(),
        "email", responder.getEmail(),
        "role", responder.getRole().name(),
        "assignedVehicle", vehicleDTO != null ? vehicleDTO : "none");
  }

  public List<AssignmentDto> getAllAssignments(Long responderId, int page, int size) {
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
    Incident incident = incidentDAO.findOptionalById(assignment.getIncidentId())
        .orElseThrow(() -> new RuntimeException("Incident not found"));

    Vehicle vehicle = vehicleDAO.findOptionalById(assignment.getVehicleId())
        .orElseThrow(() -> new RuntimeException("Vehicle not found"));

    VehicleLocation location = locationDao.findLatestByVehicleId(vehicle.getId())
        .orElse(null);

    return AssignmentDto.builder()
        .id(assignment.getId())
        .dispatcherId(assignment.getDispatcherId())
        .incidentId(assignment.getIncidentId())
        .vehicleId(assignment.getVehicleId())
        .timeAssigned(assignment.getTimeAssigned())
        .timeResolved(assignment.getTimeResolved())
        .status(assignment.getStatus().name())
        .incidentType(incident.getType().name())
        .description(incident.getDescription())
        .currentLatitude(location != null ? location.getLatitude() : null)
        .currentLongitude(location != null ? location.getLongitude() : null)
        .build();
  }

  public IncidentDto getIncidentDetails(Long incidentId) {
    Incident incident = incidentDAO.findOptionalById(incidentId)
        .orElseThrow(() -> new RuntimeException("Incident not found"));

    return IncidentDto.builder()
        .id(incident.getId())
        .type(incident.getType().name())
        .description(incident.getDescription())
        .latitude(incident.getLatitude())
        .longitude(incident.getLongitude())
        .status(incident.getStatus().name())
        .timeReported(incident.getTimeReported())
        .timeResolved(incident.getTimeResolved())
        .citizenId(incident.getCitizenId())
        .build();
  }

  @Transactional
  public void updateVehicleLocation(Long responderId, VehicleUpdateDto locationDTO) {
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
            vehicle.getStatus().name(),
            locationDTO.getLatitude(),
            locationDTO.getLongitude()));
  }

  @Transactional
  public void updateStatus(Long assignmentId, StatusUpdateDTO statusDTO) {
    Assignment assignment = assignmentDAO.findById(assignmentId);
    if (assignment == null)
      throw new RuntimeException("Assignment not found");

    Vehicle vehicle = vehicleDAO.findById(assignment.getVehicleId());
    if (vehicle == null)
      throw new RuntimeException("Vehicle not found");

    Incident incident = incidentDAO.findById(assignment.getIncidentId());
    if (incident == null)
      throw new RuntimeException("Incident not found");

    if (statusDTO.getVehicleStatus() != null) {
      vehicleDAO.updateStatus(vehicle.getId(), statusDTO.getVehicleStatus());

      Optional<VehicleLocation> locationOpt = locationDao
          .findLatestByVehicleId(vehicle.getId());

      if (locationOpt.isPresent()) {
        VehicleLocation location = locationOpt.get();

        notificationService.notifyVehicleUpdate(new VehicleUpdateDto(
            vehicle.getId(),
            statusDTO.getVehicleStatus().name(),
            location.getLatitude(),
            location.getLongitude()));
      }
    }

    if (statusDTO.getAssignmentStatus() != null) {
      assignmentDAO.updateStatusWithCurrentTime(assignmentId, statusDTO.getAssignmentStatus());

      notificationService.notifyAssignmentUpdate(new AssignmentUpdateDto(
          vehicle.getOperatorId(),
          assignmentId,
          statusDTO.getAssignmentStatus().name()));
    }

    if (statusDTO.getIncidentStatus() != null) {
      if (statusDTO.getAssignmentStatus() == AssignmentStatus.COMPLETED) {
        incidentDAO.updateTimeResolved(assignment.getIncidentId(), statusDTO.getIncidentStatus());
        adminNotificationService.notifyIncidentResolved(IncidentDto.builder().type(incident.getType().name())
                .id(assignment.getIncidentId())
                .description(incident.getDescription())
                        .timeResolved((LocalDateTime.now()))
                .build());

        try {
          dispatcherService.autoAssignPendingIncidentToVehicle(vehicle.getId());
        } catch (Exception e) {
          System.err.println("Failed to auto-assign pending incident: " + e.getMessage());
        }
      } else {
        incidentDAO.updateStatus(incident.getId(), statusDTO.getIncidentStatus());
      }

      notificationService.notifyIncidentUpdate(IncidentDto.builder()
          .id(incident.getId())
          .type(incident.getType().name())
          .level(incident.getLevel().name())
          .description(incident.getDescription())
          .latitude(incident.getLatitude())
          .longitude(incident.getLongitude())
          .status(statusDTO.getIncidentStatus().name())
          .timeReported(incident.getTimeReported())
          .timeResolved(
              statusDTO.getAssignmentStatus() == AssignmentStatus.COMPLETED ? incident.getTimeResolved() : null)
          .citizenId(incident.getCitizenId())
          .build());
    }
  }
}