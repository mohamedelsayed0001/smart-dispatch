package com.smartdispatch.emergency_responder.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
  private Integer id;
  private String name;
  private String password;
  private String email;
  private String role;
  private LocalDateTime createdAt;
}
