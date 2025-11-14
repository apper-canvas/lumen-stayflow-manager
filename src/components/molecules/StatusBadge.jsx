import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const StatusBadge = ({ status, className, showIcon = true }) => {
  const statusConfig = {
    available: {
      variant: "success",
      label: "Available",
      icon: "CheckCircle"
    },
    occupied: {
      variant: "info", 
      label: "Occupied",
      icon: "User"
    },
    cleaning: {
      variant: "warning",
      label: "Cleaning", 
      icon: "Sparkles"
    },
    maintenance: {
      variant: "error",
      label: "Maintenance",
      icon: "AlertTriangle"
    },
    confirmed: {
      variant: "success",
      label: "Confirmed",
      icon: "CheckCircle"
    },
    pending: {
      variant: "warning",
      label: "Pending",
      icon: "Clock"
    },
    cancelled: {
      variant: "error",
      label: "Cancelled", 
      icon: "XCircle"
    },
    checkedin: {
      variant: "info",
      label: "Checked In",
      icon: "LogIn"
    },
    checkedout: {
      variant: "secondary",
label: "Checked Out",
      icon: "LogOut"
    },
    paid: {
      variant: "success",
      label: "Paid",
      icon: "CheckCircle"
    },
    partial: {
      variant: "warning", 
      label: "Partial",
      icon: "AlertCircle"
    },
    unpaid: {
      variant: "destructive",
      label: "Unpaid",
      icon: "Clock"
    },
    overdue: {
      variant: "error",
      label: "Overdue",
      icon: "AlertTriangle"
    },
    completed: {
      variant: "success",
      label: "Completed",
      icon: "CheckCircle"
    },
    inprogress: {
      variant: "info",
      label: "In Progress",
      icon: "Play"
    },
    todo: {
      variant: "secondary",
      label: "To Do",
      icon: "Circle"
    }
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Badge variant={config.variant} className={cn("gap-1", className)}>
      {showIcon && <ApperIcon name={config.icon} className="h-3 w-3" />}
      {config.label}
    </Badge>
  );
};

export default StatusBadge;