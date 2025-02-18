import React from 'react';
import { Bell, Mail, MessageSquare } from 'lucide-react';
import { ReminderSettings } from '../types';

interface ReminderSettingsProps {
  settings: ReminderSettings;
  onSettingsChange: (settings: ReminderSettings) => void;
}

export const ReminderSettingsComponent: React.FC<ReminderSettingsProps> = ({
  settings,
  onSettingsChange,
}) => {
  return (
    <div className="bg-gradient-to-br from-orange-50 via-purple-50 to-yellow-50 p-6 rounded-lg shadow-md">
      <div className="flex items-center gap-2 mb-6">
        <Bell className="w-5 h-5 text-purple-600" />
        <h2 className="text-xl font-semibold text-gray-900">Reminder Settings</h2>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-gray-700">
            <Mail className="w-4 h-4" />
            Enable Email Reminders
          </label>
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) => onSettingsChange({
              ...settings,
              enabled: e.target.checked
            })}
            className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reminder Frequency (days)
          </label>
          <select
            value={settings.frequency}
            onChange={(e) => onSettingsChange({
              ...settings,
              frequency: Number(e.target.value)
            })}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
          >
            <option value={3}>Every 3 days</option>
            <option value={7}>Every 7 days</option>
            <option value={14}>Every 14 days</option>
            <option value={30}>Every 30 days</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Default Message Template
            </div>
          </label>
          <textarea
            value={settings.messageTemplate}
            onChange={(e) => onSettingsChange({
              ...settings,
              messageTemplate: e.target.value
            })}
            rows={4}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
            placeholder="Enter your default reminder message template..."
          />
          <p className="mt-2 text-sm text-gray-500">
            Available variables: {'{company}'}, {'{days_passed}'}, {'{complaint_title}'}
          </p>
        </div>
      </div>
    </div>
  );
};