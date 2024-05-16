import React, { useState } from 'react';
import SearchBar from './searchBar';
import SeekerList from './seekerList';

function ViewServiceSeekerList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState(null);
  const [sortTerm, setSortTerm] = useState('');
  const [city, setCity] = useState('');
  const [barangay, setBarangay] = useState('');
  const [flagged, setFlagged] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); // New state to track selected user
  const [isUserSelected, setIsUserSelected] = useState(false);
  const [savedSearchTerm, setSavedSearchTerm] = useState('');
  const [savedCity, setSavedCity] = useState(''); // New state to store the city when the user selects a user
  const [savedBarangay, setSavedBarangay] = useState(''); // New state to store the barangay when the user selects a user
  const [savedFlagged, setSavedFlagged] = useState(false); // New state to store the flagged status when the user selects a user

  const handleSearch = (searchTerm) => {
    setSearchTerm(searchTerm);
    setSavedSearchTerm(searchTerm);
    setIsUserSelected(false);
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
      <h1 className='DashboardHeader'>View Service Seeker List</h1>
      <hr className='Divider' style={{ width: '1185px' }} />
      {!isUserSelected && ( // Render the SearchBar only if a user is not selected
        <div style={{ width: '1150px' }}>
          <SearchBar onSearch={handleSearch} onSort={handleSort} findByCity={handleCity} findByBarangay={handleBarangay} findByFlag={handleFlagged} savedSearchTermm={savedSearchTerm} savedCityy={savedCity} savedBarangayy={savedBarangay} savedFlaggedd={savedFlagged}/>
        </div>
      )}
      <div>
        <SeekerList searchTerm={searchTerm} sortTerm={sortTerm} city={city} barangay={barangay} flagged={flagged} onSelectUser={handleUserSelect} toggleSearchBarVisibility={setIsUserSelected} />
      </div>
    </div>
  );
}

export default ViewServiceSeekerList;
