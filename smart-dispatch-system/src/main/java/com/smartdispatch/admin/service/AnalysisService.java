package com.smartdispatch.admin.service;

import com.smartdispatch.admin.dto.*;
import com.smartdispatch.dao.IIncidentDao;
import com.smartdispatch.dao.IVehicleDao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AnalysisService {

    @Autowired
    private IIncidentDao incidentDao;

    @Autowired
    private IVehicleDao vehicleDao;

    public List<IncidentStatsDto> getIncidentStatsByMonthAndType(int limit) {
        return incidentDao.getIncidentCountPerMonthByType(limit);
    }

    public List<AvgTimeResolved> getAvgTimeResolved() {
        return incidentDao.getAvgTimeResolvedByType();
    }

    public List<VehicleTypeCount> getVehicleCountByType() {
        return vehicleDao.findCountOfVehiclesByType();
    }

    public List<UnitDto> getTopUnits(LocalDateTime startDate,LocalDateTime endDate) throws SQLException {
   try{
       return vehicleDao.getTop10(startDate, endDate);
   } catch (Exception e) {
       throw new SQLException(e);
   }
    }

    public List<ResponseTimeDTO> getResponseTime(LocalDateTime startDate, LocalDateTime endDate) throws SQLException {
        try{
            return vehicleDao.getResponseTime(startDate,endDate);
        }
        catch (Exception e){
            throw new SQLException(e);
        }
    }

}
