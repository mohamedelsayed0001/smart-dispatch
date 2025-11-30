package com.smartdispatch.admin.controller;

import com.smartdispatch.admin.dto.PaginatedResponse;
import com.smartdispatch.admin.dto.UserDTO;
import com.smartdispatch.admin.service.AdminUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@CrossOrigin(origins = "*")
public class AdminUserController {

    @Autowired
    private AdminUserService userService;

    /**
     * Get all users with pagination and filtering
     * Query parameters:
     * - page: page number (default 1)
     * - role: filter by role (all, admin, dispatcher, operator, citizen)
     * - search: search by name or email
     */
    @GetMapping
    public ResponseEntity<PaginatedResponse<UserDTO>> getUsers(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "all") String role,
            @RequestParam(defaultValue = "") String search
    ) {
        try {
            System.out.println("[UserController] GET /api/admin/users?page=" + page + "&role=" + role + "&search=" + search);
            
            PaginatedResponse<UserDTO> response = userService.getUsers(page, role, search);
            
            System.out.println("[UserController] Returning " + response.getData().size() + " users");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("[UserController] Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Promote/Update user role
     */
    @PutMapping("/{id}/role")
    public ResponseEntity<Map<String, String>> updateUserRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        try {
            
            String newRole = body.get("role");
            
            if (newRole == null || newRole.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Role cannot be empty");
                return ResponseEntity.badRequest().body(error);
            }
            
            System.out.println("[UserController] Updating user id=" + id + " to role=" + newRole);
            
            boolean updated = userService.promoteUser(id, newRole);
            
            if (updated) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "User role updated successfully");
                return ResponseEntity.ok(response);
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("error", "User not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

        } catch (Exception e) {
            System.out.println("[UserController] Error: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
