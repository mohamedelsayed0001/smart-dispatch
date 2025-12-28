package com.smartdispatch.admin.controller;

import com.smartdispatch.admin.dao.NotificationDao;
import com.smartdispatch.admin.dto.NotificationDto;
import com.smartdispatch.admin.entity.Notification;
import com.smartdispatch.admin.mapper.NotificationMapper;
import com.smartdispatch.admin.service.AdminNotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/admin/notifications")
@PreAuthorize("hasRole('ADMIN')")
public class NotificationController {
    @Autowired
    private AdminNotificationService adminNotificationService;

    @GetMapping("getNotifications")
    public List<NotificationDto> getNotifications( @RequestParam(defaultValue = "10") int limit) {
        return adminNotificationService.getNotifications( limit);
    }
}
