package com.smartdispatch.check;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;

@Service
public class UserService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * Get all users from the database
     */
    public List<UserDTO> getAllUsers() {
        String sql = "SELECT id, name, email, password, role FROM User";
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            UserDTO user = new UserDTO();
            user.setId((long) rs.getInt("id"));
            user.setName(rs.getString("name"));
            user.setEmail(rs.getString("email"));
            user.setPassword(rs.getString("password"));
            user.setRole(rs.getString("role"));
            return user;
        });
    }

    /**
     * Get a specific user by ID
     */
    @SuppressWarnings("deprecation")
    public UserDTO getUserById(Long id) {
        String sql = "SELECT id, name, email, password, role FROM User WHERE id = ?";
        List<UserDTO> users = jdbcTemplate.query(sql, new Object[]{id}, (rs, rowNum) -> {
            UserDTO user = new UserDTO();
            user.setId((long) rs.getInt("id"));
            user.setName(rs.getString("name"));
            user.setEmail(rs.getString("email"));
            user.setPassword(rs.getString("password"));
            user.setRole(rs.getString("role"));
            return user;
        });
        return users.isEmpty() ? null : users.get(0);
    }

    /**
     * Create a new user
     */
    public UserDTO createUser(UserDTO userDTO) {
        String sql = "INSERT INTO User (name, email, password, role) VALUES (?, ?, ?, ?)";
        jdbcTemplate.update(sql, 
            userDTO.getName(), 
            userDTO.getEmail(), 
            userDTO.getPassword(),
            userDTO.getRole()
        );
        
        // Retrieve the created user to get the ID
        List<Map<String, Object>> result = jdbcTemplate.queryForList(
            "SELECT id FROM User WHERE email = ? ORDER BY id DESC LIMIT 1", 
            userDTO.getEmail()
        );
        
        if (!result.isEmpty()) {
            Long newId = ((Number) result.get(0).get("id")).longValue();
            userDTO.setId(newId);
        }
        
        return userDTO;
    }

    /**
     * Update an existing user
     */
    public UserDTO updateUser(Long id, UserDTO userDTO) {
        String sql = "UPDATE User SET name = ?, email = ?, password = ?, role = ? WHERE id = ?";
        jdbcTemplate.update(sql,
            userDTO.getName(),
            userDTO.getEmail(),
            userDTO.getPassword(),
            userDTO.getRole(),
            id
        );
        userDTO.setId(id);
        return userDTO;
    }

    /**
     * Delete a user
     */
    public boolean deleteUser(Long id) {
        String sql = "DELETE FROM User WHERE id = ?";
        int rows = jdbcTemplate.update(sql, id);
        return rows > 0;
    }
}
