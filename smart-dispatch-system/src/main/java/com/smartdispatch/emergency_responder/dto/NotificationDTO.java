package com.smartdispatch.emergency_responder.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.sql.Timestamp;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    private Integer id;
    private Integer notifiedId;
    private String notificationType;
    private String content;
    private Timestamp timeSent;
    private Timestamp timeDelivered;
    private AssignmentDTO assignment;
    private IncidentDetailsDTO incident;
}
