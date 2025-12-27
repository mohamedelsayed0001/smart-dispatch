package com.smartdispatch.websockets.websocketDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AssignmentUpdateDto {
  private Long responderId;
  private Long assignmentId;
  private String response;
}
