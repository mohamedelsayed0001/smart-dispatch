package com.smartdispatch.authentication.dao;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.Optional;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import com.smartdispatch.authentication.model.User;

@Repository
public class LoginDAO {

    private final JdbcTemplate jdbcTemplate;
    private final UserRowMapper userRowMapper;

    public LoginDAO(JdbcTemplate jdbcTemplate,
            UserRowMapper userDTORowMapper){
                this.jdbcTemplate= jdbcTemplate;
                this.userRowMapper = userDTORowMapper;
    }

    private static final String INSERT_USER = """
            INSERT INTO User (name, password, email, role)
            VALUES (?, ?, ?, ?)
            """;
    private static final String GET_USER_BY_EMAIL = """
            SELECT id, name, password, email, role
            FROM User
            WHERE email = ?
            """;

    public long createUser(User user) {

        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                INSERT_USER,
                Statement.RETURN_GENERATED_KEYS
            );

            ps.setString(1, user.getName());
            ps.setString(2, user.getPassword());
            ps.setString(3, user.getEmail());
            ps.setString(4, user.getRole());

            return ps;
        }, keyHolder);

        // Return generated id
        return keyHolder.getKey().longValue();
    }


    public Optional<User> findByEmail(String email) {
        var users = jdbcTemplate.query(GET_USER_BY_EMAIL, this.userRowMapper, email);
        return users.stream().findFirst();
    }
}
