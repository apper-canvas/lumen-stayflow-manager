import { useState } from "react";
import Input from "@/components/atoms/Input";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const SearchBar = ({ 
  placeholder = "Search...", 
  onSearch, 
  className,
  showButton = true 
}) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch?.(query);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (!showButton) {
      onSearch?.(value);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("relative flex", className)}>
      <div className="relative flex-1">
        <ApperIcon 
          name="Search" 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
        />
        <Input
          value={query}
          onChange={handleChange}
          placeholder={placeholder}
          className="pl-9 pr-4"
        />
      </div>
      {showButton && (
        <button
          type="submit"
          className="ml-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors duration-150"
        >
          <ApperIcon name="Search" className="h-4 w-4" />
        </button>
      )}
    </form>
  );
};

export default SearchBar;