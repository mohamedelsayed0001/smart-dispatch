import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Analysis = () => {
  const [incidentStats, setIncidentStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const LIMIT = 12;
    const token = localStorage.getItem('authToken');
    fetch(`/api/admin/analysis/incident-stats?limit=${LIMIT}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    })
      .then(async res => {
        if (!res.ok) throw new Error('Failed to fetch data');
        const text = await res.text();
        // Check if response is HTML (starts with <!doctype or <html)
        if (text.trim().startsWith('<!doctype') || text.trim().startsWith('<html')) {
          throw new Error('Server returned HTML instead of JSON. Possible backend/API error.');
        }
        try {
          return JSON.parse(text);
        } catch (e) {
          throw new Error('Response is not valid JSON.');
        }
      })
      .then(data => {
        setIncidentStats(data);
        console.log(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Define a color palette for different incident types
  const colorPalette = [
    { bg: 'rgba(59, 130, 246, 0.7)', border: 'rgba(59, 130, 246, 1)' },      // Blue
    { bg: 'rgba(239, 68, 68, 0.7)', border: 'rgba(239, 68, 68, 1)' },        // Red
    { bg: 'rgba(34, 197, 94, 0.7)', border: 'rgba(34, 197, 94, 1)' },        // Green
    { bg: 'rgba(251, 146, 60, 0.7)', border: 'rgba(251, 146, 60, 1)' },      // Orange
    { bg: 'rgba(168, 85, 247, 0.7)', border: 'rgba(168, 85, 247, 1)' },      // Purple
    { bg: 'rgba(236, 72, 153, 0.7)', border: 'rgba(236, 72, 153, 1)' },      // Pink
    { bg: 'rgba(14, 165, 233, 0.7)', border: 'rgba(14, 165, 233, 1)' },      // Sky
    { bg: 'rgba(250, 204, 21, 0.7)', border: 'rgba(250, 204, 21, 1)' },      // Yellow
  ];

  // Prepare data for grouped bar chart
  const months = [...new Set(incidentStats.map(item => item.month))];
  const types = ['FIRE', 'MEDICAL', 'CRIME'];

  const datasets = types.map((type, index) => {
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

  const chartData = {
    labels: months,
    datasets,
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          padding: 15,
          font: {
            size: 12,
            weight: '500'
          }
        }
      },
      title: {
        display: true,
        text: 'Incident Trends by Type and Month',
        font: {
          size: 18,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y} incidents`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: {
            size: 11
          },
          precision: 0
        },
        title: {
          display: true,
          text: 'Number of Incidents',
          font: {
            size: 12,
            weight: '600'
          }
        }
      }
    }
  };

  // Calculate summary statistics
  const totalIncidents = incidentStats.reduce((sum, item) => sum + (item.count || 0), 0);
  const typeBreakdown = types.map(type => ({
    type,
    total: incidentStats
      .filter(item => item.type === type)
      .reduce((sum, item) => sum + (item.count || 0), 0)
  })).sort((a, b) => b.total - a.total);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Analysis Dashboard</h1>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading incident data...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <strong>Error:</strong> {error}
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Total Incidents</h3>
                <p className="text-3xl font-bold text-gray-900">{totalIncidents}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Months Tracked</h3>
                <p className="text-3xl font-bold text-gray-900">{months.length}</p>
              </div>
            </div>

            {/* Main Chart */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <Bar data={chartData} options={chartOptions} />
            </div>

            {/* Type Breakdown */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Incident Type Breakdown</h2>
              <div className="space-y-3">
                {typeBreakdown.map((item, index) => (
                  <div key={item.type} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: colorPalette[index % colorPalette.length].border }}
                      ></div>
                      <span className="font-medium text-gray-700">{item.type}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-900">{item.total}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        ({totalIncidents > 0 ? ((item.total / totalIncidents) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Analysis;