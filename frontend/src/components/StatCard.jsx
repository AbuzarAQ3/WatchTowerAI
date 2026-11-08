import './StatCard.css'

/**
 * StatCard — Dashboard metric tile
 * @param {string}  label      — metric name
 * @param {string}  value      — primary numeric/text value
 * @param {string}  sub        — secondary context line
 * @param {ReactNode} icon     — lucide icon element
 * @param {'amber'|'cyan'|'success'|'danger'|'info'} accent
 * @param {string}  trend      — e.g. "+12% today"
 */
export default function StatCard({ label, value, sub, icon, accent = 'amber', trend }) {
  return (
    <div className={`stat-card stat-card--${accent}`}>
      <div className="stat-card-header">
        <div className={`stat-card-icon stat-card-icon--${accent}`}>
          {icon}
        </div>
        {trend && (
          <span className="stat-card-trend">{trend}</span>
        )}
      </div>

      <div className="stat-card-body">
        <p className="stat-card-value">{value}</p>
        <p className="stat-card-label">{label}</p>
        {sub && <p className="stat-card-sub">{sub}</p>}
      </div>
    </div>
  )
}
