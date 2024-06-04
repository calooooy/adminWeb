import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaSlidersH } from 'react-icons/fa';
import Axios from 'axios';
import { Popover, Button, Select, Checkbox, Divider } from 'antd';

const { Option } = Select;

const SearchBar = ({ onSearch, onSort, findByCategory, findByCity, findByBarangay, findByFlag, savedSearchTermm, savedCategoryy, savedCityy, savedBarangayy, savedFlaggedd }) => {
  const [showPopover, setShowPopover] = useState(false);
  const containerRef = useRef(null);

  const [sortBy, setSortBy] = useState(null);
  const [searchTerm, setSearchTerm] = useState(savedSearchTermm || '');
  const [selectedCategory, setSelectedCategory] = useState(savedCategoryy || '');
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

  const togglePopover = (visible) => {
    setShowPopover(visible);
  };

  const resetFilters = () => {
    handleChange({ target: { value: '' } });
    setSelectedCategory('');
    setSelectedBarangay('');
    setSelectedCity('');
    setSortBy(null);
    findByCategory('');
    findByCity('');
    findByBarangay('');
    setFlaggedProviders(false);
    findByFlag(false);
  };

  const handleSort = (sortByValue) => {
    setSortBy(sortByValue);
    onSort(sortByValue);
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    findByCategory(value);
  };

  const handleCityChange = (value) => {
    setSelectedCity(value);
    setSelectedBarangay('');
    findByCity(value);
  };

  const handleBarangayChange = (value) => {
    setSelectedBarangay(value);
    findByBarangay(value);
  };

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
          <Popover
            content={
              <SidebarContent
                sortBy={sortBy}
                onSort={handleSort}
                resetFilters={resetFilters}
                setSelectedCategory={handleCategoryChange}
                setSelectedLocation1={handleCityChange}
                setSelectedLocation2={handleBarangayChange}
                selectedCategory={selectedCategory}
                selectedCity={selectedCity}
                selectedBarangay={selectedBarangay}
                flaggedProviders={flaggedProviders}
                handleCheckboxChange={handleCheckboxChange}
              />
            }
            title="Filter by"
            trigger="click"
            visible={showPopover}
            onVisibleChange={togglePopover}
            placement="bottomRight"
          >
            <FaSlidersH className="filter-icon" />
          </Popover>
        </div>
      </form>
    </div>
  );
};

const SidebarContent = ({ sortBy, onSort, resetFilters, setSelectedCategory, setSelectedLocation1, setSelectedLocation2, selectedCategory, selectedCity, selectedBarangay, flaggedProviders, handleCheckboxChange }) => {
  const [services, setServices] = useState([]);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await Axios.get('https://192.168.1.4:5001/service/getServices');
        setServices(response.data.data);
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };

    const fetchLocations = async () => {
      try {
        const response = await Axios.get('https://192.168.1.4:5001/location/getCities');
        setLocations(response.data.data);
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };

    fetchServices();
    fetchLocations();
  }, []);

  return (
    <div className="sidebar-content" style={{width: 250}}>
      <div className="" style={{padding: '0px 0px', display: 'flex', flexDirection: 'column', }}>
        <label htmlFor="category-dropdown" style={{padding: 0, margin: 0}}>Category</label>
        <Select
          id="category-dropdown"
          value={selectedCategory}
          onChange={setSelectedCategory}
          style={{ width: '100%' }}
        >
          <Option value=''>Select a category</Option>
          {services.map(service => (
            <Option key={service.key} value={service.name}>{service.name}</Option>
          ))}
        </Select>

        {/* <Divider  style={{padding: 3, margin: 0}}/> */}
        <div style={{padding: 0, display: 'flex', flexDirection: 'column', }}>
          <label htmlFor="location-dropdown" style={{margin: 0, padding: 0, }}>City</label>
          <Select
            id="location-dropdown"
            value={selectedCity}
            onChange={setSelectedLocation1}
            style={{ width: '100%' }}
          >
            <Option value=''>Select a city</Option>
            {locations.map(location => (
              <Option key={location.key} value={location.name}>{location.name}</Option>
            ))}
          </Select>
        </div>

        {selectedCity && (
          <>
            {/* <Divider style={{padding: 3, margin: 0}}/> */}
            <div style={{margin: 0, padding: 0, display: 'flex', flexDirection: 'column', justifyContent: 'start', alignItems: 'start'}}>
            <label htmlFor="barangay-dropdown" style={{padding: 0, margin: 0}}>Barangay</label>
            <Select
              id="barangay-dropdown"
              value={selectedBarangay}
              onChange={setSelectedLocation2}
              style={{ width: '100%' }}
            >
              <Option value=''>Select a barangay</Option>
              {locations.find(location => location.name === selectedCity)?.barangays.map(barangay => (
                <Option key={barangay} value={barangay}>{barangay}</Option>
              ))}
            </Select>
            </div>
          </>
        )}

        {/* <Divider style={{padding: 3, margin: 0, display: 'flex', justifyContent: 'center', alignItems: 'center'}}/> */}
        
        <div className="checkbox-container" style={{display: 'flex', justifyContent: 'start', alignItems: 'start', padding: '10px 0px'}}>
          <Checkbox
            checked={flaggedProviders}
            onChange={handleCheckboxChange}
            style={{display: 'flex', justifyContent: 'start', alignItems: 'start', padding: 0}}
          >
            Flagged Providers
          </Checkbox>
        </div>
        

        {/* <Divider style={{padding: 3, margin: 0}}/> */}
        <div className="sorting-buttons" style={{ gap: 5, padding: '5px 0px 0px 0px', margin: 0, display: 'flex', justifyContent: 'start', alignItems: 'centstarter' }}>
          <Button
            className={`sort-button ${sortBy === 'asc' ? 'active' : ''}`}
            style={{display: 'flex', justifyContent: 'center', alignContent: 'center', padding: 5, margin: 0}}
            onClick={() => onSort('asc')}
          >
            Sort ▲
          </Button>
          <Button
            className={`sort-button ${sortBy === 'desc' ? 'active' : ''}`}
            style={{display: 'flex', justifyContent: 'center', alignContent: 'center', padding: 5, margin: 0}}
            onClick={() => onSort('desc')}
          >
            Sort ▼
          </Button>
        </div>

        {/* <Divider style={{ padding: 3, margin: 0}} /> */}
        <div style={{ marginTop: 25, paddingBottom: 3, display: 'flex', justifyContent: 'center', alignContent: 'center', padding: '10px 0px' }}>
          <Button type="primary" onClick={resetFilters}>Reset</Button>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
