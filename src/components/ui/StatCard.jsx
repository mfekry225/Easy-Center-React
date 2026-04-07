// مكوّن بطاقة الإحصاء — يُستخدم في الداشبورد وباقي الصفحات

export default function StatCard({ label, value, sub, color = '' }) {
  return (
    <div className={`stat-card ${color}`}>
      <div className="lb">{label}</div>
      <div className="vl">{value}</div>
      {sub && <div className="sb">{sub}</div>}
    </div>
  );
}
