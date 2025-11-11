import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const StatCard = ({ 
  title, 
  value, 
  icon, 
  change, 
  className,
  gradient = false,
  color = "primary"
}) => {
  const colorStyles = {
    primary: "text-primary",
    success: "text-success",
    warning: "text-warning", 
    error: "text-error",
    info: "text-info"
  };

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md",
      gradient && "bg-gradient-to-br from-white to-gray-50",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <ApperIcon 
          name={icon} 
          className={cn("h-5 w-5", colorStyles[color])}
        />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {change && (
          <p className="text-xs text-gray-500 mt-1">
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;