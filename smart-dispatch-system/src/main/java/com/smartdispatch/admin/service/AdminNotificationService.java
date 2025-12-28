package com.smartdispatch.admin.service;

import com.smartdispatch.admin.dto.AdminNotificationDto;
import com.smartdispatch.dao.imp.IncidentDao;
import com.smartdispatch.dispatcher.dtos.IncidentDto;
import com.smartdispatch.model.Incident;
import com.smartdispatch.websockets.NotificationService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class AdminNotificationService {
    private final IncidentDao incidentDao;
    private final NotificationService notificationService;
    private final Set<Long> notifiedUnassignedIncidents = new HashSet<>();

    public AdminNotificationService(IncidentDao incidentDao, NotificationService notificationService) {
        this.incidentDao = incidentDao;
        this.notificationService = notificationService;
    }

    @Scheduled(fixedRate = 60000)
    public void notifyUnassignedIncidents() {
        List<Incident> pending = incidentDao.getAllPendingIncidents();
        ZoneId zonePlus2 = ZoneId.of("UTC+2");
        ZoneOffset utc = ZoneOffset.UTC;
        LocalDateTime now = LocalDateTime.now();
        for (Incident inc : pending) {
            LocalDateTime reported = inc.getTimeReported();
            if (reported != null) {
                // Convert reported (UTC+2) to UTC
                ZonedDateTime reportedZoned = reported.atZone(zonePlus2).withZoneSameInstant(utc);
                LocalDateTime reportedUtc = reportedZoned.toLocalDateTime();

                long minutes = ChronoUnit.MINUTES.between(reportedUtc, now);
                if (minutes > 2 && !notifiedUnassignedIncidents.contains(inc.getId())) {
                    AdminNotificationDto dto = new AdminNotificationDto(
                        "INCIDENT_UNASSIGNED",
                        "Incident #" + inc.getId() + " has been unassigned for more than 2 minutes.",
                        now,
                        inc.getId()
                    );
                    notificationService.notifyChannel("admin/notifications", dto);
                    notifiedUnassignedIncidents.add(inc.getId());
                }
            }
        }
    }
    public void notifyIncidentCreated(IncidentDto inc) {
        AdminNotificationDto dto = new AdminNotificationDto(
            "INCIDENT_CREATED",
            "New incident reported: " + inc.getDescription()+"\n"+
                    "Incident Type : "+inc.getType(),
            inc.getTimeReported(),
            inc.getId()
        );
        notificationService.notifyChannel("admin/notifications", dto);
    }

    public void notifyIncidentResolved(IncidentDto inc) {
        AdminNotificationDto dto = new AdminNotificationDto(
            "INCIDENT_RESOLVED",
            "Incident #" + inc.getId() + " has been resolved. \n" +
                    "Incident Type : "+inc.getType(),
            inc.getTimeResolved(),
            inc.getId()
        );
        notificationService.notifyChannel("admin/notifications", dto);
    }
}
