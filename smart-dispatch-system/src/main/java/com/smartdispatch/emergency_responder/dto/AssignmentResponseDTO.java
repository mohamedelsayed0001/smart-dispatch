package com.smartdispatch.emergency_responder.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentResponseDTO {
    private String response; // "accepted" or "rejected"
}
