package com.smartdispatch.admin.dao;

import com.smartdispatch.admin.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class AdminUserDAO {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public List<User> getAllUsers(int page, int pageSize, String role, String search) {
        int offset = (page - 1) * pageSize;
        
        StringBuilder sql = new StringBuilder(
            "SELECT id, name, email, password, role, 'active' as status, DATE_FORMAT(created_at, '%Y-%m-%d') as joinedDate " +
            "FROM User WHERE 1=1"
        );
        
        List<Object> params = new java.util.ArrayList<>();
        
        // Apply role filter
        if (role != null && !role.isEmpty() && !role.equals("all")) {
            sql.append(" AND role = ?");
            params.add(role.toUpperCase());
        }
        
        // Apply search filter
        if (search != null && !search.isEmpty()) {
            sql.append(" AND (LOWER(name) LIKE ? OR LOWER(email) LIKE ?)");
            String searchParam = "%" + search.toLowerCase() + "%";
            params.add(searchParam);
            params.add(searchParam);
        }
        
        sql.append(" LIMIT ? OFFSET ?");
        params.add(pageSize);
        params.add(offset);
        
        System.out.println("[UserDAO] Executing query: " + sql.toString());
        System.out.println("[UserDAO] Params: page=" + page + ", pageSize=" + pageSize + ", role=" + role + ", search=" + search);
        
        return jdbcTemplate.query(
            sql.toString(),
            params.toArray(),
            (rs, rowNum) -> {
                User user = new User();
                user.setId((long) rs.getInt("id"));
                user.setName(rs.getString("name"));
                user.setEmail(rs.getString("email"));
                user.setRole(rs.getString("role"));
                user.setStatus(rs.getString("status"));
                user.setJoinedDate(rs.getString("joinedDate"));
                return user;
            }
        );
    }

    public long getTotalCount(String role, String search) {
        StringBuilder sql = new StringBuilder("SELECT COUNT(*) FROM User WHERE 1=1");
        List<Object> params = new java.util.ArrayList<>();
        
        // Apply role filter
        if (role != null && !role.isEmpty() && !role.equals("all")) {
            sql.append(" AND role = ?");
            params.add(role.toUpperCase());
        }
        
        // Apply search filter
        if (search != null && !search.isEmpty()) {
            sql.append(" AND (LOWER(name) LIKE ? OR LOWER(email) LIKE ?)");
            String searchParam = "%" + search.toLowerCase() + "%";
            params.add(searchParam);
            params.add(searchParam);
        }
        
        System.out.println("[UserDAO] Count query: " + sql.toString());
        
        Long count = jdbcTemplate.queryForObject(
            sql.toString(),
            params.toArray(),
            Long.class
        );
        
        return count != null ? count : 0;
    }

    /**
     * Get user by ID
     */
    public User getUserById(Long id) {
        String sql = "SELECT id, name, email, password, role, 'active' as status, DATE_FORMAT(created_at, '%Y-%m-%d') as joinedDate " +
                     "FROM User WHERE id = ?";
        
        List<User> users = jdbcTemplate.query(
            sql,
            new Object[]{id},
            (rs, rowNum) -> {
                User user = new User();
                user.setId((long) rs.getInt("id"));
                user.setName(rs.getString("name"));
                user.setEmail(rs.getString("email"));
                user.setRole(rs.getString("role"));
                user.setStatus(rs.getString("status"));
                user.setJoinedDate(rs.getString("joinedDate"));
                return user;
            }
        );
        
        return users.isEmpty() ? null : users.get(0);
    }

    /**
     * Update user role
     */
    public boolean updateUserRole(Long id, String newRole) {
        String sql = "UPDATE User SET role = ? WHERE id = ?";
        int rows = jdbcTemplate.update(sql, newRole.toUpperCase(), id);
        System.out.println("[UserDAO] Updated " + rows + " rows for user id=" + id + " with role=" + newRole);
        return rows > 0;
    }
}
