import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import bcrypt from 'bcryptjs';
import Navbar from './Navbar';
import Footer from './Footer';

const Profile = () => {
  const [userData, setUserData] = useState({
    username: '',
    full_name: '',
    email: '',
    college: '',
    graduation_year: '',
    department: '',
    current_job: '',
    bio: '',
  });
  const [originalUserData, setOriginalUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [passwordChangeAllowed, setPasswordChangeAllowed] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [storedPasswordHash, setStoredPasswordHash] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const localUser = JSON.parse(localStorage.getItem('alumniUser'));
      if (!localUser || !localUser.email) {
        setIsLoggedIn(false);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select('username, full_name, email, college, graduation_year, department, current_job, bio, password')
        .eq('email', localUser.email)
        .single();

      if (error || !data) {
        setMessage('Failed to fetch user data');
        setLoading(false);
        return;
      }

      const fetchedUser = {
        username: data.username || '',
        full_name: data.full_name,
        email: data.email,
        college: data.college,
        graduation_year: data.graduation_year,
        department: data.department,
        current_job: data.current_job,
        bio: data.bio,
      };

      setUserData(fetchedUser);
      setOriginalUserData(fetchedUser);
      setStoredPasswordHash(data.password);
      setLoading(false);
    };

    fetchUser();
  }, []);

  const handleChange = (e) => {
    setUserData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePasswordVerify = async () => {
    const isValid = await bcrypt.compare(currentPassword, storedPasswordHash);
    if (isValid) {
      setPasswordChangeAllowed(true);
      setMessage('✔ Current password verified');
    } else {
      setMessage('❌ Current password is incorrect');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    // Prepare update data, exclude username if empty
    const updateData = {
      full_name: userData.full_name,
      college: userData.college,
      graduation_year: userData.graduation_year,
      department: userData.department,
      current_job: userData.current_job,
      bio: userData.bio,
    };

    if (userData.username.trim() !== '') {
      // If username changed, check uniqueness
      if (userData.username !== originalUserData.username) {
        const { data: existingUsers, error: fetchError } = await supabase
          .from('users')
          .select('id')
          .eq('username', userData.username)
          .neq('email', userData.email)
          .limit(1);

        if (fetchError) {
          setMessage(`Error checking username: ${fetchError.message}`);
          setLoading(false);
          return;
        }
        if (existingUsers.length > 0) {
          setMessage('❌ Username is already taken');
          setLoading(false);
          return;
        }
      }
      updateData.username = userData.username;
    } 
    // else username empty -> do NOT include in updateData, so username stays unchanged

    if (newPassword.trim() && passwordChangeAllowed) {
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('email', userData.email);

    if (error) {
      setMessage(`Update failed: ${error.message}`);
    } else {
      setMessage('✅ Profile updated successfully!');
      // Update localStorage and originalUserData accordingly
      const updatedUserData = { ...userData, ...updateData };
      // If username was empty on update, revert it to original username for local state consistency
      if (!updateData.username) {
        updatedUserData.username = originalUserData.username;
      }
      setOriginalUserData(updatedUserData);
      setUserData(updatedUserData);
      localStorage.setItem('alumniUser', JSON.stringify(updatedUserData));
      setIsEditing(false);
      setCurrentPassword('');
      setNewPassword('');
      setPasswordChangeAllowed(false);
      setShowPasswordFields(false);
    }

    setLoading(false);
  };

  if (loading) return <p className="text-center mt-10 text-gray-600">Loading...</p>;
  if (!isLoggedIn) return <p className="text-center mt-10 text-red-600">Please log in to view your profile.</p>;

  const InfoRow = ({ label, value }) => (
    <div className="flex flex-col sm:flex-row justify-between py-2 px-4 border-b border-gray-200">
      <span className="text-sm font-medium text-gray-500">{label}</span>
      <span className="text-sm text-gray-800 font-semibold">{value || '-'}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200">
      <Navbar />
      <div className="max-w-3xl mx-auto mt-12 mb-15 p-4 sm:p-6 bg-white shadow-xl rounded-xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-indigo-700 mb-6">Your Profile</h1>

        {!isEditing ? (
          <>
            <div className="text-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">{userData.full_name}</h2>
              <p className="text-indigo-600 text-sm">{userData.email}</p>
              <p className="text-indigo-500 text-xs mt-1 font-mono">@{userData.username || 'no-username'}</p>
            </div>

            <div className="bg-gray-50 border rounded-md divide-y divide-gray-200 text-sm">
              <InfoRow label="Username" value={`@${userData.username || '-'}`} />
              <InfoRow label="College / Institution" value={userData.college} />
              <InfoRow label="Graduation Year" value={userData.graduation_year} />
              <InfoRow label="Department" value={userData.department} />
              <InfoRow label="Current Job" value={userData.current_job} />
              <div className="p-3">
                <h3 className="text-gray-500 font-semibold text-xs mb-1">Bio</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{userData.bio || 'No bio provided.'}</p>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition"
            >
              Edit Profile
            </button>
          </>
        ) : (
          <form onSubmit={handleUpdate} className="space-y-4">
            {[ 
              { label: 'Username', name: 'username', type: 'text' },
              { label: 'Full Name', name: 'full_name', type: 'text' },
              { label: 'College / Institution', name: 'college', type: 'text' },
              { label: 'Graduation Year', name: 'graduation_year', type: 'number' },
              { label: 'Department', name: 'department', type: 'text' },
              { label: 'Current Job (optional)', name: 'current_job', type: 'text' },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-gray-700 font-medium mb-1">{field.label}</label>
                <input
                  type={field.type}
                  name={field.name}
                  value={userData[field.name]}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder={field.name === 'username' ? '(leave empty to keep unchanged)' : ''}
                />
              </div>
            ))}

            <div>
              <label className="block text-gray-700 font-medium mb-1">Email</label>
              <input
                type="email"
                value={userData.email}
                disabled
                className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Short Bio</label>
              <textarea
                name="bio"
                value={userData.bio}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {!showPasswordFields ? (
              <button
                type="button"
                onClick={() => setShowPasswordFields(true)}
                className="text-sm text-indigo-600 hover:underline"
              >
                Change Password
              </button>
            ) : (
              <>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handlePasswordVerify}
                    className="mt-1 text-sm text-indigo-600 hover:underline"
                  >
                    Verify
                  </button>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={!passwordChangeAllowed}
                    className={`w-full px-4 py-2 border rounded-lg ${
                      passwordChangeAllowed
                        ? 'focus:outline-none focus:ring-2 focus:ring-indigo-500'
                        : 'bg-gray-100 cursor-not-allowed'
                    }`}
                  />
                </div>
              </>
            )}

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-lg transition"
              >
                {loading ? 'Updating...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setShowPasswordFields(false);
                  setNewPassword('');
                  setCurrentPassword('');
                  setMessage('');
                  setPasswordChangeAllowed(false);
                  if (originalUserData) {
                    setUserData(originalUserData);
                  }
                }}
                className="w-full sm:w-auto text-gray-600 hover:text-red-600 font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {message && (
          <p
            className={`mt-5 text-center text-sm font-medium ${
              message.toLowerCase().includes('failed') || message.toLowerCase().includes('incorrect') || message.toLowerCase().includes('taken')
                ? 'text-red-600'
                : 'text-green-600'
            }`}
          >
            {message}
          </p>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
