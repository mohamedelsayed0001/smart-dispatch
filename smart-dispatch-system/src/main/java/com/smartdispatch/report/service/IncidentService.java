package com.smartdispatch.report.service;

import java.time.LocalDateTime;
import java.util.List;

import com.smartdispatch.admin.service.AdminNotificationService;
import com.smartdispatch.dispatcher.dtos.IncidentDto;
import org.springframework.stereotype.Service;

import com.smartdispatch.report.dao.ReportedIncidentDao;
import com.smartdispatch.report.dto.ReportedIncidentDto;
import com.smartdispatch.websockets.NotificationService;
import com.smartdispatch.report.dto.AdminIncidentReportDto;

@Service
public class IncidentService {
    private final AdminNotificationService adminNotificationService;
    private final ReportedIncidentDao reportedIncidentDao;
    private final NotificationService notificationService;
    private final com.smartdispatch.dispatcher.services.DispatcherService dispatcherService;

    IncidentService(AdminNotificationService adminNotificationService, ReportedIncidentDao reportedIncidentDao, NotificationService notificationService, com.smartdispatch.dispatcher.services.DispatcherService dispatcherService) {
        this.adminNotificationService = adminNotificationService;
        this.reportedIncidentDao = reportedIncidentDao;
        this.notificationService = notificationService;
        this.dispatcherService = dispatcherService;
    }

    public boolean addIncident(ReportedIncidentDto dto, int userId, String userName) {
        try {
            Long id = reportedIncidentDao.addIncident(dto, userId);
            if (id <= 0) return false;
            // fetch the created incident and broadcast to reports channel
            // AdminIncidentReportDto created = reportedIncidentDao.getIncidentById(id);
            AdminIncidentReportDto created = new AdminIncidentReportDto(
                id,
                dto.getType(),
                dto.getLevel(),
                dto.getDescription(),
                dto.getLatitude(),
                dto.getLongitude(),
                "PENDING",
                LocalDateTime.now(),
                null,
                userName                
            );
            try {
                notificationService.notifyChannel("reports", created);
                adminNotificationService.notifyIncidentCreated(IncidentDto.builder()
                                .type(dto.getType())
                                .timeReported(LocalDateTime.now())
                                .description(dto.getDescription())
                                .id(id)
                        .build());

                dispatcherService.autoAssignClosestVehicle(id);
            } catch (Exception e) {
                System.out.println("Failed to broadcast new incident or auto-assign: " + e.getMessage());
            }
        }
        catch (Exception e) {
            System.out.println(e.getMessage());
            return false;
        }
        return true;
    }

    public List<AdminIncidentReportDto> getAllIncidents() {
        return reportedIncidentDao.getAllIncidents();
    }

    public List<AdminIncidentReportDto> getAllIncidents(Integer id, String status, String type, String level, String text) {
        return reportedIncidentDao.getAllIncidents(id, status, type, level, text);
    }
}
