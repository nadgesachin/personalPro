import React, { useState, useEffect } from "react";
import { Mic, MicOff, Search } from "lucide-react";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { ComplaintCard } from "./ComplaintCard";
import { SearchFiltersComponent } from "./SearchFilters";
import { ReminderSettingsComponent } from "./ReminderSettings";
import { ReminderDashboard } from "./ReminderDashboard";
import {
  Complaint,
  SearchFilters,
  SortConfig,
  ReminderSettings,
} from "../types";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import { BsMegaphoneFill } from "react-icons/bs";
import { LoadingSpinner } from "./LoadingSpinner";
import { AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { config } from '../config';

export const ComplaintsSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({
    category: "",
    company: "",
    status: "",
    startDate: "",
    endDate: "",
  });
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: "createdAt",
    direction: "desc",
  });
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>({
    frequency: 7,
    messageTemplate:
      "Dear {company},\n\nI am following up on complaint #{id} submitted {days} days ago...",
    enabled: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isComplaintsFetching, setIsComplaintsFetching] = useState(true);

  const {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    const fetchComplaints = async () => {
      setIsComplaintsFetching(true);
      try {
        const response = await fetch(
          `${config.backendBaseUrl}/api/complaint-history`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) {
          if(response.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/login");
            throw new Error("Unauthorized Access redirecting to login");
          }
          throw new Error("Failed to fetch complaints");
        }

        const { data } = await response.json();
        // Ensure data is an array before setting it to state
        if (Array.isArray(data)) {
          setComplaints(data);
          toast.success(`Fetched complaints successfully`);
        } else {
          console.error("API response is not an array:", data);
          toast.error("Unexpected data format received from server");
        }
      } catch (error) {
        console.error("Error fetching complaints:", error);
        toast.error("Failed to load complaints");
      } finally {
        setIsComplaintsFetching(false);
      }
    };

    fetchComplaints();
  }, []);

  useEffect(() => {
    if (transcript) {
      setSearchQuery(transcript);
      resetTranscript();
    }
  }, [transcript, resetTranscript]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const categories = Array.from(new Set(complaints.map((c) => c.category)));
  const companies = Array.from(new Set(complaints.map((c) => c.company)));

  const handleVoiceSearch = () => {
    if (isListening) {
      stopListening();
    } else {
      setSearchQuery("");
      startListening();
    }
  };

  // Filter and sort complaints
  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch =
      complaint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      !filters.category || complaint.category === filters.category;
    const matchesCompany =
      !filters.company || complaint.company === filters.company;
    const matchesStatus =
      !filters.status || complaint.status === filters.status;
    const matchesDateRange =
      (!filters.startDate ||
        new Date(complaint.createdAt) >= new Date(filters.startDate)) &&
      (!filters.endDate ||
        new Date(complaint.createdAt) <= new Date(filters.endDate));

    return (
      matchesSearch &&
      matchesCategory &&
      matchesCompany &&
      matchesStatus &&
      matchesDateRange
    );
  });

  const sortedComplaints = [...filteredComplaints].sort((a, b) => {
    const aValue = a[sortConfig.field];
    const bValue = b[sortConfig.field];

    if (aValue === undefined || bValue === undefined) {
      return 0;
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortConfig.direction === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return sortConfig.direction === "asc"
      ? aValue < bValue ? -1 : 1
      : bValue < aValue ? -1 : 1;
  });

  const handleUpdateComplaint = async (
    complaintId: string,
    updatedData: Partial<Complaint>
  ) => {

    try {
      const response = await fetch(
        `${config.backendBaseUrl}/api/complaints/${complaintId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(updatedData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update complaint");
      }

      const updatedComplaint = await response.json();

      // Update the complaints state with the new data
      setComplaints((prevComplaints) =>
        prevComplaints.map((complaint) =>
          complaint._id === complaintId
            ? { ...complaint, ...updatedComplaint }
            : complaint
        )
      );

      toast.success("Complaint updated successfully");
    } catch (error) {
      console.error("Error updating complaint:", error);
      toast.error("Failed to update complaint");
    }
  };

  const handleLogoClick = () => {
    if (!authLoading && isAuthenticated) {
      setIsLoading(true);
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 600); // Match the loading animation duration
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-yellow-50">
      {/* Top Navigation Bar */}
      <div className="bg-gradient-to-r from-orange-500 via-purple-500 to-yellow-500 shadow-sm">
        <div className="max-w-full mx-6 px-2">
          <div className="flex items-center h-16">
            <div
              className="flex items-center gap-1 cursor-pointer"
              onClick={handleLogoClick}
            >
              <div className="w-10 h-10 rounded-full border-2 border-orange-300 bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <BsMegaphoneFill className="w-5 h-5 text-white transform -rotate-12" />
              </div>
              <h1 className="text-xl font-bold text-white">SpeakUp</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="pb-8">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <LoadingSpinner message="Redirecting to home..." />
          ) : (
            <>
              {/* Main header section with search */}
              <div className="bg-gradient-to-r from-orange-500 via-purple-500 to-yellow-500 shadow-sm p-6 pb-12">
                <div className="max-w-2xl mx-auto mb-8">
                  <div className="text-center">
                    <h1 className="text-3xl font-bold text-white">Complaint History</h1>
                    <p className="mb-4 text-orange-100">
                      Track and manage your complaints
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 relative">
                      <div className="relative">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder={
                            isListening ? "Listening..." : "Search complaints..."
                          }
                          className={`w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg
                                     focus:ring-2 focus:ring-purple-200 focus:border-transparent outline-none`}
                          disabled={isListening}
                        />
                        <Search
                          className="absolute left-3 top-1/2 transform -translate-y-1/2
                                          text-purple-500 w-4 h-4"
                        />
                      </div>
                      <button
                        onClick={handleVoiceSearch}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors ${
                          isListening
                            ? "bg-orange-100 text-orange-600 hover:bg-orange-200"
                            : "bg-white text-orange-500 hover:bg-orange-50"
                        }`}
                      >
                        {isListening ? (
                          <MicOff className="h-5 w-5" />
                        ) : (
                          <Mic className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="max-w-full mx-6 px-2 -mt-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <SearchFiltersComponent
                    filters={filters}
                    onFilterChange={setFilters}
                    categories={categories}
                    companies={companies}
                  />

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                    {/* Left side - Complaints List */}
                    <SimpleBar
                      className="w-full max-h-[calc(100vh-16rem)]"
                      style={
                        {
                          "--simplebar-track-background-color": "#FEF3C7",
                          "--simplebar-scrollbar-background-color": "#FDBA74",
                        } as React.CSSProperties
                      }
                    >
                      <div className="space-y-4 pr-2">
                        {isComplaintsFetching ? (
                          Array(3).fill(0).map((_, index) => (
                            <div key={index} className="animate-pulse bg-white rounded-lg p-4 shadow">
                              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                          ))
                        ) : sortedComplaints.length === 0 ? (
                          <div className="text-center py-8 bg-white rounded-lg shadow">
                            <h3 className="text-lg font-medium text-gray-600">No Complaints Yet</h3>
                            <p className="text-gray-500 mt-2">Your complaint history will appear here</p>
                          </div>
                        ) : (
                          sortedComplaints.map((complaint) => (
                            <ComplaintCard
                              key={complaint._id}
                              complaint={complaint}
                              onUpdate={handleUpdateComplaint}
                            />
                          ))
                        )}
                      </div>
                    </SimpleBar>

                    {/* Right side - Reminder Dashboard */}
                    <div className="w-full">
                      <ReminderDashboard complaints={complaints} />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Settings Modal - Unchanged */}
      <dialog
        id="settingsModal"
        className="modal p-8 rounded-lg shadow-xl bg-white"
      >
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-orange-800">
            Reminder Settings
          </h2>
          <button
            onClick={() => document.getElementById("settingsModal")?.close()}
            className="text-orange-500 hover:text-orange-700"
          >
            ×
          </button>
        </div>
        <ReminderSettingsComponent
          settings={reminderSettings}
          onSettingsChange={setReminderSettings}
        />
      </dialog>
    </div>
  );
};
