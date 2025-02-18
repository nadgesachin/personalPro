import React from 'react';
import { Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { Complaint } from '../types';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';

interface ReminderDashboardProps {
  complaints: Complaint[];
}

export const ReminderDashboard: React.FC<ReminderDashboardProps> = ({ complaints }) => {
  const pendingReminders = complaints.filter(c => 
    c.status === 'pending' && c.nextReminderDate
  );

  return (
    <div className="bg-gradient-to-r from-orange-50 via-purple-50 to-yellow-50 rounded-lg border border-orange-200 shadow-md hover:shadow-lg transition-all duration-300 sticky top-4">
      <div className="p-6 border-b border-orange-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Reminder Dashboard</h2>
          <span className={`px-3 py-1 rounded-full text-sm ${
            pendingReminders.length > 0
            ? 'bg-gradient-to-r from-orange-100 to-purple-100 text-purple-800'
            : 'bg-gray-100 text-gray-600'
          }`}>
            {pendingReminders.length} Pending
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg border border-orange-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <h3 className="font-semibold text-gray-800">Pending Reminders</h3>
            </div>
            <p className="text-2xl font-bold text-orange-500">
              {pendingReminders.length}
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-orange-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              <h3 className="font-semibold text-gray-800">Requires Action</h3>
            </div>
            <p className="text-2xl font-bold text-orange-500">
              {complaints.filter(c => c.status === 'pending').length}
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-orange-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-orange-500" />
              <h3 className="font-semibold text-gray-800">Resolved</h3>
            </div>
            <p className="text-2xl font-bold text-orange-500">
              {complaints.filter(c => c.status === 'resolved').length}
            </p>
          </div>
        </div>

        <div className="overflow-hidden">
          <SimpleBar style={{ maxHeight: '400px' }}>
            <table className="w-full">
              <thead className="bg-gradient-to-r from-orange-50 to-purple-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">
                    Complaint
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Last Reminder
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Next Reminder
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-100">
                {pendingReminders.map((complaint) => (
                  <tr key={complaint._id} className="hover:bg-gradient-to-r hover:from-orange-50 hover:to-purple-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {complaint.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{complaint.company}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {complaint.lastReminderSent
                          ? new Date(complaint.lastReminderSent).toLocaleDateString()
                          : 'No reminders sent'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {complaint.nextReminderDate
                          ? new Date(complaint.nextReminderDate).toLocaleDateString()
                          : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        complaint.status === 'resolved'
                        ? 'bg-gradient-to-r from-green-100 to-emerald-200 text-emerald-800'
                        : 'bg-gradient-to-r from-orange-100 to-purple-100 text-purple-800'
                      }`}>
                        {complaint.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SimpleBar>
        </div>
      </div>
    </div>
  );
};