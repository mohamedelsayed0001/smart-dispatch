import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const getLocalDateTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const Analysis = () => {
  const [incidentStats, setIncidentStats] = useState([]);
  const [avgResolved, setAvgResolved] = useState([]);
  const [vehicleCounts, setVehicleCounts] = useState([]);
  const [responseTimes, setResponseTimes] = useState([]);
  const [topUnits, setTopUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: '2025-01-01T00:00:00',
    endDate: getLocalDateTime()
  });

  useEffect(() => {
    const LIMIT = 12;
    const token = localStorage.getItem('authToken');
    setLoading(true);

    const fetchWithErrorHandling = async (url) => {
      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      if (!res.ok) throw new Error(`Failed to fetch from ${url}`);
      const text = await res.text();
      if (text.trim().startsWith('<!doctype') || text.trim().startsWith('<html')) {
        throw new Error('Server returned HTML instead of JSON');
      }
      return JSON.parse(text);
    };

    Promise.all([
      fetchWithErrorHandling(`/api/admin/analysis/incident-stats?limit=${LIMIT}`),
      fetchWithErrorHandling(`/api/admin/analysis/incident-avg-resolved`),
      fetchWithErrorHandling(`/api/admin/analysis/vehicle-count`),
      fetchWithErrorHandling(`/api/admin/analysis/response-times?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`),
      fetchWithErrorHandling(`/api/admin/analysis/top-units?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`)
    ])
      .then(([incidentData, avgResolvedData, vehicleCountData, responseTimeData, topUnitsData]) => {
        setIncidentStats(Array.isArray(incidentData) ? incidentData : []);
        setAvgResolved(Array.isArray(avgResolvedData) ? avgResolvedData : []);
        setVehicleCounts(Array.isArray(vehicleCountData) ? vehicleCountData : []);
        setResponseTimes(Array.isArray(responseTimeData) ? responseTimeData : []);
        setTopUnits(Array.isArray(topUnitsData) ? topUnitsData : []);  
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [dateRange]);

  const colorPalette = [
    { bg: 'rgba(59, 130, 246, 0.7)', border: 'rgba(59, 130, 246, 1)' },
    { bg: 'rgba(239, 68, 68, 0.7)', border: 'rgba(239, 68, 68, 1)' },
    { bg: 'rgba(34, 197, 94, 0.7)', border: 'rgba(34, 197, 94, 1)' },
    { bg: 'rgba(251, 146, 60, 0.7)', border: 'rgba(251, 146, 60, 1)' },
    { bg: 'rgba(168, 85, 247, 0.7)', border: 'rgba(168, 85, 247, 1)' },
    { bg: 'rgba(236, 72, 153, 0.7)', border: 'rgba(236, 72, 153, 1)' },
    { bg: 'rgba(14, 165, 233, 0.7)', border: 'rgba(14, 165, 233, 1)' },
    { bg: 'rgba(250, 204, 21, 0.7)', border: 'rgba(250, 204, 21, 1)' },
  ];

  // Incident Stats Chart
  const months = [...new Set(incidentStats.map(item => item.month))];
  const types = ['FIRE', 'MEDICAL', 'CRIME'];

  const incidentDatasets = types.map((type, index) => {
    const colors = colorPalette[index % colorPalette.length];
    return {
      label: type,
      data: months.map(month => {
        const found = incidentStats.find(item => item.month === month && item.type === type);
        return found ? found.count : 0;
      }),
      backgroundColor: colors.bg,
      borderColor: colors.border,
      borderWidth: 1,
    };
  });

  const incidentChartData = {
    labels: months,
    datasets: incidentDatasets,
  };

  const incidentChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: 'Incident Trends by Type and Month',
        font: { size: 18, weight: 'bold' }
      }
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Number of Incidents' }
      }
    }
  };

  // Response Times Chart
  const responseTimeChartData = {
    labels: responseTimes.map(rt => rt?.type || 'Unknown'),
    datasets: [{
      label: 'Average Response Time (minutes)',
      data: responseTimes.map(rt => rt?.avgResponseTime || 0),
      backgroundColor: responseTimes.map((_, idx) => colorPalette[idx]?.bg || 'rgba(128, 128, 128, 0.7)'),
      borderColor: responseTimes.map((_, idx) => colorPalette[idx]?.border || 'rgba(128, 128, 128, 1)'),
      borderWidth: 2,
    }]
  };

  const responseTimeOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Average Response Time by Vehicle Type',
        font: { size: 18, weight: 'bold' }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const rt = responseTimes[context.dataIndex];
            if (!rt) return 'No data';
            return [
              `Avg: ${(rt.avgResponseTime || 0).toFixed(2)} min`,
              `Min: ${(rt.minResponseTime || 0).toFixed(2)} min`,
              `Max: ${(rt.maxResponseTime || 0).toFixed(2)} min`,
              `Total: ${rt.totalAccidents || 0} incidents`
            ];
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Minutes' }
      }
    }
  };

  const totalIncidents = incidentStats.reduce((sum, item) => sum + (item.count || 0), 0);
  const avgResolvedTimes = types.map(type => {
    const found = avgResolved.find(item => item.type === type);
    return { type, avg: found ? found.avgMinutes : null };
  });

  const getTypeColor = (type) => {
    const colors = {
      'AMBULANCE': 'bg-blue-100 text-blue-800',
      'FIRETRUCK': 'bg-red-100 text-red-800',
      'POLICE': 'bg-green-100 text-green-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getMedalIcon = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}.`;
  };

  // Safe calculation for average response time
  const calculateAvgResponseTime = () => {
    if (!responseTimes.length) return '< 0.1';
    const sum = responseTimes.reduce((acc, rt) => acc + (rt?.avgResponseTime || 0), 0);
    return (sum / responseTimes.length).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Analysis Dashboard</h1>

          {/* Date Range Selector */}
          <div className="flex gap-2 items-center">
            <input
              type="datetime-local"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="px-3 py-2 border rounded-lg text-sm"
            />
            <span className="text-gray-500">to</span>
            <input
              type="datetime-local"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="px-3 py-2 border rounded-lg text-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading analytics data...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <strong>Error:</strong> {error}
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Total Incidents</h3>
                <p className="text-3xl font-bold text-gray-900">{totalIncidents}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Months Tracked</h3>
                <p className="text-3xl font-bold text-gray-900">{months.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Avg Response Time</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {calculateAvgResponseTime()} {responseTimes.length > 0 && 'min'}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Top Unit</h3>
                <p className="text-xl font-bold text-green-600">
                  {topUnits.length > 0 && topUnits[0]?.operatorName ? topUnits[0].operatorName : 'N/A'}
                </p>
                <p className="text-sm text-gray-500">
                  {topUnits.length > 0 && topUnits[0]?.resolutionTime ? `${topUnits[0].resolutionTime.toFixed(1)} min avg` : ''}
                </p>
              </div>
            </div>

            {/* Main Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Incident Trends Chart */}
              <div className="bg-white rounded-lg shadow p-6">
                {incidentStats.length > 0 ? (
                  <Bar data={incidentChartData} options={incidentChartOptions} />
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    No incident data available
                  </div>
                )}
              </div>

              {/* Response Times Chart */}
              <div className="bg-white rounded-lg shadow p-6">
                {responseTimes.length > 0 ? (
                  <Bar data={responseTimeChartData} options={responseTimeOptions} />
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    No response time data available
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Row: Top Units & Resolution Times */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top 10 Units Leaderboard */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">🏆 Top 10 Performing Units</h2>
                {topUnits.length > 0 ? (
                  <div className="space-y-2">
                    {topUnits.slice(0, 10).map((unit, index) => (
                      <div
                        key={unit?.id || index}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl w-8 text-center">{getMedalIcon(index)}</span>
                          <div>
                            <div className="font-semibold text-gray-800">{unit?.operatorName || 'Unknown'}</div>
                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getTypeColor(unit?.type)}`}>
                              {unit?.type || 'N/A'}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg text-gray-900">
                            {unit?.resolutionTime ? unit.resolutionTime.toFixed(1) : '< 0.1'} min
                          </div>
                          <div className="text-xs text-gray-500">avg resolution</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No unit data available
                  </div>
                )}
              </div>

              {/* Average Resolution Times */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Average Resolution Time by Type</h2>
                <div className="space-y-4">
                  {avgResolvedTimes.map((item, index) => (
                    <div key={item.type} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: colorPalette[index % colorPalette.length].border }}
                          ></div>
                          <span className="font-medium text-gray-700">{item.type}</span>
                        </div>
                        <span className="font-bold text-gray-900">
                          {item.avg !== null ? `${item.avg.toFixed(2)} min` : '< 0.1 min'}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: item.avg ? `${Math.min((item.avg / 200) * 100, 100)}%` : '0%',
                            backgroundColor: colorPalette[index % colorPalette.length].border
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Response Time Details */}
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold text-gray-700 mb-3">Dispatcher Response Time Details</h3>
                  {responseTimes.length > 0 ? (
                    <div className="space-y-3">
                      {responseTimes.map((rt, index) => (
                        <div key={rt?.type || index} className="flex justify-between items-center text-sm">
                          <span className="font-medium text-gray-600">{rt?.type || 'Unknown'}</span>
                          <div className="text-right">
                            <div className="font-semibold text-gray-800">
                              {rt?.avgResponseTime ? rt.avgResponseTime.toFixed(1) : '< 0.1'} min
                            </div>
                            <div className="text-xs text-gray-500">
                              {rt?.minResponseTime >= 0 && rt?.maxResponseTime >= 0
                                ? `${rt.minResponseTime.toFixed(1)} - ${rt.maxResponseTime.toFixed(1)} min range`
                                : 'No range data'
                              }
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      No response time details available
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Vehicle Count Summary */}
            <div className="mt-6 bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Fleet Overview</h2>
              {vehicleCounts.length > 0 ? (
                <div className="grid grid-cols-3 gap-4">
                  {vehicleCounts.map((vc, index) => (
                    <div key={vc?.type || index} className="text-center p-4 rounded-lg bg-gray-50">
                      <div className="text-3xl font-bold" style={{ color: colorPalette[index % colorPalette.length].border }}>
                        {vc?.count || 0}
                      </div>
                      <div className="text-sm font-medium text-gray-600 mt-1">{vc?.type || 'Unknown'}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No vehicle data available
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Analysis;