package com.smartdispatch.admin.model;

import com.smartdispatch.admin.dto.UserDTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    private Long id;
    private String name;
    private String email;
    private String password;
    private String role;
    private String status;
    private String joinedDate;

    public UserDTO convertToDTO() {
        UserDTO dto = new UserDTO();
        dto.setId(this.id);
        dto.setName(this.name);
        dto.setEmail(this.email);
        dto.setRole(this.role);
        dto.setStatus(this.status);
        dto.setJoinedDate(this.joinedDate);
        return dto;
    }
}
