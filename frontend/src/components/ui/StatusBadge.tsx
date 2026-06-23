import { cn } from '../../lib/utils'

interface StatusBadgeProps {
  status: string
  className?: string
}

const statusConfig: Record<string, { color: string; label: string }> = {
  PENDING: { color: 'bg-warning/20 text-warning border-warning/30', label: 'Pending' },
  ACCEPTED: { color: 'bg-primary/20 text-primary border-primary/30', label: 'Accepted' },
  PREPARING: { color: 'bg-secondary/20 text-secondary border-secondary/30', label: 'Preparing' },
  READY: { color: 'bg-success/20 text-success border-success/30', label: 'Ready' },
  OUT_FOR_DELIVERY: { color: 'bg-primary/20 text-primary border-primary/30', label: 'Out for Delivery' },
  DELIVERED: { color: 'bg-success/20 text-success border-success/30', label: 'Delivered' },
  CANCELLED: { color: 'bg-danger/20 text-danger border-danger/30', label: 'Cancelled' },
  ACTIVE: { color: 'bg-success/20 text-success border-success/30', label: 'Active' },
  INACTIVE: { color: 'bg-white/10 text-white/60 border-white/10', label: 'Inactive' },
  APPROVED: { color: 'bg-success/20 text-success border-success/30', label: 'Approved' },
  REJECTED: { color: 'bg-danger/20 text-danger border-danger/30', label: 'Rejected' },
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const config = statusConfig[status] || statusConfig.PENDING
  
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
      config.color,
      className
    )}>
      {config.label}
    </span>
  )
}