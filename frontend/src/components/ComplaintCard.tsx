import React, { useState } from 'react';
import { Clock, Building2, Tag, Edit, Mail, Upload, Twitter } from 'lucide-react';
import { Complaint } from '../types';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { config } from '../config';
import { useAuth } from '../contexts/AuthContext';

interface ComplaintCardProps {
  complaint: Complaint;
  onUpdate: (complaintId: string, updatedData: Partial<Complaint>) => Promise<void>;
}

export const ComplaintCard: React.FC<ComplaintCardProps> = ({ complaint, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(complaint.title);
  const [editedDescription, setEditedDescription] = useState(complaint.description);
  const [editedStatus, setEditedStatus] = useState(complaint.status);
  const [editedEmail, setEditedEmail] = useState(complaint.companyEmail);
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);
  const { setTweetData } = useAuth();

  const handleSave = async () => {
    await onUpdate(complaint._id, {
      title: editedTitle,
      description: editedDescription,
      status: editedStatus,
      companyEmail: editedEmail,
    });
    setIsEditing(false);
  };

  const handleFileUpload = async (complaintId: string, files: FileList) => {
    const formData = new FormData();

    // Append each file to formData
    Array.from(files).forEach(file => {
      formData.append('attachments', file);
    });

    try {
      const response = await fetch(`${config.backendBaseUrl}/api/complaints/${complaintId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload files');
      }

      const updatedComplaint = await response.json();
      onUpdate(complaintId, updatedComplaint);
      toast.success('Files uploaded successfully');
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Failed to upload files');
    }
  };

  const handleTweetClick = () => {
    const isTwitterAuthorized = localStorage.getItem('accessToken');
    const tweetData = {
      description: complaint.description,
      company: complaint.company,
      category: complaint.category,
      date: new Date(complaint.createdAt).toLocaleDateString(),
      complaint_id: complaint._id
    };
    
    if (!isTwitterAuthorized) {
      // Store tweet data before navigation
      setTweetData(tweetData);
      setIsNavigating(true);
      setTimeout(() => {
        navigate('/smart-complaint/twitter?showAuthModal=true');
        setIsNavigating(false);
      }, 600);
    } else {
      // For authorized users, navigate directly
      navigate('/smart-complaint/twitter/compose', {
        state: tweetData
      });
    }
  };

  return (
    <div className="bg-gradient-to-r from-orange-50 via-purple-50 to-yellow-50
                    rounded-lg border border-orange-200 shadow-md p-3 sm:p-4 md:p-6
                    hover:shadow-lg transition-all duration-300
                    hover:border-purple-300 w-full max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
        {isEditing ? (
          <div className="w-full space-y-2">
            <input
              type="text"
              value={complaint.title}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed"
              disabled={true}
              aria-label="Complaint title"
            />
            <textarea
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              className="w-full p-2 border rounded"
              rows={3}
            />
            <select
              value={editedStatus}
              onChange={(e) => setEditedStatus(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex w-full items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words">{complaint.title}</h3>
              <p className="text-sm text-gray-600 mt-1 break-words">{complaint.description}</p>
              <span className={`inline-block px-2 py-1 rounded text-xs sm:text-sm mt-2 ${
                complaint.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                complaint.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                complaint.status === 'resolved' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center bg-gradient-to-r from-orange-100 via-purple-100 to-yellow-100 
                             px-2 py-1 rounded-md border border-orange-300 text-xs
                             cursor-pointer hover:bg-gradient-to-r hover:from-orange-200 
                             hover:via-purple-200 hover:to-yellow-200 hover:border-purple-400
                             transition-all duration-300"
                   onClick={handleTweetClick}
                   title="Post to Twitter">
                {isNavigating ? (
                  <div className="flex items-center">
                    <div className="animate-spin mr-2">
                      <div className="w-3 h-3 border-2 border-purple-500 border-t-transparent rounded-full" />
                    </div>
                    <span>Connecting...</span>
                  </div>
                ) : (
                  <>
                    <Twitter className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-purple-500" />
                    <span>Tweet</span>
                  </>
                )}
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-gray-500 hover:text-gray-700 flex-shrink-0 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Edit complaint"
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 w-full overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 w-full">
          <div className="inline-flex items-center bg-white px-2 py-1 rounded-md
                          border border-purple-100 text-xs min-w-0">
            <Building2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-purple-500 flex-shrink-0" />
            <span className="truncate">{complaint.company}</span>
          </div>
          <div className="inline-flex items-center bg-white px-2 py-1 rounded-md 
                          border border-purple-100 text-xs min-w-0">
            <Tag className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-purple-500 flex-shrink-0" />
            <span className="truncate">{complaint.category}</span>
          </div>
          <div className="inline-flex items-center bg-white px-2 py-1 rounded-md 
                          border border-purple-100 text-xs min-w-0">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-purple-500 flex-shrink-0" />
            <span className="truncate">{new Date(complaint.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 w-full overflow-hidden">
        <h4 className="text-xs sm:text-sm font-semibold text-gray-700">Company Emails:</h4>
        {complaint.companyEmails && complaint.companyEmails.length > 0 ? (
          <ul className="list-disc list-inside text-xs sm:text-sm text-gray-600 break-words">
            {complaint.companyEmails.map((email, index) => (
              <li key={index} className="truncate w-full">{email}</li>
            ))}
          </ul>
        ) : (
          <p className="text-xs sm:text-sm text-gray-500">No emails provided</p>
        )}
      </div>

      <div className="mt-4 w-full overflow-hidden">
        <input
          type="file"
          multiple
          onChange={(e) => e.target.files && handleFileUpload(complaint._id, e.target.files)}
          className="hidden"
          id={`file-upload-${complaint._id}`}
        />
        <label
          htmlFor={`file-upload-${complaint._id}`}
          className="cursor-pointer inline-flex items-center px-3 py-1.5 text-xs sm:text-sm font-medium
                   text-purple-600 bg-purple-50 border border-purple-200 rounded-md
                   hover:bg-purple-100 transition-colors duration-200
                   active:bg-purple-200 shadow-sm"
        >
          <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
          Upload Documents
        </label>

        {complaint.attachments && complaint.attachments.length > 0 && (
          <div className="mt-4 p-3 sm:p-4 bg-white rounded-lg border border-gray-200 w-full">
            <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2 flex items-center">
              <span className="mr-2">📎</span> Attachments ({complaint.attachments.length})
            </h4>
            <div className="grid gap-2 w-full">
              {complaint.attachments.map((attachment, index) => (
                <a
                  key={index}
                  href={`${config.backendBaseUrl}${attachment.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-2 rounded-md hover:bg-gray-50
                           text-xs sm:text-sm text-gray-700 group transition-colors duration-200
                           w-full overflow-hidden"
                >
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-50 rounded-md flex items-center
                                justify-center mr-2 sm:mr-3 group-hover:bg-purple-100 flex-shrink-0">
                    📄
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="truncate block">{attachment.originalname}</span>
                  </div>
                  <div className="ml-2 text-purple-600 opacity-0 group-hover:opacity-100
                                transition-opacity duration-200 flex-shrink-0">
                    ↓
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};