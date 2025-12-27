package com.smartdispatch.emergency_responder.dao;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import com.smartdispatch.emergency_responder.model.*;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class UserDAO {

  private final JdbcTemplate jdbcTemplate;

  private static final String SELECT_BY_ID = "SELECT id, name, password, email, role, created_at FROM User WHERE id = ?";

  private final RowMapper<User> userRowMapper=new RowMapper<User>(){@Override public User mapRow(ResultSet rs,int rowNum)throws SQLException{User user=new User();user.setId(rs.getInt("id"));user.setName(rs.getString("name"));user.setPassword(rs.getString("password"));user.setEmail(rs.getString("email"));user.setRole(rs.getString("role"));user.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());return user;}};

  @SuppressWarnings("null")
  public Optional<User> findById(Integer id) {
    try {
      User user = jdbcTemplate.queryForObject(SELECT_BY_ID, userRowMapper, id);
      return Optional.ofNullable(user);
    } catch (Exception e) {
      return Optional.empty();
    }
  }
}
