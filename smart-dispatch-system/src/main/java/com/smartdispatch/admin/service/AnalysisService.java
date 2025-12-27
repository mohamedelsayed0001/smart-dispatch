package com.smartdispatch.admin.service;


import com.smartdispatch.admin.dto.AvgTimeResolved;
import com.smartdispatch.admin.dto.IncidentStatsDto;
import com.smartdispatch.admin.dto.VehicleTypeCount;
import com.smartdispatch.dispatcher.daos.IncidentDao;
import com.smartdispatch.dispatcher.daos.VehicleDao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AnalysisService {
    @Autowired
    private IncidentDao incidentDao;
    @Autowired
    private VehicleDao vehicleDao;
   public List<IncidentStatsDto> getIncidentStatsByMonthAndType(int limit){
       return incidentDao.getIncidentCountPerMonthByType(limit);
   }
   public List<AvgTimeResolved>getAvgTimeResolved(){
       return incidentDao.getAvgTimeResolvedByType();

   }

    public List<VehicleTypeCount> getVehicleCountByType() {
        return vehicleDao.findCountOfVehiclesByType() ;
    }
}
