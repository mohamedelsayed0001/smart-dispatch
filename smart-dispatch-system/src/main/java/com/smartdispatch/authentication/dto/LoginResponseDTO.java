package com.smartdispatch.authentication.dto;

import com.smartdispatch.model.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponseDTO {
    private Long id;
    private String name;
    private String email;
    private UserRole role;
    private String token;
}
