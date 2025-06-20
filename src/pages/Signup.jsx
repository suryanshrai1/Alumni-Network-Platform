import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    state: '',
    phone: '',
    organization: '',
    jobTitle: '',
    roleDescription: '',
    interestReason: '',
    additionalInfo: '',
    interestAreas: []
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setForm(prev => ({
        ...prev,
        interestAreas: checked
          ? [...prev.interestAreas, value]
          : prev.interestAreas.filter(area => area !== value)
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const existingUser = users.find(u => u.email === form.email);

    if (existingUser) {
      alert('User already exists. Please login.');
    } else {
      users.push(form);
      localStorage.setItem('users', JSON.stringify(users));
      alert('Signup successful!');
      navigate('/login');
    }
  };

  const interestOptions = [
    'Advancement',
    'Alumni Affairs',
    'Alumni Career Support',
    'Alumni Directory',
    'Alumni Mentorship',
    'Donor Pipeline',
    'Event Management',
    'Fundraising'
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-6">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-2xl space-y-4">
        <h2 className="text-3xl font-bold mb-4">Create Your Account</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="firstName" value={form.firstName} onChange={handleChange} required placeholder="First Name *" className="border p-2 rounded w-full" />
          <input name="lastName" value={form.lastName} onChange={handleChange} required placeholder="Last Name *" className="border p-2 rounded w-full" />
          <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="Email *" className="border p-2 rounded w-full" />
          <input name="state" value={form.state} onChange={handleChange} required placeholder="State *" className="border p-2 rounded w-full" />
          <input name="phone" type="tel" value={form.phone} onChange={handleChange} required placeholder="Phone Number *" className="border p-2 rounded w-full" />
          <input name="organization" value={form.organization} onChange={handleChange} required placeholder="University/Organization Name *" className="border p-2 rounded w-full" />
          <input name="jobTitle" value={form.jobTitle} onChange={handleChange} required placeholder="Job Title *" className="border p-2 rounded w-full" />
          
          <select name="roleDescription" value={form.roleDescription} onChange={handleChange} required className="border p-2 rounded w-full">
            <option value="">Which of these best describes you? *</option>
            <option>Student</option>
            <option>Alumnus</option>
            <option>Faculty</option>
            <option>Staff</option>
            <option>Other</option>
          </select>
        </div>

        <textarea
          name="interestReason"
          value={form.interestReason}
          onChange={handleChange}
          placeholder="What sparked your interest in our alumni platform? *"
          required
          className="border p-2 rounded w-full"
        />

        <textarea
          name="additionalInfo"
          value={form.additionalInfo}
          onChange={handleChange}
          placeholder="Please share additional information to ensure we route your request to the right team."
          className="border p-2 rounded w-full"
        />

        <fieldset className="border p-4 rounded">
          <legend className="font-semibold mb-2">Interest areas (select all that apply):</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {interestOptions.map(option => (
              <label key={option} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={option}
                  checked={form.interestAreas.includes(option)}
                  onChange={handleChange}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <button type="submit" className="w-full bg-green-600 text-white p-3 rounded hover:bg-green-700">
          Sign Up
        </button>

        <p className="text-sm mt-2">
          Already have an account? <a href="/login" className="text-blue-600 underline">Login</a>
        </p>
      </form>
    </div>
  );
};

export default Signup;
