import { ProgressBar } from '../../../shared/components/ui'

interface AttendanceChartProps {
  rate: number
  label?: string
}

/** حلقة نسبة الحضور — بيانات حقيقية فقط (لا أعمدة أسبوعية مُختلقة) */
export const AttendanceChart = ({ rate, label = 'نسبة الحضور' }: AttendanceChartProps) => {
  const size = 104
  const radius = 42
  const strokeWidth = 8
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (rate / 100) * circumference
  const center = size / 2

  const getStrokeColor = (r: number) => {
    if (r >= 80) return 'var(--bg-success)'
    if (r >= 50) return 'var(--bg-info)'
    return 'var(--bg-error)'
  }

  const getStatusText = (r: number) => {
    if (r >= 80) return { label: 'حضور ممتاز', hint: 'أداء متميز، استمر!' }
    if (r >= 50) return { label: 'حضور متوسط', hint: 'يمكن تحسينه بالمتابعة' }
    return { label: 'حضور منخفض', hint: 'يحتاج إلى اهتمام' }
  }

  const status = getStatusText(rate)

  return (
    <div>
      <h3 className="mb-4 text-sm font-black text-main dark:text-main">{label}</h3>
      <div className="flex items-center gap-5">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          role="img"
          aria-label={`${label}: ${rate}%`}
          className="shrink-0"
        >
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={getStrokeColor(rate)}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${center} ${center})`}
            className="transition-all duration-1000"
          />
          <text
            x={center}
            y={center - 5}
            textAnchor="middle"
            dominantBaseline="central"
            fill={getStrokeColor(rate)}
            className="text-xl font-black"
          >
            {rate}%
          </text>
          <text
            x={center}
            y={center + 15}
            textAnchor="middle"
            dominantBaseline="central"
            fill="var(--text-muted)"
            className="text-micro font-medium"
          >
            حضور
          </text>
        </svg>

        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-sm font-bold text-main dark:text-main">{status.label}</p>
          <ProgressBar
            value={rate}
            variant={rate >= 80 ? 'success' : rate >= 50 ? 'info' : 'error'}
          />
          <p className="text-micro font-medium text-dim dark:text-dim">{status.hint}</p>
        </div>
      </div>
    </div>
  )
}
