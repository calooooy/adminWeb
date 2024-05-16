import React, { useState } from 'react';
import SearchBar from './searchBar';
import ProviderList from './providerList';

function ViewServiceProviderList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState(null);
  const [sortTerm, setSortTerm] = useState('');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [barangay, setBarangay] = useState('');
  const [flagged, setFlagged] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); // New state to track selected user
  const [isUserSelected, setIsUserSelected] = useState(false);
  const [savedSearchTerm, setSavedSearchTerm] = useState(''); // New state to store the search term when the user selects a user
  const [savedCategory, setSavedCategory] = useState(''); // New state to store the category when the user selects a user
  const [savedCity, setSavedCity] = useState(''); // New state to store the city when the user selects a user
  const [savedBarangay, setSavedBarangay] = useState(''); // New state to store the barangay when the user selects a user
  const [savedFlagged, setSavedFlagged] = useState(false); // New state to store the flagged status when the user selects a user

  const handleSearch = (searchTerm) => {
    setSearchTerm(searchTerm);
    setSavedSearchTerm(searchTerm);
    setIsUserSelected(false); // Set isUserSelected to false when the search term is changed
  };

  const handleSort = (sortByValue) => {
    if (sortBy === sortByValue) {
      setSortBy(null);
    } else {
      if (sortByValue === 'asc') {
        setSortTerm('asc');
      } else if (sortByValue === 'desc') {
        setSortTerm('desc');
      }
    }
  }

  const handleCategory = (category) => {
    setCategory(category);
    setSavedCategory(category);
  }

  const handleCity = (city) => {
    setCity(city);
    setSavedCity(city);
    setBarangay('');
  }
  
  const handleBarangay = (barangay) => {
    setBarangay(barangay);
    setSavedBarangay(barangay);
  }

  const handleFlagged = (flagged) => {
    setFlagged(flagged);
    setSavedFlagged(flagged);
  }

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setIsUserSelected(true);
  }

  const handleBackButtonClick = () => {
    setSelectedUser(null);
    setIsUserSelected(false); // Set isUserSelected to false when the back button is clicked
  }


  return (
    <div style={{ width: '100%' }}>
      <h1 className='DashboardHeader'>View Service Provider List</h1>
      <hr className='Divider' style={{ width: '1185px' }} />
      {!isUserSelected && ( // Render the SearchBar only if a user is not selected
        <div style={{ width: '1150px' }}>
          <SearchBar onSearch={handleSearch} onSort={handleSort} findByCategory={handleCategory} findByCity={handleCity} findByBarangay={handleBarangay} findByFlag={handleFlagged} savedSearchTermm={savedSearchTerm} savedCategoryy={savedCategory} savedCityy={savedCity} savedBarangayy={savedBarangay} savedFlaggedd={savedFlagged} />
        </div>
      )}
      <div>
        <ProviderList searchTerm={searchTerm} sortTerm={sortTerm} category={category} city={city} barangay={barangay} flagged={flagged} onSelectUser={handleUserSelect} toggleSearchBarVisibility={setIsUserSelected} />
      </div>
    </div>
  );
}

export default ViewServiceProviderList;
