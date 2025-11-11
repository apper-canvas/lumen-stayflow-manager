import { forwardRef } from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const Select = forwardRef(({ className, children, ...props }, ref) => (
  <div className="relative">
    <select
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-150 appearance-none",
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </select>
    <ApperIcon 
      name="ChevronDown" 
      className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none"
    />
  </div>
));

Select.displayName = "Select";

export default Select;