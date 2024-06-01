import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaSlidersH, FaTimes } from 'react-icons/fa';
import Axios from 'axios';

const SearchBar = ({ onSearch, onSort, findByCategory, findByCity, findByBarangay, findByFlag, savedSearchTermm, savedCategoryy, savedCityy, savedBarangayy, savedFlaggedd }) => {
  const [showSidebar, setShowSidebar] = useState(false);
  const sidebarRef = useRef(null);
  const containerRef = useRef(null);

  const [sortBy, setSortBy] = useState(null);
  const [searchTerm, setSearchTerm] = useState(savedSearchTermm || '');
  const [selectedType, setSelectedType] = useState(savedCategoryy || '');
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

    setSelectedType('');
    setSelectedBarangay('');
    setSelectedCity('');
    setSortBy(null);
    findByCategory('');
    findByCity('');
    findByBarangay('');
    handleChange({ target: { value: '' } });
    setFlaggedProviders(false);
    findByFlag(false);

    // Reset category dropdown to default option (e.g., Option 1)
    const categoryDropdown = document.getElementById('category-dropdown');
    categoryDropdown.selectedIndex = 0;

    // Reset location dropdown to default option (e.g., Option 1)
    const locationDropdown = document.getElementById('location-dropdown1');
    locationDropdown.selectedIndex = 0;

    // Reset flagged provider checkbox
    const flaggedCheckbox = document.getElementById('flagged-providers-checkbox');
    flaggedCheckbox.checked = false;

    // Remove active class from sorting buttons
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

  const handleCategoryChange = (event) => {
    setSelectedType(event);
    
    findByCategory(event);
  }

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
        <Sidebar ref={sidebarRef} onClose={closeSidebar} sortBy={sortBy} onSort={handleSort} resetFilters={resetFilters} setSelectedCategory={handleCategoryChange} setSelectedLocation1={handleCityChange} setSelectedLocation2={handleBarangayChange} selectedType={selectedType} selectedCity={selectedCity} selectedBarangay={selectedBarangay} flaggedProviders={flaggedProviders} handleCheckboxChange={handleCheckboxChange} />
      )}
    </div>
  );
};

const Sidebar = ({ onClose, sortBy, onSort, resetFilters, setSelectedCategory, setSelectedLocation1, setSelectedLocation2, selectedType, selectedCity, selectedBarangay, flaggedProviders, handleCheckboxChange }) => {

  const [services, setServices] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedTypes, setSelectedType] = useState(selectedType);
  const [selectedCitys, setSelectedCity] = useState(selectedCity);
  const [selectedBarangays, setSelectedBarangay] = useState(selectedBarangay);

  console.log(selectedTypes);
  console.log(selectedCitys);
  console.log(selectedBarangays);

  const fetchServices = async () => {
    try {
      const response = await Axios.get('http://192.168.1.10:5000/service/getServices');
      setServices(response.data.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await Axios.get('http://192.168.1.10:5000/location/getCities');
      setLocations(response.data.data);
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };


  const handleCategoryChange = (event) => {
    const { value } = event.target;
    setSelectedType(value);
    setSelectedCategory(value);
  }

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
    fetchServices();
    fetchLocations();
  }, []);

  const handleReset = () => {
    setSelectedType('');
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


          <label htmlFor="category-dropdown">Category</label>
          <select id="category-dropdown" onChange={handleCategoryChange} value={selectedTypes}>
            <option value=''>Select a category</option>
            {services.map(service => (
              <option key={service.key} value={service.name}>{service.name}</option>
            ))}
          </select>

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
              <label htmlFor="flagged-providers-checkbox">Flagged Providers</label>
              <input className='flaggedCheckbox' type="checkbox" id="flagged-providers-checkbox" checked={flaggedProviders} onChange={handleCheckboxChange} />
            </div>
          </div>
        </div>
        <div className="provider-sidebar-buttons">
          <button className="provider-reset-button" onClick={handleReset}>Reset</button>
          {/* <button className="provider-apply-button">Apply</button> */}
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
