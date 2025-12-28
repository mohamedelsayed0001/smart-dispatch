package com.smartdispatch.admin.service;

import com.smartdispatch.admin.dto.NotificationDto;
import com.smartdispatch.admin.entity.Notification;
import com.smartdispatch.admin.entity.NotificationType;
import com.smartdispatch.admin.dao.NotificationDao;
import com.smartdispatch.admin.mapper.NotificationMapper;
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
import java.util.stream.Collectors;

@Service
public class AdminNotificationService {
    private final IncidentDao incidentDao;
    private final NotificationService notificationService;
    private final NotificationDao notificationDao;
    private final Set<Long> notifiedUnassignedIncidents = new HashSet<>();

    public AdminNotificationService(IncidentDao incidentDao, NotificationService notificationService, NotificationDao notificationDao) {
        this.incidentDao = incidentDao;
        this.notificationService = notificationService;
        this.notificationDao = notificationDao;
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
                ZonedDateTime reportedZoned = reported.atZone(zonePlus2).withZoneSameInstant(utc);
                LocalDateTime reportedUtc = reportedZoned.toLocalDateTime();
                long minutes = ChronoUnit.MINUTES.between(reportedUtc, now);
                if (minutes > 2 && !notifiedUnassignedIncidents.contains(inc.getId())) {
                    String content = "Incident #" + inc.getId() + " has been unassigned for more than 2 minutes.";
                    NotificationDto notificationDto = new NotificationDto(
                        NotificationType.INCIDENT_ALERT.name(),
                        content,
                        now
                    );
                    var entity = NotificationMapper.toEntity(notificationDto);
                    if (entity.getTimeSent() == null) entity.setTimeSent(LocalDateTime.now());
                    notificationDao.add(entity);
                    notificationService.notifyChannel("admin/notifications", notificationDto);
                    notifiedUnassignedIncidents.add(inc.getId());
                }
            }
        }
    }
    public void notifyIncidentCreated(IncidentDto inc) {
        String content = "New incident reported: " + inc.getDescription()+"\n"+
            "Incident Type : "+inc.getType();
        NotificationDto dto = new NotificationDto(
            NotificationType.INCIDENT_ALERT.name(),
            content,
            inc.getTimeReported()
        );
        var entity = NotificationMapper.toEntity(dto);
        if (entity.getTimeSent() == null) entity.setTimeSent(LocalDateTime.now());
        notificationDao.add(entity);
        notificationService.notifyChannel("admin/notifications", dto);
    }

    public void notifyIncidentResolved(IncidentDto inc) {
        String content = "Incident #" + inc.getId() + " has been resolved. \n" +
            "Incident Type : "+inc.getType();
        NotificationDto dto = new NotificationDto(
            NotificationType.INCIDENT_ALERT.name(),
            content,
            inc.getTimeResolved()

        );
        var entity = NotificationMapper.toEntity(dto);
        if (entity.getTimeSent() == null) entity.setTimeSent(LocalDateTime.now());
        notificationDao.add(entity);
        notificationService.notifyChannel("admin/notifications", dto);
    }
    public List<NotificationDto> getNotifications(int limit){
        List<Notification> notifications=notificationDao.getNotificationsByType(limit,NotificationType.INCIDENT_ALERT);
       return  notifications.stream().map(NotificationMapper::toDto).collect(Collectors.toList());
    }
}
