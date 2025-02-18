import axios from 'axios';
import toast from 'react-hot-toast';
import { config } from '../config';

const API_URL = `${config.backendBaseUrl}/api`;

export const complaintService = {
  updateComplaint: async (complaintId: string, updates: {
    title?: string;
    description?: string;
    category?: string;
    status?: string;
    companyEmail?: string;
  }) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.patch(
        `${API_URL}/complaints/${complaintId}`,
        updates,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      toast.success('Complaint updated successfully');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || 'Failed to update complaint';
        toast.error(message);
      } else {
        toast.error('An unexpected error occurred');
      }
      throw error;
    }
  },
};