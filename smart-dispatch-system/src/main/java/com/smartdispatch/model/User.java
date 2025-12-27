package com.smartdispatch.model;

import com.smartdispatch.model.enums.UserRole;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
  private Long id;
  private String name;
  private String password;
  private String email;
  private UserRole role;
  private LocalDateTime createdAt;
}
