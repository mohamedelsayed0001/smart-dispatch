package com.smartdispatch.smart_dispatch_system.emergency_responder.dao;

import com.smartdispatch.smart_dispatch_system.emergency_responder.model.*;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class UserDAO {

  private final JdbcTemplate jdbcTemplate;

  private static final String SELECT_BY_ID = "SELECT id, name, password, email, role, created_at FROM User WHERE id = ?";

  private static final String SELECT_BY_EMAIL = "SELECT id, name, password, email, role, created_at FROM User WHERE email = ?";

  private static final String SELECT_BY_ROLE = "SELECT id, name, password, email, role, created_at FROM User WHERE role = ?";

  // RowMapper to convert ResultSet to User object
  private final RowMapper<User> userRowMapper=new RowMapper<User>(){@Override public User mapRow(ResultSet rs,int rowNum)throws SQLException{User user=new User();user.setId(rs.getInt("id"));user.setName(rs.getString("name"));user.setPassword(rs.getString("password"));user.setEmail(rs.getString("email"));user.setRole(rs.getString("role"));user.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());return user;}};

  public Optional<User> findById(Integer id) {
    try {
      User user = jdbcTemplate.queryForObject(SELECT_BY_ID, userRowMapper, id);
      return Optional.ofNullable(user);
    } catch (Exception e) {
      return Optional.empty();
    }
  }

  public Optional<User> findByEmail(String email) {
    try {
      User user = jdbcTemplate.queryForObject(SELECT_BY_EMAIL, userRowMapper, email);
      return Optional.ofNullable(user);
    } catch (Exception e) {
      return Optional.empty();
    }
  }

  public List<User> findByRole(String role) {
    return jdbcTemplate.query(SELECT_BY_ROLE, userRowMapper, role);
  }

  public List<User> findAll() {
    String sql = "SELECT id, name, password, email, role, created_at FROM User";
    return jdbcTemplate.query(sql, userRowMapper);
  }

  public int save(User user) {
    String sql = "INSERT INTO User (name, password, email, role) VALUES (?, ?, ?, ?)";
    return jdbcTemplate.update(sql,
        user.getName(),
        user.getPassword(),
        user.getEmail(),
        user.getRole());
  }

  public int update(User user) {
    String sql = "UPDATE User SET name = ?, password = ?, email = ?, role = ? WHERE id = ?";
    return jdbcTemplate.update(sql,
        user.getName(),
        user.getPassword(),
        user.getEmail(),
        user.getRole(),
        user.getId());
  }

  public int deleteById(Integer id) {
    String sql = "DELETE FROM User WHERE id = ?";
    return jdbcTemplate.update(sql, id);
  }
}
