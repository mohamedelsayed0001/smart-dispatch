package com.smartdispatch.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class VehicleTypeCount {
    String type;
    int count;
}
