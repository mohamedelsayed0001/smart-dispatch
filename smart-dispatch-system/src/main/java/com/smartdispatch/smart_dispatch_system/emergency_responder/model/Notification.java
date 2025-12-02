package com.smartdispatch.smart_dispatch_system.emergency_responder.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.sql.Timestamp;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    private Integer id;
    private Integer notifiedId;
    private String notificationType;
    private String content;
    private Timestamp timeSent;
    private Timestamp timeDelivered;
}