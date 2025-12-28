package com.smartdispatch.admin.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Notification {

    private Long id;

    private Long notifiedId;
    private NotificationType notificationType;

    private String content;
    private LocalDateTime timeSent;

    private LocalDateTime timeDelivered;

}

