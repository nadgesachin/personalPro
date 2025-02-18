import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { User, Camera, Mail, Phone, MapPin, CheckCircle2 } from "lucide-react";
import { BsMegaphoneFill } from "react-icons/bs";
import { useAuth } from "../contexts/AuthContext";
import toast from 'react-hot-toast';

export const Profile: React.FC = () => {
  const location = useLocation();
  const { user, createUser, login } = useAuth();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [gender, setGender] = useState<string>("");
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(
    location.state?.phoneNumber || user?.phone?.replace("+91", "") || ""
  );
  const navigate = useNavigate();

  // Add a state to track if user came from Google login
  const isGoogleUser = user?.singleSignOn;

  // Add loading state
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.email) setEmail(user.email);
      if (user.gender) setGender(user.gender);
      if (user.profileImage) setProfileImage(user.profileImage);
      if (user.phone) setPhone(user.phone.replace("+91", ""));
    }
  }, [user]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!name || !email) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const success = await createUser({
        phone,
        name,
        email,
        gender,
        profileImage,
        profileCompleted: true
      });

      if (success as any) {
        toast.success('Profile created successfully');
        await login(phone);
        toast.success('Logged in successfully');
        navigate('/home', { replace: true });
      } else {
        toast.error('Failed to create profile');
      }
    } catch (error) {
      toast.error('Failed to create profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto h-full px-4 py-2 sm:px-6 sm:py-4">
        <div className="text-center mb-3 sm:mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">Complete Your</h1>
          <div className="text-2xl sm:text-3xl font-bold text-orange-500">
            Profile<span className="text-black">!</span>
          </div>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Set up your profile to continue
          </p>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
          {/* Profile Image Section */}
          <div className="relative">
            <div className="h-32 sm:h-40 flex items-center justify-center bg-gradient-to-r from-orange-500 via-purple-500 to-yellow-500">
              <div className="absolute top-7 sm:top-8 left-1/2 transform -translate-x-1/2 flex items-center">
                <BsMegaphoneFill className="h-8 sm:h-9 w-8 sm:w-9 text-white" />
                <span className="text-xl sm:text-2xl font-bold ml-2 text-white">
                  SpeakUp
                </span>
              </div>
            </div>
            <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-12 sm:-bottom-14">
              <div className="relative">
                <div className="w-24 sm:w-28 h-24 sm:h-28 rounded-full bg-gray-200 border-4 border-white overflow-hidden">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-full h-full p-4 text-gray-400" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-orange-500 p-2 rounded-full cursor-pointer hover:bg-orange-600 transition-colors">
                  <Camera className="w-4 h-4 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="pt-14 sm:pt-16 px-4 sm:px-8 pb-6 sm:pb-8 space-y-4 sm:space-y-5">
            <div className="space-y-3 sm:space-y-4">
              <div className="relative">
                <User className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  readOnly={isGoogleUser}
                  className={`w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 text-sm sm:text-base border border-gray-200 rounded-xl
                    ${isGoogleUser
                      ? 'bg-gray-50 cursor-not-allowed'
                      : 'focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500'}`}
                />
              </div>

              {/* Gender Selection */}
              <div className="flex gap-3 sm:gap-4">
                <label className="flex-1">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={gender === "male"}
                    onChange={(e) => setGender(e.target.value)}
                    className="hidden"
                  />
                  <div
                    className={`text-center py-3 sm:py-3.5 text-sm sm:text-base border rounded-xl cursor-pointer transition-colors ${gender === "male"
                        ? "border-purple-500 bg-purple-50 text-purple-500"
                        : "border-gray-200 text-gray-500 hover:border-purple-200"
                      }`}
                  >
                    Male
                  </div>
                </label>
                <label className="flex-1">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={gender === "female"}
                    onChange={(e) => setGender(e.target.value)}
                    className="hidden"
                  />
                  <div
                    className={`text-center py-3 sm:py-3.5 text-sm sm:text-base border rounded-xl cursor-pointer transition-colors ${gender === "female"
                        ? "border-purple-500 bg-purple-50 text-purple-500"
                        : "border-gray-200 text-gray-500 hover:border-purple-200"
                      }`}
                  >
                    Female
                  </div>
                </label>
              </div>

              <div className="relative">
                <Mail className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  readOnly={isGoogleUser}
                  className={`w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 text-sm sm:text-base border border-gray-200 rounded-xl
                    ${isGoogleUser
                      ? 'bg-gray-50 cursor-not-allowed'
                      : 'focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500'}`}
                />
              </div>

              {/* Phone Input Field */}
              <div className="relative">
                <Phone className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="Phone Number"
                  readOnly={!!user?.phone}
                  className={`w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-3.5 text-sm sm:text-base border border-gray-200 rounded-xl
                    ${user?.phone
                      ? 'bg-gray-50 cursor-not-allowed'
                      : 'focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500'}`}
                />
                {user?.phone && (
                  <CheckCircle2 className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-green-500 w-5 h-5" />
                )}
              </div>

              <div className="relative">
                <MapPin className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Location"
                  className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 text-sm sm:text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-purple-500
                       hover:from-orange-600 hover:to-purple-600 text-white rounded-xl
                       disabled:opacity-70 disabled:cursor-not-allowed
                       flex items-center justify-center"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'CREATE YOUR PROFILE'
              )}
            </button>
          </form>
        </div>

        <div className="text-center mt-2 sm:mt-3 text-xs sm:text-sm text-gray-500">
          V. 1.0.2
        </div>
      </div>
    </div>
  );
};
