package com.smartdispatch.admin.rowMapper;

import com.smartdispatch.admin.dto.ResponseTimeDTO;
import com.smartdispatch.admin.dto.UnitDto;
import com.smartdispatch.model.enums.VehicleType;
import org.springframework.jdbc.core.ResultSetExtractor;
import org.springframework.stereotype.Component;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@Component
public class ResponseTimeMapper implements ResultSetExtractor<List<ResponseTimeDTO>> {
    @Override
    public List<ResponseTimeDTO> extractData(ResultSet rs) throws SQLException {
        List<ResponseTimeDTO> list=new ArrayList<>();
        while(rs.next()){
            list.add(ResponseTimeDTO.builder()
                    .AvgResponseTime(rs.getDouble("AVG_RESPONSE_TIME"))
                    .maxResponseTime(rs.getDouble("MAX_RESPONSE_TIME"))
                    .minResponseTime(rs.getDouble("MIN_RESPONSE_TIME"))
                    .totalAccidents(rs.getInt("TOTAL_INCIDENTS"))
                    .type(VehicleType.valueOf(rs.getString("vehicle_type"))).build());
        }
        return list;
    }
}
