package com.smartdispatch.report.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.smartdispatch.report.dao.ReportedIncidentDao;
import com.smartdispatch.report.dto.ReportedIncidentDto;
import com.smartdispatch.websockets.NotificationService;
import com.smartdispatch.report.dto.AdminIncidentReportDto;

@Service
public class IncidentService {

    private final ReportedIncidentDao reportedIncidentDao;
    private final NotificationService notificationService;

    IncidentService(ReportedIncidentDao reportedIncidentDao, NotificationService notificationService) {
        this.reportedIncidentDao = reportedIncidentDao;
        this.notificationService = notificationService;
    }

    public boolean addIncident(ReportedIncidentDto dto, int userId, String userName) {
        try {
            int id = reportedIncidentDao.addIncident(dto, userId);
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
            } catch (Exception e) {
                System.out.println("Failed to broadcast new incident: " + e.getMessage());
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
