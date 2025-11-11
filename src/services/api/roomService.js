import roomData from "@/services/mockData/rooms.json";

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory storage to persist changes during session
let rooms = [...roomData];

const roomService = {
  async getAll() {
    await delay(300);
    return [...rooms];
  },

  async getById(id) {
    await delay(200);
    const room = rooms.find(room => room.Id === id);
    if (!room) {
      throw new Error(`Room with Id ${id} not found`);
    }
    return { ...room };
  },

  async create(roomData) {
    await delay(400);
    const newRoom = {
      Id: Math.max(...rooms.map(r => r.Id)) + 1,
      ...roomData,
      lastCleaned: new Date().toISOString()
    };
    rooms.push(newRoom);
    return { ...newRoom };
  },

  async update(id, updatedData) {
    await delay(350);
    const index = rooms.findIndex(room => room.Id === id);
    if (index === -1) {
      throw new Error(`Room with Id ${id} not found`);
    }
    rooms[index] = { ...rooms[index], ...updatedData };
    return { ...rooms[index] };
  },

  async delete(id) {
    await delay(300);
    const index = rooms.findIndex(room => room.Id === id);
    if (index === -1) {
      throw new Error(`Room with Id ${id} not found`);
    }
    const deletedRoom = rooms[index];
    rooms.splice(index, 1);
    return { ...deletedRoom };
  }
};

export default roomService;