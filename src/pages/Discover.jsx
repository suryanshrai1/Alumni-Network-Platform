import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { FaSearch } from 'react-icons/fa';

const getInitials = (name) => {
  if (!name) return '?';
  const names = name.split(' ');
  const initials = names.map(n => n[0]).join('');
  return initials.substring(0, 2).toUpperCase();
};

const Discover = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCategory, setSearchCategory] = useState('all');

  const currentUser = JSON.parse(localStorage.getItem('alumniUser'));
  const currentUserId = currentUser?.id;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('users')
          .select('id, full_name, department, college, username');

        if (error) throw error;

        if (data) {
          setUsers(data);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;

    const lower = searchTerm.toLowerCase();

    return users.filter(user => {
      if (searchCategory === 'username') {
        return user.username === searchTerm;
      }
      if (searchCategory === 'all') {
        return (
          (user.full_name && user.full_name.toLowerCase().includes(lower)) ||
          (user.username && user.username.toLowerCase().includes(lower)) ||
          (user.department && user.department.toLowerCase().includes(lower)) ||
          (user.college && user.college.toLowerCase().includes(lower))
        );
      }
      return user[searchCategory] && user[searchCategory].toLowerCase().includes(lower);
    });
  }, [users, searchTerm, searchCategory]);

  const filteredOthers = filteredUsers.filter(u => u.id !== currentUserId);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(inputValue.trim());
  };

  const renderContent = () => {
    if (loading) {
      return <div className="text-center py-20 text-gray-500">Loading alumni...</div>;
    }

    if (!users || users.length === 0) {
      return (
        <div className="text-center py-20">
          <div className="bg-white rounded-lg shadow-md p-8 max-w-lg mx-auto">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">No Alumni Found</h2>
            <p className="text-gray-600">The connection to the database is successful, but there are no alumni records to display.</p>
            <p className="text-gray-600 mt-2">Please go to your Supabase dashboard and add some data to the 'users' table.</p>
          </div>
        </div>
      );
    }

    if (filteredUsers.length === 0 && searchTerm) {
      return (
        <div className="text-center py-20">
          <h2 className="text-2xl font-semibold text-gray-800">No Results Found</h2>
          <p className="text-gray-600 mt-2">No alumni match your search for "{searchTerm}".</p>
        </div>
      );
    }

    return (
      <div className="max-w-5xl mx-auto space-y-12">
        <section>
          <h2 className="text-3xl font-extrabold mb-6 text-gray-900">Alumni</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredOthers.map((user) => (
              <Link
                to={`/discover/user`}
                state={{ userId: user.id }}
                key={user.id}
                className="group"
              >
                <div className="bg-white rounded-xl shadow-md hover:shadow-xl transform group-hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                  <div className="p-4 flex-grow flex items-center">
                    <div className="flex-shrink-0 mr-5">
                      <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-2xl font-bold text-blue-600">{getInitials(user.full_name)}</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 truncate">{user.full_name}</h3>
                      <p className="text-base text-gray-500 truncate">{user.department}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-b-xl px-6 py-4 flex items-center justify-center">
                    <span className="text-base font-medium text-blue-600 group-hover:text-blue-800 transition-colors">View Profile &rarr;</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <main className="flex-grow">
        <div className="relative mb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Smaller header with margin top */}
          <h1
            className="text-4xl font-extrabold text-blue-800 mx-auto text-center mb-12 mt-8 tracking-tight"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Meet Our Alumni
          </h1>

          {/* View your profile button top right */}
          {currentUserId && (
            <Link
              to={`/discover/user`}
              state={{ userId: currentUserId }}
              className="absolute top-0 right-0 mt-4 mr-4 inline-flex items-center px-4 py-2 border border-blue-600 text-blue-600 rounded-full text-sm font-medium hover:bg-blue-50 transition"
            >
              View your profile
            </Link>
          )}

          {/* Clean, professional Search Form */}
          <form
            onSubmit={handleSearch}
            className="mt-6 max-w-xl mx-auto flex items-center shadow-sm rounded-full border border-gray-300 focus-within:border-blue-500 focus-within:shadow-md transition-colors bg-white"
          >
            <select
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
              className="bg-transparent px-5 py-3 text-lg text-gray-700 focus:outline-none border-r border-gray-300 rounded-l-full font-sans"
              aria-label="Search category"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              <option value="all">All</option>
              <option value="full_name">Name</option>
              <option value="username">Username</option>
              <option value="department">Department</option>
              <option value="college">College</option>
            </select>

            <input
              type="text"
              placeholder="Enter search term..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-grow px-6 py-3 text-lg text-gray-700 focus:outline-none font-sans"
              aria-label="Search alumni"
              style={{ fontFamily: "'Inter', sans-serif" }}
            />

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-r-full flex items-center justify-center transition"
              aria-label="Submit search"
            >
              <FaSearch className="w-5 h-5" />
            </button>
          </form>

          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Discover;
