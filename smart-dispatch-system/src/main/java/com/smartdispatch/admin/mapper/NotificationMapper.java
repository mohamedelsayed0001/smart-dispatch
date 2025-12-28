package com.smartdispatch.admin.mapper;

import com.smartdispatch.admin.entity.Notification;
import com.smartdispatch.admin.entity.NotificationType;
import com.smartdispatch.admin.dto.NotificationDto;

public class NotificationMapper {
    public static NotificationDto toDto(Notification entity) {
        if (entity == null) return null;
        return new NotificationDto(

            entity.getNotificationType() != null ? entity.getNotificationType().name() : null,
            entity.getContent(),
            entity.getTimeSent()

        );
    }

    public static Notification toEntity(NotificationDto dto) {
        if (dto == null) return null;
        NotificationType type = null;
        if (dto.getNotificationType() != null) {
            try {
                type = NotificationType.valueOf(dto.getNotificationType());
            } catch (IllegalArgumentException e) {
                type = NotificationType.GENERAL;
            }
        }
        Notification entity = new Notification();
        entity.setNotificationType(type);
        entity.setContent(dto.getContent());
        entity.setTimeSent(dto.getTimeSent());
        return entity;
    }
}
