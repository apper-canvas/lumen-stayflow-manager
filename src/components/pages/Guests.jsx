import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card";
import { format } from "date-fns";
import { toast } from "react-toastify";
import guestService from "@/services/api/guestService";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import SearchBar from "@/components/molecules/SearchBar";
import FormField from "@/components/molecules/FormField";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import Badge from "@/components/atoms/Badge";
import GuestProfileEditor from "@/components/organisms/GuestProfileEditor";
const Guests = () => {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
const [selectedGuest, setSelectedGuest] = useState(null);
const [editingGuest, setEditingGuest] = useState(null);
const [isEditorOpen, setIsEditorOpen] = useState(false);
const [showDetailsModal, setShowDetailsModal] = useState(false);
const loadGuests = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await guestService.getAll();
      setGuests(data);
    } catch (err) {
      setError(err.message || "Failed to load guests");
    } finally {
      setLoading(false);
    }
  };

  const handleEditGuest = (guest) => {
    setEditingGuest({ ...guest });
setIsEditorOpen(true);
  };

  const handleAddGuest = () => {
    setEditingGuest({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      nationality: '',
      dateOfBirth: '',
      idType: '',
      idNumber: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      allergies: [],
      stayNotes: ''
    });
    setIsEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setEditingGuest(null);
  };

const handleSaveGuest = async (updatedGuest) => {
    try {
      if (updatedGuest.Id) {
        // Update existing guest
        await guestService.update(updatedGuest.Id, updatedGuest);
        toast.success("Guest profile updated successfully");
      } else {
        // Create new guest
        await guestService.create(updatedGuest);
        toast.success("Guest created successfully");
      }
      await loadGuests();
      handleCloseEditor();
    } catch (error) {
      const action = updatedGuest.Id ? "update" : "create";
      toast.error(error.message || `Failed to ${action} guest`);
    }
  };

  const handleViewGuest = (guest) => {
    setSelectedGuest(guest);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedGuest(null);
  };

  useEffect(() => {
    loadGuests();
  }, []);

  const filteredGuests = guests.filter(guest =>
    guest.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guest.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guest.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guest.phone.includes(searchQuery)
  );

  if (loading) return <Loading />;
  if (error) return <ErrorView message={error} onRetry={loadGuests} />;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Guests</h1>
          <p className="text-gray-600 mt-1">Manage guest profiles and information</p>
        </div>
<Button onClick={handleAddGuest}>
          <ApperIcon name="UserPlus" className="h-4 w-4 mr-2" />
          Add Guest
        </Button>
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <SearchBar
            placeholder="Search guests by name, email, or phone..."
            onSearch={setSearchQuery}
            showButton={false}
          />
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{guests.length}</div>
            <div className="text-sm text-gray-600">Total Guests</div>
          </div>
        </div>
      </div>

      {/* Guests Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {filteredGuests.length === 0 ? (
            <Empty
              title="No guests found"
              description="No guests match your search criteria."
              icon="Users"
            />
          ) : (
            <div className="space-y-4">
{filteredGuests.map((guest) => (
                <Card 
                  key={guest.Id} 
                  className="cursor-pointer transition-all duration-200 hover:shadow-card-hover"
                  onClick={() => handleViewGuest(guest)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-primary/10 rounded-full p-3">
                          <ApperIcon name="User" className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {guest.firstName} {guest.lastName}
                          </h3>
                          <p className="text-sm text-gray-500">{guest.email}</p>
                          <p className="text-sm text-gray-500">{guest.phone}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {guest.vipStatus && (
                          <Badge variant="warning" className="mb-2">
                            <ApperIcon name="Crown" className="h-3 w-3 mr-1" />
                            VIP
                          </Badge>
                        )}
                        <p className="text-sm text-gray-500">
                          {guest.stayHistory.length} stays
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Guest Details Sidebar */}
</div>

      {/* Guest Details Modal */}
      {showDetailsModal && selectedGuest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-modal w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Guest Details
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedGuest.firstName} {selectedGuest.lastName}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCloseDetailsModal}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <ApperIcon name="X" className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Contact Information */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <ApperIcon name="Mail" className="h-4 w-4 text-gray-400" />
                      <span>{selectedGuest.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ApperIcon name="Phone" className="h-4 w-4 text-gray-400" />
                      <span>{selectedGuest.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ApperIcon name="MapPin" className="h-4 w-4 text-gray-400" />
                      <span>{selectedGuest.address.city}, {selectedGuest.address.country}</span>
                    </div>
                  </div>
                </div>

                {/* ID Information */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Identification</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span>{selectedGuest.idType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Number:</span>
                      <span>{selectedGuest.idNumber}</span>
                    </div>
                  </div>
                </div>

                {/* Preferences */}
                {selectedGuest.preferences.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Preferences</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedGuest.preferences.map((pref, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {pref}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stay History */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Stay History</h4>
                  {selectedGuest.stayHistory.length === 0 ? (
                    <p className="text-sm text-gray-500">No previous stays</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedGuest.stayHistory.slice(0, 3).map((stay, index) => (
                        <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                          <div className="font-medium">Room {stay.roomNumber}</div>
                          <div className="text-sm text-gray-500">
                            {stay?.checkIn && !isNaN(new Date(stay.checkIn).getTime()) 
                              ? format(new Date(stay.checkIn), "MMM dd, yyyy") 
                              : "Invalid date"} - 
                            {stay?.checkOut && !isNaN(new Date(stay.checkOut).getTime()) 
                              ? format(new Date(stay.checkOut), "MMM dd, yyyy")
                              : "Invalid date"}
                          </div>
                        </div>
                      ))}
                      {selectedGuest.stayHistory.length > 3 && (
                        <p className="text-xs text-gray-500 text-center">
                          +{selectedGuest.stayHistory.length - 3} more stays
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                <div className="flex justify-end gap-3">
                  <Button 
                    variant="outline"
                    onClick={handleCloseDetailsModal}
                  >
                    Close
                  </Button>
                  <Button 
                    onClick={() => {
                      handleCloseDetailsModal();
                      handleEditGuest(selectedGuest);
                    }}
                  >
                    <ApperIcon name="Edit" className="h-4 w-4 mr-2" />
                    Edit Guest
                  </Button>
                  <Button variant="outline">
                    <ApperIcon name="Calendar" className="h-4 w-4 mr-2" />
                    New Reservation
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

{isEditorOpen && editingGuest && (
        <GuestProfileEditor
          guest={editingGuest}
          onSave={handleSaveGuest}
          onClose={handleCloseEditor}
        />
      )}
    </div>
  );
};

export default Guests;