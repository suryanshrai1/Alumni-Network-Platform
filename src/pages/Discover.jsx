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
  const [searchCategory, setSearchCategory] = useState('all'); // 'all', 'full_name', 'username', 'department', 'college'

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('users')
          .select('id, full_name, department, college, username');

        if (error) {
          throw error;
        }

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
    if (!searchTerm) {
      return users;
    }
    const lowercasedSearchTerm = searchTerm.toLowerCase();

    return users.filter(user => {
      // Exact match for username
      if (searchCategory === 'username') {
        return user.username === searchTerm;
      }
      
      // Partial match for 'all' category
      if (searchCategory === 'all') {
        return (
          (user.full_name && user.full_name.toLowerCase().includes(lowercasedSearchTerm)) ||
          (user.username && user.username.toLowerCase().includes(lowercasedSearchTerm)) ||
          (user.department && user.department.toLowerCase().includes(lowercasedSearchTerm)) ||
          (user.college && user.college.toLowerCase().includes(lowercasedSearchTerm))
        );
      } 
      
      // Partial match for other specific categories
      else {
        return user[searchCategory] && user[searchCategory].toLowerCase().includes(lowercasedSearchTerm);
      }
    });
  }, [users, searchTerm, searchCategory]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(inputValue);
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
        )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {filteredUsers.map((user) => (
          <Link to={`/discover/user`} state={{ userId: user.id }} key={user.id} className="group">
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
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
              Meet Our Alumni
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Browse profiles or use the search below to find someone specific.
            </p>
          </header>

          <form onSubmit={handleSearch} className="mb-12 max-w-lg mx-auto flex items-center gap-2">
            <div className="flex-shrink-0">
                <select
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                    className="h-full px-4 py-3 text-lg text-gray-700 bg-gray-50 border border-gray-300 rounded-l-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                    aria-label="Search category"
                >
                    <option value="all">All</option>
                    <option value="full_name">Name</option>
                    <option value="username">Username</option>
                    <option value="department">Department</option>
                    <option value="college">College</option>
                </select>
            </div>
            <div className="flex-grow relative">
                <input
                  type="text"
                  placeholder="Enter search term..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full pl-5 pr-12 py-3 text-lg text-gray-700 bg-white border-l-0 border border-gray-300 rounded-r-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                  aria-label="Search alumni"
                />
                <button
                  type="submit"
                  className="absolute inset-y-0 right-0 flex items-center justify-center w-12 h-full text-gray-500 hover:text-blue-600 rounded-full"
                  aria-label="Submit search"
                >
                  <FaSearch className="w-5 h-5" />
                </button>
            </div>
          </form>

          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Discover; 