package com.smartdispatch.report.service;

import org.springframework.stereotype.Service;

import com.smartdispatch.report.dao.ReportedIncidentDao;
import com.smartdispatch.report.dto.ReportedIncidentDto;

@Service
public class IncidentService {

    ReportedIncidentDao reportedIncidentDao;

    IncidentService(ReportedIncidentDao reportedIncidentDao) {
        this.reportedIncidentDao = reportedIncidentDao;
    }

    public boolean addIncident(ReportedIncidentDto dto, int userId) {
        try {
            reportedIncidentDao.addIncident(dto, userId);
        }
        catch (Exception e) {
            System.out.println(e.getMessage());
            return false;
        }
        return true;
    }
}
