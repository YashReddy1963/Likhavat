import { Button, Typography } from "@material-tailwind/react";

export function UpdateProfileModal({ isOpen, onClose }) {
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 p-5 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded shadow-lg max-w-sm mx-auto">
          <Typography variant="h4" color="blue-gray" className=" mb-4">Complete Your Profile</Typography>
          <Typography variant="h6" color="blue-gray" className="font-normal" >Please update your About, profile image, banner image, and add at least one social media link to continue.</Typography>
          <Button 
            onClick={onClose} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          >
            OK
          </Button>
        </div>
      </div>
    );
  }

  export default UpdateProfileModal
  