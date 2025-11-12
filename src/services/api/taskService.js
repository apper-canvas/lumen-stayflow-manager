import mockTasks from '@/services/mockData/tasks.json';

class TaskService {
  constructor() {
    this.tasks = [...mockTasks];
    this.nextId = this.getNextId();
  }

  getNextId() {
    return this.tasks.length > 0 ? Math.max(...this.tasks.map(t => t.Id)) + 1 : 1;
  }

  async getAll() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    return [...this.tasks];
  }

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('Invalid task ID');
    }
    
    const task = this.tasks.find(t => t.Id === id);
    if (!task) {
      throw new Error(`Task with ID ${id} not found`);
    }
    
    return { ...task };
  }

  async create(taskData) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (!taskData || typeof taskData !== 'object') {
      throw new Error('Invalid task data');
    }

    const requiredFields = ['roomId', 'title', 'description'];
    for (const field of requiredFields) {
      if (!taskData[field] || !taskData[field].toString().trim()) {
        throw new Error(`${field} is required`);
      }
    }

    const newTask = {
      Id: this.nextId++,
      roomId: parseInt(taskData.roomId),
      title: taskData.title.trim(),
      description: taskData.description.trim(),
      priority: taskData.priority || 'medium',
      status: taskData.status || 'pending',
      estimatedDuration: taskData.estimatedDuration || null,
      notes: taskData.notes || '',
      createdAt: taskData.createdAt || new Date().toISOString(),
      updatedAt: taskData.updatedAt || new Date().toISOString(),
      completedAt: null
    };

    this.tasks.push(newTask);
    return { ...newTask };
  }

  async update(id, updateData) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('Invalid task ID');
    }

    const taskIndex = this.tasks.findIndex(t => t.Id === id);
    if (taskIndex === -1) {
      throw new Error(`Task with ID ${id} not found`);
    }

    if (!updateData || typeof updateData !== 'object') {
      throw new Error('Invalid update data');
    }

    const updatedTask = {
      ...this.tasks[taskIndex],
      ...updateData,
      Id: id, // Prevent ID changes
      updatedAt: new Date().toISOString()
    };

    // Set completedAt when status changes to completed
    if (updateData.status === 'completed' && this.tasks[taskIndex].status !== 'completed') {
      updatedTask.completedAt = new Date().toISOString();
    }

    // Clear completedAt if status changes from completed
    if (updateData.status && updateData.status !== 'completed') {
      updatedTask.completedAt = null;
    }

    this.tasks[taskIndex] = updatedTask;
    return { ...updatedTask };
  }

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('Invalid task ID');
    }

    const taskIndex = this.tasks.findIndex(t => t.Id === id);
    if (taskIndex === -1) {
      throw new Error(`Task with ID ${id} not found`);
    }

    const deletedTask = { ...this.tasks[taskIndex] };
    this.tasks.splice(taskIndex, 1);
    return deletedTask;
  }

  async getByRoomId(roomId) {
    await new Promise(resolve => setTimeout(resolve, 150));
    
    if (!Number.isInteger(roomId) || roomId <= 0) {
      throw new Error('Invalid room ID');
    }

    return this.tasks.filter(t => t.roomId === roomId).map(t => ({ ...t }));
  }

  async getByStatus(status) {
    await new Promise(resolve => setTimeout(resolve, 150));
    
    if (!status || typeof status !== 'string') {
      throw new Error('Invalid status');
    }

    return this.tasks.filter(t => t.status === status).map(t => ({ ...t }));
  }
}

export const taskService = new TaskService();