import { cn } from "@/utils/cn";
import Input from "@/components/atoms/Input";

const FormField = ({ 
  label, 
  id, 
  error, 
  className, 
  children, 
  required = false,
  ...props 
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label 
          htmlFor={id} 
          className="text-sm font-medium text-gray-700 block"
        >
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      {children || <Input id={id} {...props} />}
      {error && (
        <p className="text-sm text-error">{error}</p>
      )}
    </div>
  );
};

export default FormField;