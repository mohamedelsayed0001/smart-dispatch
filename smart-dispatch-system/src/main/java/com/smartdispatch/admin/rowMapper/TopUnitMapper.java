package com.smartdispatch.admin.rowMapper;

import com.smartdispatch.admin.dto.UnitDto;
import com.smartdispatch.model.enums.VehicleType;
import org.springframework.jdbc.core.ResultSetExtractor;
import org.springframework.stereotype.Component;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
@Component
public class TopUnitMapper implements ResultSetExtractor<List<UnitDto>> {
    @Override
    public List<UnitDto> extractData(ResultSet rs) throws SQLException {
        List<UnitDto> units =new ArrayList<>();
        while (rs.next())
        {
            units.add(UnitDto.builder().Id(rs.getLong("id"))
                    .operatorName(rs.getString("name"))
                    .type(VehicleType.valueOf(rs.getString("type")))
                    .resolutionTime(rs.getDouble("avg_resolution_time"))
                    .build());
        }
return units;
    }
}
