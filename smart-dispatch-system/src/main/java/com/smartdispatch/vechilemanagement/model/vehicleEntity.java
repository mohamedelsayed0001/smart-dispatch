package com.smartdispatch.vechilemanagement.model;

import com.smartdispatch.vechilemanagement.Status;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Builder
@Getter
@Setter
public class vehicleEntity {
   private long id;
   private Status status;
   private int capacity;
   private String type;
   private long operator_id;

}
