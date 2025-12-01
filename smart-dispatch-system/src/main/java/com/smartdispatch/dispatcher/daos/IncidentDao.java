package com.smartdispatch.dispatcher.daos;

import com.smartdispatch.dispatcher.domains.entities.Assignment;
import com.smartdispatch.dispatcher.domains.entities.Incident;

import java.util.List;

public interface IncidentDao {
    List<Incident> getAllPendingIncidents();
    boolean updateStatus(Integer incidentId, String status);
    Incident findById(Integer id);

}
