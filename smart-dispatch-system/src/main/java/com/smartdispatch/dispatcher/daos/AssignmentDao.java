package com.smartdispatch.dispatcher.daos;

import com.smartdispatch.dispatcher.domains.entities.Assignment;

public interface AssignmentDao {
     Integer createAssignment(Assignment assignment);
     boolean updateStatus(Integer assignmentId, String status);
     Assignment findById(Integer id);
}
