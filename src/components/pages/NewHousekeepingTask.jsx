import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Card } from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import FormField from '@/components/molecules/FormField';
import ApperIcon from '@/components/ApperIcon';
import Loading from '@/components/ui/Loading';
import ErrorView from '@/components/ui/ErrorView';
import { taskService } from '@/services/api/taskService';
import roomService from '@/services/api/roomService';

export default function NewHousekeepingTask() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [rooms, setRooms] = useState([]);
  
  const [formData, setFormData] = useState({
    roomId: '',
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    estimatedDuration: '',
    notes: ''
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const roomsData = await roomService.getAll();
      setRooms(roomsData);
    } catch (err) {
      setError('Failed to load rooms. Please try again.');
      console.error('Error loading rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.roomId) {
      errors.roomId = 'Room selection is required';
    }

    if (!formData.title.trim()) {
      errors.title = 'Task title is required';
    } else if (formData.title.trim().length < 3) {
      errors.title = 'Task title must be at least 3 characters';
    }

    if (!formData.description.trim()) {
      errors.description = 'Task description is required';
    } else if (formData.description.trim().length < 10) {
      errors.description = 'Task description must be at least 10 characters';
    }

    if (formData.estimatedDuration && (isNaN(formData.estimatedDuration) || formData.estimatedDuration <= 0)) {
      errors.estimatedDuration = 'Estimated duration must be a positive number';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please correct the errors in the form');
      return;
    }

    try {
      setSubmitting(true);
      
      const taskData = {
        ...formData,
        estimatedDuration: formData.estimatedDuration ? parseInt(formData.estimatedDuration) : null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await taskService.create(taskData);
      
      toast.success('Housekeeping task created successfully!');
      navigate('/housekeeping');
    } catch (err) {
      toast.error('Failed to create task. Please try again.');
      console.error('Error creating task:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const priorityOptions = [
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  if (loading) {
    return <Loading className="min-h-screen" />;
  }

  if (error) {
    return (
      <ErrorView 
        message={error}
        onRetry={loadRooms}
        className="min-h-screen"
      />
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="secondary"
            onClick={() => navigate('/housekeeping')}
            className="flex items-center gap-2"
          >
            <ApperIcon name="ArrowLeft" className="h-4 w-4" />
            Back to Housekeeping
          </Button>
        </div>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <ApperIcon name="Plus" className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-gray-900">Create New Housekeeping Task</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField
              label="Room"
              error={formErrors.roomId}
              required
            >
              <Select
                name="roomId"
                value={formData.roomId}
                onChange={handleInputChange}
                error={!!formErrors.roomId}
              >
                <option value="">Select a room</option>
                {rooms.map(room => (
                  <option key={room.Id} value={room.Id}>
                    {room.number} - {room.type}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField
              label="Task Title"
              error={formErrors.title}
              required
            >
              <Input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Deep clean bathroom"
                error={!!formErrors.title}
              />
            </FormField>

            <FormField
              label="Description"
              error={formErrors.description}
              required
            >
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Detailed description of the task..."
                rows={4}
                className={`input-field ${formErrors.description ? 'border-error' : ''}`}
              />
            </FormField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Priority">
                <Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                >
                  {priorityOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField label="Status">
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormField>
            </div>

            <FormField
              label="Estimated Duration (minutes)"
              error={formErrors.estimatedDuration}
            >
              <Input
                type="number"
                name="estimatedDuration"
                value={formData.estimatedDuration}
                onChange={handleInputChange}
                placeholder="e.g., 60"
                min="1"
                error={!!formErrors.estimatedDuration}
              />
            </FormField>

            <FormField label="Additional Notes">
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Any additional notes or special instructions..."
                rows={3}
                className="input-field"
              />
            </FormField>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating Task...
                  </>
                ) : (
                  <>
                    <ApperIcon name="Plus" className="h-4 w-4" />
                    Create Task
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/housekeeping')}
                disabled={submitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}