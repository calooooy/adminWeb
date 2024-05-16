import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaSlidersH, FaTimes } from 'react-icons/fa';
import Axios from 'axios';

const SearchBar = ({ onSearch, onSort, findByCity, findByBarangay, findByFlag, savedSearchTermm, savedCityy, savedBarangayy, savedFlaggedd }) => {
  const [showSidebar, setShowSidebar] = useState(false);
  const sidebarRef = useRef(null);
  const containerRef = useRef(null);

  const [sortBy, setSortBy] = useState(null);
  const [searchTerm, setSearchTerm] = useState(savedSearchTermm || '');
  const [selectedCity, setSelectedCity] = useState(savedCityy || '');
  const [selectedBarangay, setSelectedBarangay] = useState(savedBarangayy || '');
  const [flaggedProviders, setFlaggedProviders] = useState(savedFlaggedd || false);

  const handleChange = (event) => {
    const { value } = event.target;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch(searchTerm);
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        closeSidebar();
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const closeSidebar = () => {
    setShowSidebar(false);
  };

  const resetFilters = () => {
    handleChange({ target: { value: '' } });
    setSelectedBarangay('');
    setSelectedCity('');
    setSortBy(null);
    findByCity('');
    findByBarangay('');
    setFlaggedProviders(false);
    findByFlag(false);

    const dropdown = document.getElementById('location-dropdown');
    dropdown.selectedIndex = 0;

    const flaggedCheckbox = document.getElementById('flagged-providers-checkbox');
    flaggedCheckbox.checked = false;

    const sortButtons = document.querySelectorAll('.sort-button');
    sortButtons.forEach(btn => btn.classList.remove('active'));

  };


  const handleSort = (sortByValue) => {
    if (sortBy === sortByValue) {
      setSortBy(null);
    } else {
      if (sortByValue === 'asc') {
        onSort('asc');
      } else if (sortByValue === 'desc') {
        onSort('desc');
      }
    }
  };

  const handleCityChange = (event) => {
    setSelectedCity(event);
    setSelectedBarangay('');
    findByCity(event);
  }

  const handleBarangayChange = (event) => {
    setSelectedBarangay(event);
    findByBarangay(event);
  }

  const handleCheckboxChange = (event) => {
    setFlaggedProviders(event.target.checked);
    findByFlag(event.target.checked);
  };

  return (
    <div ref={containerRef}>
      <form onSubmit={handleSubmit} className="search-bar-container">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleChange}
            className="search-input"
          />
          <FaSlidersH
            className="filter-icon"
            onClick={toggleSidebar}
          />
        </div>
      </form>
      {showSidebar && (
        <Sidebar ref={sidebarRef} onClose={closeSidebar} sortBy={sortBy} onSort={handleSort} resetFilters={resetFilters} setSelectedLocation1={handleCityChange} setSelectedLocation2={handleBarangayChange} selectedCity={selectedCity} selectedBarangay={selectedBarangay} flaggedProviders={flaggedProviders} handleCheckboxChange={handleCheckboxChange} />
      )}
    </div>
  );
};

const Sidebar = ({ onClose, sortBy, onSort, resetFilters, setSelectedLocation1, setSelectedLocation2, selectedCity, selectedBarangay, flaggedProviders, handleCheckboxChange }) => {

  const [locations, setLocations] = useState([]);
  const [selectedCitys, setSelectedCity] = useState(selectedCity);
  const [selectedBarangays, setSelectedBarangay] = useState(selectedBarangay);

  const fetchLocations = async () => {
    try {
      const response = await Axios.get('http://172.16.4.26:5000/location/getCities');
      setLocations(response.data.data);
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const handleLocationChange = (event) => {
    const { value } = event.target;
    setSelectedCity(value);
    setSelectedLocation1(value);
  }

  const handleLocationChange2 = (event) => {
    const { value } = event.target;
    setSelectedBarangay(value);
    setSelectedLocation2(value);
  }

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleReset = () => {
    setSelectedCity('');
    resetFilters();
  };

  return (
    <div className="sidebar">
      <div className='sidebar-header'>
        <div className='filterHeader'>
          Filter by
          <button onClick={onClose} className='close-button'>
            <FaTimes />
          </button>
        </div>
      </div>
      <div className='sidebar-body'>
        <div className="dropdown-container">
          <label htmlFor="location-dropdown">Location</label>
          <select id="location-dropdown1" onChange={handleLocationChange} value={selectedCitys}>
            <option value=''>Select a city</option>
            {locations.map(location => (
              <option key={location.key} value={location.name}>{location.name}</option>
            ))}
          </select>

          {selectedCity && (
            <select id="location-dropdown2" onChange={handleLocationChange2} value={selectedBarangays}>
              <option value=''>Select a barangay</option>
              {selectedCity && locations.find(location => location.name === selectedCity)?.barangays.map(barangay => (
                <option key={barangay} value={barangay}>{barangay}</option>
              ))}
            </select>
          )}

          <div className="checkbox-container">
            <div className="label-and-buttons-container">
              <label htmlFor="AlphabeticalOrder">Alphabetical Order</label>
              <div className="sorting-buttons">
                <button
                  className={`sort-button ${sortBy === 'asc' && 'active'}`}
                  onClick={() => onSort('asc')}
                >
                  ▲
                </button>
                <button
                  className={`sort-button ${sortBy === 'desc' && 'active'}`}
                  onClick={() => onSort('desc')}
                >
                  ▼
                </button>
              </div>
            </div>
            <div className="flagged-providers">
              <label htmlFor="flagged-providers-checkbox">Flagged Seekers</label>
              <input className='flaggedCheckbox' type="checkbox" id="flagged-providers-checkbox" checked={flaggedProviders} onChange={handleCheckboxChange} />
            </div>
          </div>
        </div>
        <div className="sidebar-buttons">
          <button className="provider-reset-button" onClick={handleReset}>Reset</button>
          {/* <button className="provider-apply-button">Apply</button> */}
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
