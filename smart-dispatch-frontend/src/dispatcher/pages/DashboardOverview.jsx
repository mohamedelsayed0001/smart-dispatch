import VehicleMap from './VehicleMap'
import '../styles/Dispatcher.css'

export default function DashboardOverview() {
  // Static KPI values for now — these can be replaced with live data calls later
  const kpis = [
    { label: 'Active Units', value: 15, accent: 'text-black' },
    { label: 'Pending Emergencies', value: 5, accent: 'text-red-600' },
    { label: 'Avg Response Time', value: '3.5 min', accent: 'text-black' },
    { label: 'Efficiency', value: '87%', accent: 'text-green-600' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-semibold">Dashboard</h2>
          <div className="text-sm text-gray-500">Dispatcher overview</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map((k) => (
          <div key={k.label} className="kpi-card p-4 rounded-xl shadow-sm bg-white">
            <div className="text-sm text-gray-500">{k.label}</div>
            <div className={`text-2xl font-bold mt-2 ${k.accent}`}>{k.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Live Map</h3>
          <div className="live-badge">Live</div>
        </div>
        {/* embed compact map */}
        <div className="rounded overflow-hidden">
          <VehicleMap height={'420px'} />
        </div>
      </div>
    </div>
  )
}
