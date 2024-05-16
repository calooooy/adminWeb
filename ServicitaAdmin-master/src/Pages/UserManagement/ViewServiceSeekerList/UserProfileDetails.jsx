import React from 'react';

const UserProfileDetails = ({ user }) => {
  // Render user details here
  return (
    <div>
      <h2>{user.firstName} {user.lastName}</h2>
      <p>Email: {user.email}</p>
      {/* Add more user details here */}
    </div>
  );
};

export default UserProfileDetails;
