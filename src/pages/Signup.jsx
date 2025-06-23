import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import bcrypt from 'bcryptjs';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    email: '',
    password: '',
    graduation_year: '',
    department: '',
    college: '',
    current_job: '',
    bio: '',
  });

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [usernameStatus, setUsernameStatus] = useState(null); // 'available', 'taken', 'empty'
  const [emailStatus, setEmailStatus] = useState(null); // 'available', 'taken', 'empty'

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'username') setUsernameStatus(null);
    if (e.target.name === 'email') setEmailStatus(null);
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const checkUsernameExists = async (username) => {
    const { data, error } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .single();
    return !!data && !error;
  };

  const checkEmailExists = async (email) => {
    const { data, error } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single();
    return !!data && !error;
  };

  const handleNext = async () => {
    setMessage('');

    if (!formData.full_name.trim()) return setMessage('Please enter your full name.');
    if (!formData.username.trim()) return setMessage('Please choose a username.');
    if (!formData.email.trim()) return setMessage('Please enter your email.');
    if (!validateEmail(formData.email.trim())) return setMessage('Please enter a valid email address.');
    if (!formData.password) return setMessage('Please enter your password.');

    const [usernameTaken, emailTaken] = await Promise.all([
      checkUsernameExists(formData.username.trim()),
      checkEmailExists(formData.email.trim()),
    ]);

    if (usernameTaken) {
      setUsernameStatus('taken');
      return setMessage('Username is already taken.');
    }

    if (emailTaken) {
      setEmailStatus('taken');
      return setMessage('Email is already registered.');
    }

    setUsernameStatus('available');
    setEmailStatus('available');
    setStep(2);
  };

  const handleKeyDownStep1 = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleNext();
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const hashedPassword = await bcrypt.hash(formData.password, 10);

      const { error } = await supabase.from('users').insert([
        {
          full_name: formData.full_name,
          username: formData.username.trim(),
          email: formData.email.trim(),
          password: hashedPassword,
          graduation_year: parseInt(formData.graduation_year),
          department: formData.department,
          college: formData.college,
          current_job: formData.current_job,
          bio: formData.bio,
        },
      ]);

      if (error) {
        setMessage(`Signup failed: ${error.message}`);
      } else {
        setMessage('Signup successful! Redirecting...');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      setMessage('Unexpected error occurred. Please try again.');
    }

    setLoading(false);
  };

  const formHeight = step === 1 ? 540 : 600;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-50 via-white to-blue-100 px-6 py-10">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-xl ring-1 ring-gray-300 p-8 sm:p-10 overflow-hidden relative">
        <h2 className="text-3xl font-extrabold mb-6 text-center text-blue-800 tracking-tight">
          Alumni Sign Up
        </h2>

        <form
          onSubmit={handleSignup}
          className="relative overflow-hidden transition-[height] duration-500 ease-in-out"
          style={{ height: formHeight }}
        >
          {/* Step 1 */}
          <div
            className={`absolute top-0 left-0 w-full transition-transform duration-500 px-6 ${
              step === 1 ? 'translate-x-0' : '-translate-x-full'
            }`}
            style={{ height: formHeight }}
            onKeyDown={handleKeyDownStep1}
          >
            <div className="grid grid-cols-1 gap-5">
              {/* Full Name */}
              <div>
                <label htmlFor="full_name" className="block mb-1 text-sm font-semibold text-gray-700">
                  Full Name
                </label>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  placeholder="Your full name"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md shadow-sm"
                  onChange={handleChange}
                  required
                  value={formData.full_name}
                />
              </div>

              {/* Username */}
              <div>
                <label htmlFor="username" className="block mb-1 text-sm font-semibold text-gray-700">
                  Username
                </label>
                <div className="flex gap-2">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Choose a username"
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-md shadow-sm"
                    onChange={handleChange}
                    value={formData.username}
                    required
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (!formData.username.trim()) {
                        setUsernameStatus('empty');
                        return;
                      }
                      const exists = await checkUsernameExists(formData.username.trim());
                      setUsernameStatus(exists ? 'taken' : 'available');
                    }}
                    className="px-3 py-2.5 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 transition"
                  >
                    Check
                  </button>
                </div>
                {usernameStatus === 'available' && (
                  <p className="mt-1 text-sm text-green-600">Username is available ✅</p>
                )}
                {usernameStatus === 'taken' && (
                  <p className="mt-1 text-sm text-red-600">Username is already taken ❌</p>
                )}
                {usernameStatus === 'empty' && (
                  <p className="mt-1 text-sm text-red-500">Please enter a username</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block mb-1 text-sm font-semibold text-gray-700">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md shadow-sm"
                  onChange={handleChange}
                  required
                  value={formData.email}
                />
                {emailStatus === 'taken' && (
                  <p className="mt-1 text-sm text-red-600">Email is already registered ❌</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block mb-1 text-sm font-semibold text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md shadow-sm"
                  onChange={handleChange}
                  required
                  value={formData.password}
                />
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="mt-4 w-full py-3 rounded-md bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 transition-colors duration-300"
              >
                Next
              </button>
            </div>
          </div>

          {/* Step 2 */}
          <div
            className={`absolute top-0 left-0 w-full transition-transform duration-500 px-6 ${
              step === 2 ? 'translate-x-0' : 'translate-x-full'
            }`}
            style={{ height: formHeight }}
          >
            <div className="grid grid-cols-1 gap-5">
              <div>
                <label htmlFor="graduation_year" className="block mb-1 text-sm font-semibold text-gray-700">
                  Graduation Year
                </label>
                <input
                  id="graduation_year"
                  name="graduation_year"
                  type="number"
                  placeholder="e.g., 2023"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md shadow-sm"
                  onChange={handleChange}
                  required
                  value={formData.graduation_year}
                />
              </div>

              <div>
                <label htmlFor="department" className="block mb-1 text-sm font-semibold text-gray-700">
                  Department
                </label>
                <input
                  id="department"
                  name="department"
                  type="text"
                  placeholder="Your department"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md shadow-sm"
                  onChange={handleChange}
                  required
                  value={formData.department}
                />
              </div>

              <div>
                <label htmlFor="college" className="block mb-1 text-sm font-semibold text-gray-700">
                  College / Institution
                </label>
                <input
                  id="college"
                  name="college"
                  type="text"
                  placeholder="Your college or institution"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md shadow-sm"
                  onChange={handleChange}
                  required
                  value={formData.college}
                />
              </div>

              <div>
                <label htmlFor="current_job" className="block mb-1 text-sm font-semibold text-gray-700">
                  Current Job (optional)
                </label>
                <input
                  id="current_job"
                  name="current_job"
                  type="text"
                  placeholder="Your current job"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md shadow-sm"
                  onChange={handleChange}
                  value={formData.current_job}
                />
              </div>

              <div>
                <label htmlFor="bio" className="block mb-1 text-sm font-semibold text-gray-700">
                  Short Bio (optional)
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  placeholder="Tell us a little about yourself"
                  rows="3"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md shadow-sm resize-none"
                  onChange={handleChange}
                  value={formData.bio}
                />
              </div>

              <div className="flex justify-between mt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 rounded-md bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 transition-colors duration-300"
                >
                  {loading ? 'Signing up...' : 'Sign Up'}
                </button>
              </div>
            </div>
          </div>
        </form>

        {message && (
          <p className="mt-6 text-center text-red-600 font-semibold">{message}</p>
        )}
      </div>
    </div>
  );
};

export default Signup;
