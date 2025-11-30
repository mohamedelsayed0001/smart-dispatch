package com.smartdispatch.admin.service;

import com.smartdispatch.admin.dao.AdminUserDAO;
import com.smartdispatch.admin.dto.PaginatedResponse;
import com.smartdispatch.admin.dto.UserDTO;
import com.smartdispatch.admin.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class AdminUserService {

    @Autowired
    private AdminUserDAO userDAO;

    private static final int DEFAULT_PAGE_SIZE = 10;

    public PaginatedResponse<UserDTO> getUsers(int page, String role, String search) {
        if (page < 1) page = 1;
        
        System.out.println("[UserService] getUsers called with page=" + page + ", role=" + role + ", search=" + search);
        
        // Get users for the current page
        List<User> users = userDAO.getAllUsers(page, DEFAULT_PAGE_SIZE, role, search);
        
        // Get total count
        long totalCount = userDAO.getTotalCount(role, search);
        int totalPages = (int) Math.ceil((double) totalCount / DEFAULT_PAGE_SIZE);
        
        System.out.println("[UserService] Retrieved " + users.size() + " users, total=" + totalCount + ", totalPages=" + totalPages);
        
        // Convert to DTOs
        List<UserDTO> userDTOs = new ArrayList<>();
        for (User user : users)
            userDTOs.add(convertToDTO(user));
        
        // Build response
        PaginatedResponse<UserDTO> response = new PaginatedResponse<>();
        response.setData(userDTOs);
        response.setCurrentPage(page);
        response.setTotalPages(totalPages);
        response.setTotalElements(totalCount);
        response.setPageSize(DEFAULT_PAGE_SIZE);
        
        return response;
    }

    public boolean promoteUser(Long userId, String newRole) {
        System.out.println("[UserService] Promoting user id=" + userId + " to role=" + newRole);
        return userDAO.updateUserRole(userId, newRole);
    }

    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setStatus(user.getStatus());
        dto.setJoinedDate(user.getJoinedDate());
        return dto;
    }
}
