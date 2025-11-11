import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const ErrorView = ({ 
  message = "Something went wrong", 
  onRetry, 
  className,
  showRetry = true 
}) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-8 text-center min-h-64",
      className
    )}>
      <div className="bg-error/10 rounded-full p-3 mb-4">
        <ApperIcon name="AlertTriangle" className="h-8 w-8 text-error" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Oops! An error occurred</h3>
      <p className="text-gray-600 mb-6 max-w-md">{message}</p>
      {showRetry && onRetry && (
        <Button onClick={onRetry} variant="primary">
          <ApperIcon name="RefreshCw" className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      )}
    </div>
  );
};

export default ErrorView;