package com.smartdispatch.check;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String name;
    private String email;
    private String password;
    private String role; // 'operator', 'citizen', 'dispatcher'
    private String jwt; // returned when getting token
}
