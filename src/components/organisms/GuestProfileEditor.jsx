import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import FormField from "@/components/molecules/FormField";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";

const GuestProfileEditor = ({ guest, onSave, onClose }) => {
const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState({
    ...guest,
    preferences: guest?.preferences || [],
    allergies: guest?.allergies || [],
    stayNotes: guest?.stayNotes || "",
    address: guest?.address || {}
  });
  
  const isCreating = !guest.Id;
  const [errors, setErrors] = useState({});

  const tabs = [
    { id: "basic", label: "Basic Info", icon: "User" },
    { id: "preferences", label: "Preferences", icon: "Settings" },
    { id: "allergies", label: "Allergies", icon: "AlertTriangle" },
    { id: "vip", label: "VIP & Notes", icon: "Star" }
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName?.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName?.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!formData.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.phone?.trim()) {
      newErrors.phone = "Phone number is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const handleAddressChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }));
  };

  const handleAddPreference = () => {
    const preference = prompt("Enter new preference:");
if (preference?.trim()) {
      setFormData(prev => ({
        ...prev,
        preferences: [...(prev.preferences || []), preference.trim()]
      }));
    }
  };

const handleRemovePreference = (index) => {
    setFormData(prev => ({
      ...prev,
      preferences: (prev.preferences || []).filter((_, i) => i !== index)
    }));
  };

  const handleAddAllergy = () => {
    const allergy = prompt("Enter new allergy:");
if (allergy?.trim()) {
      setFormData(prev => ({
        ...prev,
        allergies: [...(prev.allergies || []), allergy.trim()]
      }));
    }
  };

const handleRemoveAllergy = (index) => {
    setFormData(prev => ({
      ...prev,
      allergies: (prev.allergies || []).filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  const renderBasicInfo = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="First Name"
          id="firstName"
          value={formData.firstName}
          onChange={(e) => handleInputChange("firstName", e.target.value)}
          error={errors.firstName}
          required
        />
        <FormField
          label="Last Name"
          id="lastName"
          value={formData.lastName}
          onChange={(e) => handleInputChange("lastName", e.target.value)}
          error={errors.lastName}
          required
        />
      </div>
      
      <FormField
        label="Email"
        id="email"
        type="email"
        value={formData.email}
        onChange={(e) => handleInputChange("email", e.target.value)}
        error={errors.email}
        required
      />
      
      <FormField
        label="Phone"
        id="phone"
        value={formData.phone}
        onChange={(e) => handleInputChange("phone", e.target.value)}
        error={errors.phone}
        required
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="ID Type"
          id="idType"
          value={formData.idType}
          onChange={(e) => handleInputChange("idType", e.target.value)}
        />
        <FormField
          label="ID Number"
          id="idNumber"
          value={formData.idNumber}
          onChange={(e) => handleInputChange("idNumber", e.target.value)}
        />
      </div>

      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Address</h4>
        <FormField
          label="Street"
          id="street"
          value={formData.address?.street || ""}
          onChange={(e) => handleAddressChange("street", e.target.value)}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="City"
            id="city"
            value={formData.address?.city || ""}
            onChange={(e) => handleAddressChange("city", e.target.value)}
          />
          <FormField
            label="State"
            id="state"
            value={formData.address?.state || ""}
            onChange={(e) => handleAddressChange("state", e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Zip Code"
            id="zipCode"
            value={formData.address?.zipCode || ""}
            onChange={(e) => handleAddressChange("zipCode", e.target.value)}
          />
          <FormField
            label="Country"
            id="country"
            value={formData.address?.country || ""}
            onChange={(e) => handleAddressChange("country", e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  const renderPreferences = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium text-gray-900">Guest Preferences</h4>
        <Button 
          size="sm" 
          onClick={handleAddPreference}
          className="flex items-center gap-2"
        >
          <ApperIcon name="Plus" className="h-4 w-4" />
          Add Preference
        </Button>
</div>
      
      {!formData.preferences || formData.preferences.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <ApperIcon name="Settings" className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p>No preferences added yet</p>
        </div>
) : (
        <div className="space-y-2">
          {formData.preferences?.map((preference, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-900">{preference}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleRemovePreference(index)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <ApperIcon name="X" className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderAllergies = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium text-gray-900">Allergies & Dietary Restrictions</h4>
        <Button 
          size="sm" 
          onClick={handleAddAllergy}
          className="flex items-center gap-2"
        >
          <ApperIcon name="Plus" className="h-4 w-4" />
          Add Allergy
        </Button>
</div>
      
      {!formData.allergies || formData.allergies.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <ApperIcon name="AlertTriangle" className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p>No allergies recorded</p>
        </div>
) : (
        <div className="space-y-2">
          {formData.allergies?.map((allergy, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
              <div className="flex items-center gap-2">
                <ApperIcon name="AlertTriangle" className="h-4 w-4 text-red-600" />
                <span className="text-gray-900">{allergy}</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleRemoveAllergy(index)}
                className="text-red-600 hover:text-red-700 hover:bg-red-100"
              >
                <ApperIcon name="X" className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderVipAndNotes = () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">VIP Status</h4>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleInputChange("vipStatus", !formData.vipStatus)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              formData.vipStatus
                ? "bg-yellow-50 border-yellow-200 text-yellow-800"
                : "bg-gray-50 border-gray-200 text-gray-600"
            }`}
          >
            <ApperIcon 
              name={formData.vipStatus ? "Star" : "StarOff"} 
              className={`h-5 w-5 ${formData.vipStatus ? "text-yellow-600" : "text-gray-400"}`} 
            />
            {formData.vipStatus ? "VIP Guest" : "Standard Guest"}
          </button>
        </div>
        {formData.vipStatus && (
          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <ApperIcon name="Info" className="h-4 w-4 inline mr-1" />
              This guest has VIP status and should receive premium service
            </p>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Stay Notes</h4>
        <textarea
          value={formData.stayNotes}
          onChange={(e) => handleInputChange("stayNotes", e.target.value)}
          placeholder="Add any special notes, requests, or important information about this guest's stays..."
          className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
        />
        <p className="text-xs text-gray-500">
          Include special requests, important notes, or any other relevant information for future stays
        </p>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "basic":
        return renderBasicInfo();
      case "preferences":
        return renderPreferences();
      case "allergies":
        return renderAllergies();
      case "vip":
        return renderVipAndNotes();
      default:
        return renderBasicInfo();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-modal w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
<div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {isCreating ? 'Add New Guest' : 'Edit Guest Profile'}
                </h2>
                {!isCreating && (
                  <p className="text-sm text-gray-600 mt-1">
                    {formData.firstName} {formData.lastName}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <ApperIcon name="X" className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-primary text-primary bg-primary/5"
                      : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <ApperIcon name={tab.icon} className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {renderTabContent()}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <ApperIcon name="Save" className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestProfileEditor;