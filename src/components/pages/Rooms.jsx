import { useState } from "react";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import RoomsGrid from "@/components/organisms/RoomsGrid";
import ApperIcon from "@/components/ApperIcon";

const Rooms = () => {
  const [selectedFloor, setSelectedFloor] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rooms</h1>
          <p className="text-gray-600 mt-1">Manage room status and availability</p>
        </div>
        <Button>
          <ApperIcon name="Settings" className="h-4 w-4 mr-2" />
          Room Settings
        </Button>
      </div>

      {/* Room Status Legend */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Room Status Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-success rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">Available</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-info rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">Occupied</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-warning rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">Cleaning</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-error rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">Maintenance</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="sm:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Floor
            </label>
            <Select
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
            >
              <option value="all">All Floors</option>
              <option value="1">Floor 1</option>
              <option value="2">Floor 2</option>
              <option value="3">Floor 3</option>
              <option value="4">Floor 4</option>
              <option value="5">Floor 5</option>
            </Select>
          </div>
          
          <div className="sm:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="cleaning">Cleaning</option>
              <option value="maintenance">Maintenance</option>
            </Select>
          </div>

          <div className="flex items-end gap-2">
            <Button variant="outline">
              <ApperIcon name="RefreshCw" className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline">
              <ApperIcon name="Download" className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-success to-green-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Available</p>
              <p className="text-3xl font-bold">24</p>
            </div>
            <ApperIcon name="CheckCircle" className="h-8 w-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-info to-blue-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Occupied</p>
              <p className="text-3xl font-bold">18</p>
            </div>
            <ApperIcon name="Users" className="h-8 w-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-warning to-yellow-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100">Cleaning</p>
              <p className="text-3xl font-bold">6</p>
            </div>
            <ApperIcon name="Sparkles" className="h-8 w-8 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-error to-red-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100">Maintenance</p>
              <p className="text-3xl font-bold">2</p>
            </div>
            <ApperIcon name="AlertTriangle" className="h-8 w-8 text-red-200" />
          </div>
        </div>
      </div>

      {/* Rooms Grid */}
      <RoomsGrid 
        selectedFloor={selectedFloor}
        statusFilter={statusFilter}
      />
    </div>
  );
};

export default Rooms;