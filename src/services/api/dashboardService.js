import roomData from "@/services/mockData/rooms.json";
import reservationData from "@/services/mockData/reservations.json";

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getRoomStats = async () => {
  await delay(300);
  
  const totalRooms = roomData.length;
  const availableRooms = roomData.filter(room => room.status === "available").length;
  const occupiedRooms = roomData.filter(room => room.status === "occupied").length;
  const occupancyRate = Math.round((occupiedRooms / totalRooms) * 100);
  
  return {
    totalRooms,
    availableRooms,
    occupiedRooms,
    occupancyRate
  };
};

export const getReservationStats = async () => {
  await delay(250);
  
  const today = new Date().toISOString().split("T")[0];
const checkInsToday = reservationData.filter(r => 
    r.checkIn && r.checkIn.startsWith(today) && r.status === "confirmed"
  ).length;
  
  // Calculate today's revenue (simplified)
  const todayRevenue = reservationData
.filter(r => r.checkIn && r.checkIn.startsWith(today))
    .reduce((sum, r) => sum + r.totalAmount, 0);
  
  return {
    checkInsToday,
    todayRevenue
  };
};