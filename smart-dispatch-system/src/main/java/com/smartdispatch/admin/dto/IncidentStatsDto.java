package com.smartdispatch.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class IncidentStatsDto {
    private String month;
    private String type;
    private Long count;
}
