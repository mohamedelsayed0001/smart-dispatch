package com.smartdispatch.emergency_responder.controller;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.smartdispatch.dispatcher.domains.dtos.AssignmentDto;
import com.smartdispatch.dispatcher.domains.dtos.IncidentDto;
import com.smartdispatch.emergency_responder.dto.*;
import com.smartdispatch.emergency_responder.service.ResponderService;
import com.smartdispatch.security.model.AppUserDetails;
import com.smartdispatch.websockets.websocketDto.VehicleUpdateDto;

import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/responder")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:5173" })
public class ResponderController {

    @Autowired
    private final ResponderService responderService;

    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> getProfile(
            @AuthenticationPrincipal AppUserDetails userDetails) {

        Integer responderId = userDetails.getId().intValue();
        Map<String, Object> profile = responderService.getResponderProfile(responderId);

        return ResponseEntity.ok(profile);
    }

    @GetMapping("/incidents/{incidentId}")
    public ResponseEntity<IncidentDto> getIncidentDetails(
    @AuthenticationPrincipal AppUserDetails userDetails,
    @PathVariable Integer incidentId) {

    IncidentDto incident =
    responderService.getIncidentDetails(incidentId);

    return ResponseEntity.ok(incident);
    }

    @PostMapping("/location")
    public ResponseEntity<Void> updateLocation(
            @AuthenticationPrincipal AppUserDetails userDetails,
            @RequestBody VehicleUpdateDto locationDTO) {

        Integer responderId = userDetails.getId().intValue();
        responderService.updateVehicleLocation(responderId, locationDTO);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/assignments")
    public ResponseEntity<List<AssignmentDto>> getAllAssignments(
            @AuthenticationPrincipal AppUserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Integer responderId = userDetails.getId().intValue();
        List<AssignmentDto> assignments = responderService.getAllAssignments(responderId, page, size);

        return ResponseEntity.ok(assignments);
    }

    @PutMapping("/assignments/{assignmentId}/status")
    public ResponseEntity<Void> updateStatus(
            @AuthenticationPrincipal AppUserDetails userDetails,
            @PathVariable Integer assignmentId,
            @RequestBody StatusUpdateDTO statusDTO) {

        responderService.updateStatus(assignmentId, statusDTO);

        return ResponseEntity.ok().build();
    }
}
