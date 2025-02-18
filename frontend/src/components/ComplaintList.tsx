import React, { useState, useEffect } from 'react';
import EditComplaint from './EditComplaint';
import { Tag, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { config } from '../config';

interface Complaint {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  createdAt: string;
}

const ComplaintList: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [editingComplaint, setEditingComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchComplaints = async () => {
    try {
      const response = await fetch(`${config.backendBaseUrl}/api/complaints`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        setComplaints(data.data);
      }
    } catch (err) {
      setError('Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleEdit = (complaint: Complaint) => {
    setEditingComplaint(complaint);
  };

  const handleUpdate = () => {
    fetchComplaints();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading complaints...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-center py-8">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Your Complaints</h2>
      <div className="space-y-4">
        {complaints.map((complaint) => (
          <div
            key={complaint._id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold">{complaint.title}</h3>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  complaint.status
                )}`}
              >
                {complaint.status}
              </span>
            </div>

            <p className="text-gray-600 mb-4">{complaint.description}</p>

            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              <div className="flex items-center gap-1">
                <Tag className="w-4 h-4" />
                <span>{complaint.category}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => handleEdit(complaint)}
                className="px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-800
                         hover:bg-purple-50 rounded-md transition-colors"
              >
                Edit Complaint
              </button>
            </div>
          </div>
        ))}

        {complaints.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No complaints found. Create a new complaint to get started.
          </div>
        )}
      </div>

      {editingComplaint && (
        <EditComplaint
          complaint={editingComplaint}
          onClose={() => setEditingComplaint(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
};

export default ComplaintList;