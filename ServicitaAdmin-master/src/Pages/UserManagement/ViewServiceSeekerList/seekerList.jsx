import React, { useState, useEffect } from 'react';
import { FaEllipsisV, FaAngleLeft, FaStar, FaStarHalfAlt } from 'react-icons/fa';
import { Table, Dropdown, Menu, Space } from 'antd';
import { getFirestore, collection, getDocs, getDoc, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import Axios from 'axios';

function SeekerList({ searchTerm, sortTerm, city, barangay, flagged, onSelectUser, toggleSearchBarVisibility }) {
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deletedUser, setDeletedUser] = useState(false);
  const [unsuspendUser, setUnsuspendUser] = useState(false);

  useEffect(() => {
    setLoading(true);
    const db = getFirestore();
    const seekerCollection = collection(db, "seekers");

    const fetchSeekers = async () => {
      try {
        const querySnapshot = await getDocs(seekerCollection);
        const seekerData = [];

        await Promise.all(querySnapshot.docs.map(async (doc) => {
          const data = doc.data();
          const firstName = data.name?.firstName || "";
          const lastName = data.name?.lastName || "";
          const fullName = `${firstName} ${lastName}`;
          const streetAddress1 = data.address?.streetAddress1 || "";
          const streetAddress2 = data.address?.streetAddress2 || "";
          const barangay = data.address?.barangay || "";
          const city = data.address?.cityMunicipality || "";
          const fullAddress = streetAddress2 !== "" ? `${streetAddress1}, ${streetAddress2}, ${barangay}, ${city}` : `${streetAddress1}, ${barangay}, ${city}`;
          const seekerInfo = {
            id: doc.id,
            fullName: fullName,
            address: fullAddress,
            city: data.address.cityMunicipality || "",
            barangay: data.address.barangay || "",
            servicesAvailed: data.servicesAvailed || 0,
            reportsReceived: data.reportsReceived || 0,
            violationRecord: data.violationRecord || 0,
          };
          const response = await Axios.get(`http://172.16.4.26:5000/admin/getUser/${doc.id}`);
          const userData = response.data.data;
          seekerInfo.profileImage = userData.profileImage;
          seekerInfo.email = userData.email;
          seekerInfo.phone = userData.mobile;
          seekerInfo.suspension = userData.suspension;
          seekerData.push(seekerInfo);
        }));

        setDataSource(seekerData);
        setLoading(false);

      } catch (error) {
        console.error("Error fetching seekers ", error);
      } finally {
        setLoading(false);
        setDeletedUser(false);
        setUnsuspendUser(false);
      }
    };

    fetchSeekers();

    // const unsubscribe = onSnapshot(seekerCollection, () => {
    //   fetchSeekers();
    // });

    // return () => unsubscribe();


  }, [flagged, selectedUser, deletedUser, unsuspendUser]);


  const filteredDataByFlag = dataSource.filter((data) => {
    if (flagged === false) {
      return data;
    } else if (data.suspension && data.suspension.isSuspended === true) {
      return data;
    }
  });

  const filteredDataByCity = filteredDataByFlag.filter((data) => {

    if (city === '') {
      return data;
    } else if (data.city === city) {
      return data;
    }
  });

  const filteredDataByBarangay = filteredDataByCity.filter((data) => {
    if (barangay === '') {
      return data;
    } else if (data.barangay === barangay) {
      return data;
    }
  });

  const filteredDataBySearch = filteredDataByBarangay.filter((data) => {
    if (searchTerm === '') {
      return data;
    } else if (data.fullName.toLowerCase().includes(searchTerm.toLowerCase())) {
      return data;
    }
  });

  const filteredDataBySort = filteredDataBySearch.sort((a, b) => {
    if (sortTerm === 'asc') {
      return a.fullName.localeCompare(b.fullName);
    } else if (sortTerm === 'desc') {
      return b.fullName.localeCompare(a.fullName);
    } else {
      return 0;
    }
  });


  // useEffect(() => {
  //   if (selectedUser) {
  //     onSelectUser(selectedUser);
  //     const db = getFirestore();
  //     const seekerCollection = collection(db, "seekers");
  //     const seekerDoc = doc(seekerCollection, selectedUser.id);

  //     const unsubscribe = onSnapshot(seekerDoc, async (doc) => {
  //       const data = doc.data();
  //       const firstName = data.name?.firstName || "";
  //       const lastName = data.name?.lastName || "";
  //       const fullName = `${firstName} ${lastName}`;
  //       const streetAddress1 = data.address?.streetAddress1 || "";
  //       const streetAddress2 = data.address?.streetAddress2 || "";
  //       const barangay = data.address?.barangay || "";
  //       const city = data.address?.cityMunicipality || "";
  //       const fullAddress = `${streetAddress1}, ${streetAddress2}, ${barangay}, ${city}`;
  //       const updatedUser = {
  //         id: doc.id,
  //         fullName: fullName,
  //         address: fullAddress,
  //         rating: data.rating || 0,
  //         servicesAvailed: data.servicesAvailed || 0,
  //         reportsReceived: data.reportsReceived || 0,
  //         violationRecord: data.violationRecord || 0,
  //       };
  //       const response = await Axios.get(`http://192.168.1.10:5000/admin/getUser/${doc.id}`);
  //       const userData = response.data.data;
  //       updatedUser.profileImage = userData.profileImage;
  //       updatedUser.email = userData.email;
  //       updatedUser.phone = userData.mobile;
  //       setSelectedUser(updatedUser);
  //     });

  //     return () => unsubscribe();
  //   }
  // }, [selectedUser, onSelectUser]);

  const renderName = (text, record) => (
    <span
      style={{ textAlign: 'left', fontSize: '20px', cursor: 'pointer' }}
      onClick={() => handleItemClick(record)}
      onMouseEnter={(e) => { e.target.style.textDecoration = 'underline'; e.target.style.color = '#75B9D9'; }} // Underline on hover
      onMouseLeave={(e) => { e.target.style.textDecoration = 'none'; e.target.style.color = 'black'; }} // Remove underline when not hovered
      // onClick={(e) => e.preventDefault()} // Prevent default click behavior
    >
      {text}
    </span>
  );

  const renderEmail = (text, record) => (
    <div
      style={{ display: 'flex', justifyContent: 'left', cursor: 'pointer' }}
      onClick={() => handleItemClick(record)}
    >
      <span
        style={{
          textAlign: 'center',
          textDecoration: 'none', // Remove underline by default
          color: 'inherit' // Use the default text color
        }}
        onMouseEnter={(e) => { e.target.style.textDecoration = 'underline'; e.target.style.color = '#75B9D9'; }} // Underline on hover
        onMouseLeave={(e) => { e.target.style.textDecoration = 'none'; e.target.style.color = 'black'; }} // Remove underline when not hovered
        onClick={(e) => e.preventDefault()} // Prevent default click behavior
      >
        {text}
      </span>
    </div>
  );


  const renderMobile = (text, record) => {
    const phoneNumber = text.startsWith('+63') ? '0' + text.slice(3) : text;
    return (
      <div
        style={{ display: 'flex', justifyContent: 'center', cursor: 'pointer' }}
        onClick={() => handleItemClick(record)}
      >
        <span
          style={{
            textAlign: 'center',
            textDecoration: 'none', // Remove underline by default
            color: 'inherit' // Use the default text color
          }}
          onMouseEnter={(e) => { e.target.style.textDecoration = 'underline'; e.target.style.color = '#75B9D9'; }} // Underline on hover
          onMouseLeave={(e) => { e.target.style.textDecoration = 'none'; e.target.style.color = 'black'; }} // Remove underline when not hovered
          onClick={(e) => e.preventDefault()} // Prevent default click behavior
        >
          {phoneNumber}
        </span>
      </div>
    );
  };

  const renderServicesAvailed = (text, record) => (
    <div
      style={{ display: 'flex', justifyContent: 'center', cursor: 'pointer' }}
      onClick={() => handleItemClick(record)}
    >
      <div style={{ width: 200, height: 35, backgroundColor: '#CFDFE7', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <span style={{ textAlign: 'center' }}>{"Services Availed: " + text}</span>
      </div>
    </div>
  );

  const renderReportsReceived = (text, record) => (
    <div
      style={{ display: 'flex', justifyContent: 'center', cursor: 'pointer' }}
      onClick={() => handleItemClick(record)}
    >
      <div style={{ width: 200, height: 35, backgroundColor: '#CFDFE7', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <span style={{ textAlign: 'center' }}>{"Reports Received: " + text}</span>
      </div>
    </div>
  );

  const renderImage = (url, record) => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        cursor: 'pointer'
      }}
      onClick={() => handleItemClick(record)}
    >
      <div style={{ width: 50, height: 50, borderRadius: '50%', overflow: 'hidden' }}>
        <img src={url} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    </div>
  );

  const handleItemClick = (record) => {
    setSelectedUser(record);
    toggleSearchBarVisibility(true);
  };

  const handleCloseProfile = () => {
    setSelectedUser(null);
    toggleSearchBarVisibility(false);
  };

  const handleSubMenuClick = (record, action) => {

    try {
      const userData = {
        userId: record.id,
        action: action
      }

      if (typeof action !== 'number') {
        throw new Error('Action must be a number');
      }
      Axios.patch('http://172.16.4.26:5000/admin/suspendUser', userData)
        .then((response) => {
          alert('User suspended successfully');
        }
        )
        .catch((error) => {
          console.error('Error suspending user: ', error);
        });
    } catch (error) {
      console.error('Error suspending user: ', error);
    }
  }

  const handleDelete = (record) => {
    console.log(record.id)
    Axios.post(`http://172.16.4.26:5000/admin/deleteUser`, { userId: record.id })
      .then((response) => {
        const db = getFirestore();
        const seekerCollection = collection(db, "seekers");
        const seekerDoc = doc(seekerCollection, record.id);
        deleteDoc(seekerDoc)
          .then(() => {
            alert('User deleted successfully');
            setDeletedUser(true);
          })
          .catch((error) => {
            console.error('Error deleting Firestore document: ', error);
          });
      })
      .catch((error) => {
        console.error('Error deleting user: ', error);
      });
  }

  const handleUnsuspend = (record) => {
    try {
      const userData = {
        email: record.email
      }
      Axios.patch('http://172.16.4.26:5000/admin/unsuspendUser', userData)
        .then((response) => {
          alert('User unsuspended successfully');
          setUnsuspendUser(true);
        })
        .catch((error) => {
          console.error('Error unsuspending user: ', error);
        });
    } catch (error) {
      console.error('Error unsuspending user: ', error);
    }
  }

  const renderActions = (text, record) => {

    if (!record) {
      return null;
    }

    return (
      <Dropdown
        overlay={
          <Menu>
            <Menu.Item key="reward">Reward</Menu.Item>
            {record.suspension && record.suspension.isSuspended === true ? <Menu.Item key="unsuspend" onClick={() => handleUnsuspend(record)}>Unsuspend</Menu.Item> : <Menu.SubMenu title="Suspend">
              <Menu.Item key="5_hours" onClick={() => handleSubMenuClick(record, 5)}>5 hours</Menu.Item>
              <Menu.Item key="1_day" onClick={() => handleSubMenuClick(record, 24)}>1 day</Menu.Item>
              <Menu.Item key="1_week" onClick={() => handleSubMenuClick(record, 168)}>1 week</Menu.Item>
            </Menu.SubMenu>
            }



            <Menu.Item key="delete" onClick={() => handleDelete(record)}>Delete</Menu.Item>
          </Menu>
        }
        trigger={['click']}
      >
        <span className="ellipsis-icon">
          <FaEllipsisV />
        </span>
      </Dropdown>
    )
  };


  const renderStarRating = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    const stars = [];
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<FaStar key={i} className="star" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="star" />);
      } else {
        stars.push(<FaStar key={i} className="empty-star" />);
      }
    }

    return <div className="star-rating">{stars}</div>;
  };

  function UserDetails({ userDetails }) {
    const { email, phone, address } = userDetails;

    return (
      <div className="user-details-wrapper">
        <div className='tableRow'>
          Email:&nbsp;<span>{email}</span>
        </div>
        <div className='tableRow'>
          Phone:&nbsp;<span>{phone}</span>
        </div>
        <div className='tableRow'>
          Address:&nbsp;<span>{address}</span>
        </div>
      </div>
    );
  }

  function UserDetailCard({ title, value }) {
    return (
      <div className="userDetailCard">
        <div className="userDetailCardTitle">{title}</div>
        <div className="userDetailCardValue">{value}</div>
      </div>
    );
  }



  return (
    <div>
      {selectedUser && (
        <div>
          <div className="profileHeader">
            {/* Back button */}
            <div className="back-button" onClick={handleCloseProfile}>
              <FaAngleLeft />
            </div>
            {/* Profile picture */}
            <div className="profile-picture-container">
              <img className="profile-picture" src={selectedUser.profileImage} alt="Profile" />
            </div>
            {/* Render detailed user profile details here */}
            <div>
              <p className="profile-username">{selectedUser.fullName}</p>
              {/* Star rating frame */}

              {/* Add more details as needed */}
            </div>

            {/* Profile actions */}
            <div className="profile-actions">
              {renderActions(selectedUser, selectedUser)}
            </div>

          </div>
          <div className="profileBody">
            <div className='leftSide'>
              <div classname='userDetailsContainer'>
                <UserDetails userDetails={selectedUser} />
              </div>
              <div className="userDetailCardsContainer">
                <UserDetailCard title={"Services Availed"} value={selectedUser.servicesAvailed} />
                <UserDetailCard title={"Reports Received"} value={selectedUser.reportsReceived} />
                <UserDetailCard title={"Violation Record"} value={selectedUser.violationRecord} />
              </div>
            </div>
            <div class="verticalLine"></div>
            <div className='rightSide'>
              Preferred Services:
            </div>
          </div>
        </div>
      )}

      {!selectedUser && (
        <div className="scrollable-table">
          <Table
            style={{ width: '100%' }}
            components={{
              body: {
                cell: ({ children }) => <td>{children}</td>
              }
            }}
            size='small'
            columns={[
              {
                dataIndex: "profileImage",
                render: (url, record) => renderImage(url, record),
                width: '100px',
              },
              {
                dataIndex: "fullName",
                render: (text, record) => renderName(text, record)
              },
              {
                dataIndex: "email",
                render: (text, record) => renderEmail(text, record)
              },
              {
                dataIndex: "phone",
                render: (text, record) => renderMobile(text, record)
              },
              {
                dataIndex: "servicesAvailed",
                render: (text, record) => renderServicesAvailed(text, record)
              },
              {
                dataIndex: "reportsReceived",
                render: (text, record) => renderReportsReceived(text, record)
              },
              {
                dataIndex: 'actions',
                render: renderActions,
                width: '50px',
              }
            ]}
            loading={loading}
            dataSource={filteredDataBySort}
            pagination={false}
          />
        </div>
      )}
    </div>
  );

}

export default SeekerList;
