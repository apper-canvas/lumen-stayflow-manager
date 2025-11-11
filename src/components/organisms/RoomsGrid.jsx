import { useState, useEffect } from "react";
import RoomCard from "@/components/molecules/RoomCard";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import roomService from "@/services/api/roomService";
import { toast } from "react-toastify";

const RoomsGrid = ({ selectedFloor, statusFilter }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRooms = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await roomService.getAll();
      setRooms(data);
    } catch (err) {
      setError(err.message || "Failed to load rooms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const handleStatusChange = async (roomId, newStatus) => {
    try {
      const room = rooms.find(r => r.Id === roomId);
      if (!room) return;

      const updatedRoom = { ...room, status: newStatus };
      await roomService.update(roomId, updatedRoom);
      
      setRooms(rooms.map(r => r.Id === roomId ? updatedRoom : r));
      toast.success(`Room ${room.number} status updated to ${newStatus}`);
    } catch (err) {
      toast.error("Failed to update room status");
    }
  };

  const handleRoomClick = (room) => {
    // Handle room selection/detail view
    console.log("Room selected:", room);
  };

  if (loading) return <Loading />;
  if (error) return <ErrorView message={error} onRetry={loadRooms} />;

  // Filter rooms by floor and status
  let filteredRooms = rooms;
  if (selectedFloor !== "all") {
    filteredRooms = filteredRooms.filter(room => room.floor === parseInt(selectedFloor));
  }
  if (statusFilter !== "all") {
    filteredRooms = filteredRooms.filter(room => room.status === statusFilter);
  }

  if (filteredRooms.length === 0) {
    return (
      <Empty
        title="No rooms found"
        description="No rooms match the current filters."
        icon="Bed"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredRooms.map((room) => (
        <RoomCard
          key={room.Id}
          room={room}
          onClick={() => handleRoomClick(room)}
          onStatusChange={handleStatusChange}
        />
      ))}
    </div>
  );
};

export default RoomsGrid;