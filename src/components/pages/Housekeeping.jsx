import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card";
import { toast } from "react-toastify";
import { format } from "date-fns";
import housekeepingService from "@/services/api/housekeepingService";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import StatusBadge from "@/components/molecules/StatusBadge";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";

const Housekeeping = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await housekeepingService.getAll();
      setTasks(data);
    } catch (err) {
      setError(err.message || "Failed to load housekeeping tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      const task = tasks.find(t => t.Id === taskId);
      if (!task) return;

      const updatedTask = { 
        ...task, 
        status: newStatus,
        completedAt: newStatus === "completed" ? new Date().toISOString() : null
      };
      
      await housekeepingService.update(taskId, updatedTask);
      setTasks(tasks.map(t => t.Id === taskId ? updatedTask : t));
      toast.success(`Task ${newStatus === "completed" ? "completed" : "updated"}`);
    } catch (err) {
      toast.error("Failed to update task");
    }
  };

  const handlePriorityUpdate = async (taskId, newPriority) => {
    try {
      const task = tasks.find(t => t.Id === taskId);
      if (!task) return;

      const updatedTask = { ...task, priority: newPriority };
      await housekeepingService.update(taskId, updatedTask);
      setTasks(tasks.map(t => t.Id === taskId ? updatedTask : t));
      toast.success("Priority updated");
    } catch (err) {
      toast.error("Failed to update priority");
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorView message={error} onRetry={loadTasks} />;

  // Filter tasks
  let filteredTasks = tasks;
  if (statusFilter !== "all") {
    filteredTasks = filteredTasks.filter(task => task.status === statusFilter);
  }
  if (priorityFilter !== "all") {
    filteredTasks = filteredTasks.filter(task => task.priority === priorityFilter);
  }

  // Group tasks by status
  const todoTasks = filteredTasks.filter(t => t.status === "todo");
  const inProgressTasks = filteredTasks.filter(t => t.status === "inprogress");
  const completedTasks = filteredTasks.filter(t => t.status === "completed");

  const TaskCard = ({ task }) => {
    const priorityColors = {
      low: "border-l-green-500",
      medium: "border-l-yellow-500",
      high: "border-l-red-500"
    };

    return (
      <Card className={`border-l-4 ${priorityColors[task.priority]} mb-4`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-gray-900">{task.taskType}</h3>
              <p className="text-sm text-gray-600">Room {task.roomNumber}</p>
              {task.assignedTo && (
                <p className="text-sm text-gray-500">Assigned to: {task.assignedTo}</p>
              )}
            </div>
            <div className="flex gap-2">
              <StatusBadge status={task.status} />
              <StatusBadge 
                status={task.priority} 
                className={`${
                  task.priority === "high" ? "bg-red-100 text-red-800" :
                  task.priority === "medium" ? "bg-yellow-100 text-yellow-800" :
                  "bg-green-100 text-green-800"
                }`}
              />
            </div>
          </div>

          {task.notes && (
            <p className="text-sm text-gray-600 mb-3">{task.notes}</p>
          )}

          <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
            <span>Scheduled: {format(new Date(task.scheduledFor), "MMM dd, HH:mm")}</span>
            {task.completedAt && (
              <span>Completed: {format(new Date(task.completedAt), "MMM dd, HH:mm")}</span>
            )}
          </div>

          <div className="flex gap-2">
            {task.status === "todo" && (
              <Button 
                size="sm" 
                onClick={() => handleStatusUpdate(task.Id, "inprogress")}
              >
                <ApperIcon name="Play" className="h-3 w-3 mr-1" />
                Start
              </Button>
            )}
            {task.status === "inprogress" && (
              <Button 
                size="sm" 
                variant="success"
                onClick={() => handleStatusUpdate(task.Id, "completed")}
              >
                <ApperIcon name="CheckCircle" className="h-3 w-3 mr-1" />
                Complete
              </Button>
            )}
            <Select
              value={task.priority}
              onChange={(e) => handlePriorityUpdate(task.Id, e.target.value)}
              className="text-sm"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </Select>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Housekeeping</h1>
          <p className="text-gray-600 mt-1">Manage room cleaning and maintenance tasks</p>
        </div>
<Button onClick={() => {
          navigate('/housekeeping/new');
          toast.success('Opening new task form...');
        }}>
          <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-gray-500 to-gray-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-200">To Do</p>
              <p className="text-3xl font-bold">{todoTasks.length}</p>
            </div>
            <ApperIcon name="Circle" className="h-8 w-8 text-gray-300" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-info to-blue-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200">In Progress</p>
              <p className="text-3xl font-bold">{inProgressTasks.length}</p>
            </div>
            <ApperIcon name="Play" className="h-8 w-8 text-blue-300" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-success to-green-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200">Completed</p>
              <p className="text-3xl font-bold">{completedTasks.length}</p>
            </div>
            <ApperIcon name="CheckCircle" className="h-8 w-8 text-green-300" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-error to-red-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-200">High Priority</p>
              <p className="text-3xl font-bold">{tasks.filter(t => t.priority === "high").length}</p>
            </div>
            <ApperIcon name="AlertTriangle" className="h-8 w-8 text-red-300" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="sm:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status Filter
            </label>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="todo">To Do</option>
              <option value="inprogress">In Progress</option>
              <option value="completed">Completed</option>
            </Select>
          </div>
          
          <div className="sm:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority Filter
            </label>
            <Select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </Select>
          </div>

          <div className="flex items-end gap-2">
            <Button variant="outline">
              <ApperIcon name="RefreshCw" className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Task Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* To Do Column */}
        <div>
          <div className="bg-gray-100 p-4 rounded-lg mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <ApperIcon name="Circle" className="h-5 w-5" />
              To Do ({todoTasks.length})
            </h2>
          </div>
          {todoTasks.length === 0 ? (
            <Empty
              title="No pending tasks"
              description="All tasks are either in progress or completed"
              icon="CheckCircle"
            />
          ) : (
            <div>
              {todoTasks.map(task => <TaskCard key={task.Id} task={task} />)}
            </div>
          )}
        </div>

        {/* In Progress Column */}
        <div>
          <div className="bg-blue-100 p-4 rounded-lg mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <ApperIcon name="Play" className="h-5 w-5" />
              In Progress ({inProgressTasks.length})
            </h2>
          </div>
          {inProgressTasks.length === 0 ? (
            <Empty
              title="No active tasks"
              description="No tasks are currently in progress"
              icon="Play"
            />
          ) : (
            <div>
              {inProgressTasks.map(task => <TaskCard key={task.Id} task={task} />)}
            </div>
          )}
        </div>

        {/* Completed Column */}
        <div>
          <div className="bg-green-100 p-4 rounded-lg mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <ApperIcon name="CheckCircle" className="h-5 w-5" />
              Completed ({completedTasks.length})
            </h2>
          </div>
          {completedTasks.length === 0 ? (
            <Empty
              title="No completed tasks"
              description="Completed tasks will appear here"
              icon="CheckCircle"
            />
          ) : (
            <div>
              {completedTasks.map(task => <TaskCard key={task.Id} task={task} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Housekeeping;