import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  ShieldAlert, CheckCircle2, Activity, ShieldCheck, 
  Server, RefreshCw, AlertTriangle, TrendingUp, RotateCcw,
  CreditCard, DollarSign, ArrowRightLeft
} from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function App() {
  const [stats, setStats] = useState({ total_transactions: 0, status_codes: {}, total_revenue: 0 });
  const [security, setSecurity] = useState({ suspicious_ips: {} });
  const [healing, setHealing] = useState({ 
    gateway_health: [], 
    revenue_saved: 0, 
    total_revenue: 0,
    active_gateways: []
  });
  const [isConnected, setIsConnected] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const statsRes = await fetch('http://127.0.0.1:8000/api/stats');
      const statsData = await statsRes.json();
      
      const securityRes = await fetch('http://127.0.0.1:8000/api/security');
      const securityData = await securityRes.json();

      const healingRes = await fetch('http://127.0.0.1:8000/api/healing');
      const healingData = await healingRes.json();
      
      if (!statsData.error && !securityData.error && !healingData.error) {
        setStats(statsData);
        setSecurity(securityData);
        setHealing(healingData);
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }
    } catch (err) {
      setIsConnected(false);
      console.error("Could not fetch data from FastAPI backend", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleReset = async () => {
    try {
      await fetch('http://127.0.0.1:8000/api/reset');
      await fetchData();
    } catch (err) {
      console.error("Could not reset logs", err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, []);

  const statusChartData = Object.entries(stats.status_codes).map(([code, count]) => ({
    name: `HTTP ${code}`,
    count: count,
    fill: code.startsWith('2') ? '#10b981' : code.startsWith('4') ? '#f59e0b' : '#ef4444'
  }));

  const suspiciousCount = Object.keys(security.suspicious_ips).length;
  const isAnyGatewayDegraded = healing.gateway_health && healing.gateway_health.some(g => g.status === 'Degraded');

  return (
    <div className="dashboard-container">
      {/* HEADER */}
      <header className="dashboard-header">
        <div className="header-left">
          <Activity className="header-icon text-blue" />
          <div>
            <h1>AI Payment Healer Engine</h1>
            <p className="subtitle">Track 03: Autonomous Revenue Recovery & Smart Routing</p>
          </div>
        </div>
        
        <div className="header-right">
          <div className={`status-badge ${isConnected ? 'online' : 'offline'}`}>
            <span className="pulse-dot"></span>
            {isConnected ? 'Backend Connected' : 'Backend Disconnected'}
          </div>
          <button className={`btn-refresh ${isRefreshing ? 'spinning' : ''}`} onClick={fetchData}>
            <RefreshCw size={16} />
          </button>
          <button className="btn-refresh" onClick={handleReset} style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
            <RotateCcw size={16} />
          </button>
        </div>
      </header>

      {/* AI ROUTING BANNER */}
      {isAnyGatewayDegraded && (
        <div className="ai-warning-banner" style={{ background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.1) 0%, #ffffff 100%)', borderColor: '#f59e0b' }}>
          <div className="banner-left">
            <ArrowRightLeft className="banner-icon text-warning animate-pulse" size={24} style={{ color: '#f59e0b' }} />
            <div>
              <h3 style={{ color: '#f59e0b' }}>AI DYNAMIC ROUTING ACTIVE</h3>
              <p>Gateway degradation detected! Failed transactions are being re-routed to healthy backups.</p>
            </div>
          </div>
          <div className="banner-right">
            <div className="action-badge" style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.4)' }}>
              <span className="pulse-dot-orange"></span>
              Traffic Re-Routed
            </div>
          </div>
        </div>
      )}

      {/* METRICS CARDS */}
      <section className="metrics-grid">
        {/* Card 1: Total Revenue */}
        <div className="metric-card">
          <div className="card-header">
            <span>Total Revenue Processed</span>
            <DollarSign size={20} className="text-blue" />
          </div>
          <div className="card-value">₹{stats.total_revenue ? stats.total_revenue.toLocaleString() : 0}</div>
          <div className="card-footer">
            <span className="text-success">From {stats.total_transactions} transactions</span>
          </div>
        </div>

        {/* Card 2: Revenue Saved by AI */}
        <div className="metric-card" style={{ borderColor: healing.revenue_saved > 0 ? 'rgba(16, 185, 129, 0.5)' : '', boxShadow: healing.revenue_saved > 0 ? '0 0 20px rgba(16, 185, 129, 0.1)' : '' }}>
          <div className="card-header">
            <span>AI Revenue Recovered</span>
            <TrendingUp size={20} className="text-success" />
          </div>
          <div className="card-value text-success">
            ₹{healing.revenue_saved ? healing.revenue_saved.toLocaleString() : 0}
          </div>
          <div className="card-footer">
            <span className="text-slate">Rescued via Smart Routing</span>
          </div>
        </div>

        {/* Card 3: Active Gateways */}
        <div className="metric-card">
          <div className="card-header">
            <span>Active Gateways</span>
            <CreditCard size={20} className="text-blue" />
          </div>
          <div className="card-value">
            {healing.active_gateways ? healing.active_gateways.length : 0} <span style={{ fontSize: '14px', color: '#94a3b8' }}>/ 3</span>
          </div>
          <div className="card-footer">
            <span className="text-success">{healing.active_gateways ? healing.active_gateways.join(', ') : ''}</span>
          </div>
        </div>

        {/* Card 4: Security Status */}
        <div className={`metric-card alert-card ${suspiciousCount > 0 ? 'critical-glow' : 'safe-glow'}`}>
          <div className="card-header">
            <span>Fraud Prevention</span>
            {suspiciousCount > 0 ? <ShieldAlert size={20} className="text-danger animate-pulse" /> : <ShieldCheck size={20} className="text-success" />}
          </div>
          <div className="card-value">
            {suspiciousCount > 0 ? `${suspiciousCount} Attack(s)` : 'Secure'}
          </div>
          <div className="card-footer">
            {suspiciousCount > 0 ? <span className="text-danger">Fraud IPs Blocked</span> : <span className="text-success">No anomalies detected</span>}
          </div>
        </div>
      </section>

      {/* GATEWAY HEALTH SECTION */}
      <section className="security-logs-section">
        <div className="section-title">
          <Activity size={16} className="text-blue" />
          <span>Real-Time Gateway Health Monitor</span>
        </div>
        <div className="table-wrapper">
          {healing.gateway_health && healing.gateway_health.length > 0 ? (
            <table className="logs-table">
              <thead>
                <tr>
                  <th>Gateway Provider</th>
                  <th>Success Rate (AI Window)</th>
                  <th>Avg Latency</th>
                  <th>AI Routing Status</th>
                </tr>
              </thead>
              <tbody>
                {healing.gateway_health.map((gw, idx) => (
                  <tr key={idx} style={{ opacity: gw.is_active ? 1 : 0.6 }}>
                    <td><span className="ip-badge" style={{ backgroundColor: gw.is_active ? '' : 'rgba(239, 68, 68, 0.1)', color: gw.is_active ? '' : '#ef4444' }}>{gw.name}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '100px', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${gw.success_rate}%`, height: '100%', background: gw.success_rate < 75 ? '#f55b5b' : '#00ca72' }}></div>
                        </div>
                        <span className={gw.success_rate < 75 ? 'text-danger font-bold' : 'text-success font-bold'}>{gw.success_rate}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={gw.latency_ms > 1000 ? 'text-warning font-bold' : ''}>{gw.latency_ms} ms</span>
                    </td>
                    <td>
                      {gw.status === 'Healthy' ? (
                         <span className="badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>Active</span>
                      ) : (
                         <span className="badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>Disabled (Re-routing)</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-security">
              <CreditCard size={40} className="text-slate mb-2" />
              <p>No transaction data available yet. Start the simulator.</p>
            </div>
          )}
        </div>
      </section>

      {/* CHARTS CONTAINER */}
      <section className="charts-grid">
        <div className="chart-card">
          <h3>Transaction Status Breakdown</h3>
          <div className="chart-wrapper">
            {statusChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusChartData}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#0d2366' }} labelStyle={{ color: '#0d2366' }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {statusChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="no-data">No traffic logs found.</div>}
          </div>
        </div>

        <div className="chart-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3>Fraud Prevention Logs</h3>
          <div className="table-wrapper" style={{ flex: 1 }}>
            {suspiciousCount > 0 ? (
              <table className="logs-table">
                <thead><tr><th>Attacking IP</th><th>Status</th></tr></thead>
                <tbody>
                  {Object.entries(security.suspicious_ips).map(([ip, count]) => (
                    <tr key={ip}>
                      <td><span className="ip-badge">{ip}</span></td>
                      <td><span className="badge badge-danger">Blocked by AI</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-security" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <ShieldCheck size={40} className="text-success mb-2" />
                <p>No fraud spikes detected.</p>
              </div>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
