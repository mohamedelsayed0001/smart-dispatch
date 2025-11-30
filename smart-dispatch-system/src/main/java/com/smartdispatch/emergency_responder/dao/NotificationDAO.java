package com.smartdispatch.emergency_responder.dao;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import com.smartdispatch.emergency_responder.model.Notification;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class NotificationDAO {

    private final JdbcTemplate jdbcTemplate;

    private final RowMapper<Notification> notificationRowMapper = (rs, rowNum) -> {
        Notification notification = new Notification();
        notification.setId(rs.getInt("id"));
        notification.setNotifiedId(rs.getInt("notified_id"));
        notification.setNotificationType(rs.getString("notification_type"));
        notification.setContent(rs.getString("content"));
        notification.setTimeSent(rs.getTimestamp("time_sent"));
        notification.setTimeDelivered(rs.getTimestamp("time_delivered"));
        return notification;
    };

    public Optional<Notification> findById(Integer id) {
        String sql = "SELECT * FROM Notification WHERE id = ?";
        return jdbcTemplate.query(sql, notificationRowMapper, id)
                .stream()
                .findFirst();
    }

    public List<Notification> findByNotifiedIdAndType(Integer notifiedId, String type) {
        String sql = "SELECT * FROM Notification WHERE notified_id = ? AND notification_type = ? " +
                    "AND time_delivered IS NULL ORDER BY time_sent DESC";
        return jdbcTemplate.query(sql, notificationRowMapper, notifiedId, type);
    }

    public List<Notification> findPendingByNotifiedId(Integer notifiedId, int limit, int offset) {
        String sql = "SELECT * FROM Notification WHERE notified_id = ? " +
                    "AND time_delivered IS NULL " +
                    "ORDER BY time_sent DESC LIMIT ? OFFSET ?";
        return jdbcTemplate.query(sql, notificationRowMapper, notifiedId, limit, offset);
    }

    public Integer save(Integer notifiedId, String notificationType, String content) {
        String sql = "INSERT INTO Notification (notified_id, notification_type, content, time_sent) " +
                    "VALUES (?, ?, ?, ?)";
        jdbcTemplate.update(sql, notifiedId, notificationType, content, 
                          Timestamp.valueOf(LocalDateTime.now()));
        
        // Get last inserted ID
        return jdbcTemplate.queryForObject("SELECT LAST_INSERT_ID()", Integer.class);
    }

    public void markAsDelivered(Integer notificationId) {
        String sql = "UPDATE Notification SET time_delivered = ? WHERE id = ?";
        jdbcTemplate.update(sql, Timestamp.valueOf(LocalDateTime.now()), notificationId);
    }

    public void deleteById(Integer notificationId) {
        String sql = "DELETE FROM Notification WHERE id = ?";
        jdbcTemplate.update(sql, notificationId);
    }

    public void deleteByNotifiedIdAndAssignmentId(Integer notifiedId, Integer assignmentId) {
        // Assuming you store assignmentId in content or have a separate column
        String sql = "DELETE FROM Notification WHERE notified_id = ? " +
                    "AND content LIKE ?";
        jdbcTemplate.update(sql, notifiedId, "%assignmentId\":" + assignmentId + "%");
    }
}