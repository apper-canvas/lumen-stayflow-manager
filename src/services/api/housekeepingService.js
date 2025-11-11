import housekeepingData from "@/services/mockData/housekeeping.json";

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory storage to persist changes during session
let tasks = [...housekeepingData];

const housekeepingService = {
  async getAll() {
    await delay(300);
    return [...tasks];
  },

  async getById(id) {
    await delay(200);
    const task = tasks.find(task => task.Id === id);
    if (!task) {
      throw new Error(`Task with Id ${id} not found`);
    }
    return { ...task };
  },

  async create(taskData) {
    await delay(400);
    const newTask = {
      Id: Math.max(...tasks.map(t => t.Id)) + 1,
      ...taskData,
      status: "todo",
      scheduledFor: new Date().toISOString(),
      completedAt: null
    };
    tasks.push(newTask);
    return { ...newTask };
  },

  async update(id, updatedData) {
    await delay(350);
    const index = tasks.findIndex(task => task.Id === id);
    if (index === -1) {
      throw new Error(`Task with Id ${id} not found`);
    }
    tasks[index] = { ...tasks[index], ...updatedData };
    return { ...tasks[index] };
  },

  async delete(id) {
    await delay(300);
    const index = tasks.findIndex(task => task.Id === id);
    if (index === -1) {
      throw new Error(`Task with Id ${id} not found`);
    }
    const deletedTask = tasks[index];
    tasks.splice(index, 1);
    return { ...deletedTask };
  }
};

export default housekeepingService;