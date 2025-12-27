package com.smartdispatch.admin.dto;


import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AvgTimeResolved {
    private Long avgMinutes;
    private String type;
}
