import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="max-w-lg mx-auto text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <div className="bg-gradient-to-r from-primary to-blue-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <ApperIcon name="AlertCircle" className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
            <p className="text-gray-600 mb-8">
              The page you're looking for doesn't exist or has been moved. 
              Let's get you back to managing your hotel operations.
            </p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={() => navigate("/")}
              className="w-full"
            >
              <ApperIcon name="Home" className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => navigate("/reservations")}
              >
                <ApperIcon name="Calendar" className="h-4 w-4 mr-2" />
                Reservations
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/rooms")}
              >
                <ApperIcon name="Bed" className="h-4 w-4 mr-2" />
                Rooms
              </Button>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Need help? Contact your system administrator or check the hotel management guide.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;