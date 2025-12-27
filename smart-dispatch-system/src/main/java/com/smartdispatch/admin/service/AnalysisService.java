package com.smartdispatch.admin.service;

import com.smartdispatch.admin.dao.AdminUserDAO;
import com.smartdispatch.admin.dto.IncidentStatsDto;
import com.smartdispatch.dispatcher.daos.IncidentDao;
import com.smartdispatch.report.model.Incident;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AnalysisService {
    @Autowired
    private IncidentDao incidentDao;
   public List<IncidentStatsDto> getIncidentStatsByMonthAndType(int limit){
       return incidentDao.getIncidentCountPerMonthByType(limit);
   }
}
