import React, { useState, useEffect } from 'react';
import { FaEllipsisV, FaAngleLeft, FaStar, FaStarHalfAlt } from 'react-icons/fa';
import { Table, Dropdown, Menu, Space, Modal } from 'antd';
import { getFirestore, collection, getDocs, getDoc, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import Axios from 'axios';

function SeekerList({ searchTerm, sortTerm, city, barangay, flagged, onSelectUser, toggleSearchBarVisibility }) {
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deletedUser, setDeletedUser] = useState(false);
  const [unsuspendUser, setUnsuspendUser] = useState(false);

  const [width, setWidth] = useState(window.innerWidth);

  const updateWidth = () => {
    setWidth(window.innerWidth);
  };

  useEffect(() => {
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

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
          const response = await Axios.get(`http://3.26.59.191://admin/getUser/${doc.id}`);
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
  //       const response = await Axios.get(`http://3.26.59.191://admin/getUser/${doc.id}`);
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
      style={{ textAlign: 'left', fontSize: '18px', cursor: 'pointer' }}
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
      <span
        style={{
          textAlign: 'center',
          textDecoration: 'none', // Remove underline by default
          color: 'inherit', // Use the default text color
          fontSize: '15px',
          whiteSpace: 'normal', // Allow text to wrap
          wordWrap: 'break-word', // Break long words
        }}
        onMouseEnter={(e) => { e.target.style.textDecoration = 'underline'; e.target.style.color = '#75B9D9'; }} // Underline on hover
        onMouseLeave={(e) => { e.target.style.textDecoration = 'none'; e.target.style.color = 'black'; }} // Remove underline when not hovered
        onClick={(e) => e.preventDefault()} // Prevent default click behavior
      >
        {"Services Availed: " + text}
      </span>
    </div>
  );
  
  const renderReportsReceived = (text, record) => (
    <div
      style={{ display: 'flex', justifyContent: 'center', cursor: 'pointer' }}
      onClick={() => handleItemClick(record)}
    >
      <span
        style={{
          textAlign: 'center',
          textDecoration: 'none', // Remove underline by default
          color: 'inherit', // Use the default text color
          fontSize: '15px',
          whiteSpace: 'normal', // Allow text to wrap
          wordWrap: 'break-word', // Break long words
        }}
        onMouseEnter={(e) => { e.target.style.textDecoration = 'underline'; e.target.style.color = '#75B9D9'; }} // Underline on hover
        onMouseLeave={(e) => { e.target.style.textDecoration = 'none'; e.target.style.color = 'black'; }} // Remove underline when not hovered
        onClick={(e) => e.preventDefault()} // Prevent default click behavior
      >
        {"Reports Received: " + text}
      </span>
    </div>
  );
  

  // const renderServicesAvailed = (text, record) => (
  //   <div
  //     style={{ display: 'flex', justifyContent: 'center', cursor: 'pointer' }}
  //     onClick={() => handleItemClick(record)}
  //   >
  //     {/* <div style={{ width: 200, height: 35, backgroundColor: '#CFDFE7', display: 'flex', justifyContent: 'center', alignItems: 'center' }}> */}
  //       <span style={{ textAlign: 'center' }}>{"Services Availed: " + text}</span>
  //     {/* </div> */}
  //   </div>
  // );

  // const renderReportsReceived = (text, record) => (
  //   <div
  //     style={{ display: 'flex', justifyContent: 'center', cursor: 'pointer' }}
  //     onClick={() => handleItemClick(record)}
  //   >
  //     {/* <div style={{ width: 200, height: 35, backgroundColor: '#CFDFE7', display: 'flex', justifyContent: 'center', alignItems: 'center' }}> */}
  //       <span style={{ textAlign: 'center' }}>{"Reports Received: " + text}</span>
  //     {/* </div> */}
  //   </div>
  // );

  const renderImage = (url, record) => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        cursor: 'pointer'
      }}
      onClick={() => handleItemClick(record)}
    >
      <div style={{ width: 50, height: 50, borderRadius: '50%', overflow: 'hidden', border: '2px solid #75B9D9' }}>
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
      Axios.patch('http://3.26.59.191://admin/suspendUser', userData)
        .then((response) => {
          alert('User suspended successfully');
        }
        )
        .catch((error) => {
          console.error('Error suspending user: ', error);
        });
    } catch (error) {
      console.error('Error suspending user: ', error);
    } finally {
      setLoading(false)
    }
  }

  const handleReward = (record) => {
    Modal.info({
      title: 'Rewards and Voucers',
      content: 'This feature is coming soon.',
      centered: true,
    });
  };

  const handleDelete = (record) => {
    console.log(record.id)
    Axios.post(`http://3.26.59.191://admin/deleteUser`, { userId: record.id })
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
    setLoading(true)
    try {
      const userData = {
        email: record.email
      }
      Axios.patch('http://3.26.59.191://admin/unsuspendUser', userData)
        .then((response) => {
          alert('User unsuspended successfully');
          setUnsuspendUser(true);
        })
        .catch((error) => {
          console.error('Error unsuspending user: ', error);
        });
        
    } catch (error) {
      console.error('Error unsuspending user: ', error);
    } finally {
      setLoading(false)
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
            <Menu.Item key="reward" onClick={() => handleReward(record)}>Reward</Menu.Item>
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
      <div className="user-details-wrapper1" style={{fontWeight: 'bold'}}>
        <div className='tableRow1' style={{backgroundColor: '#ededed', padding: '10px 15px', borderRadius: 15, marginBottom: 10}}>
          Email:&nbsp;<span>{email}</span>
        </div>
        <div className='tableRow1' style={{backgroundColor: '#ededed', padding: '10px 15px', borderRadius: 15, marginBottom: 10}}>
          Phone:&nbsp;<span>{phone}</span>
        </div>
        <div className='tableRow1' style={{backgroundColor: '#ededed', padding: '10px 15px', borderRadius: 15, marginBottom: 10}}>
          Address:&nbsp;<span>{address}</span>
        </div>
      </div>
    );
  }

  function UserDetailCard({ title, value }) {
    return (
      <div className="userDetailCard1" style={{ borderRadius: 10, height: 200, padding: '20px 10px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#ededed'}}>
        <div className="userDetailCardTitle1" style={{fontWeight: 'bold', fontSize: 24, textAlign: 'center'}}>{title}</div>
        <div className="userDetailCardValue1" style={{fontWeight: 'bolder', fontSize: 64, color: '#266F92'}}>{value}</div>
      </div>
    );
  }



  return (
    <div>
      {selectedUser && (
        <div className='selectedSeeker1' style={{padding: 20}}>
          <div className="profileHeader1" style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', weight: '100%', backgroundColor: '#266f92', padding: 15, margin: 0, borderTopLeftRadius: 10, borderTopRightRadius: 10}}>
            {/* Back button */}
            <div className='profileHeaderLeft1' style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 0, margin: 0}}>
            <div className="back-button1" style={{display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 0, margin:0}} onClick={handleCloseProfile}>
              <FaAngleLeft style={{width: 32, height: 32, padding: 0, margin:0}}/>
            </div>
            {/* Profile picture */}
            <div className="profile-picture-container1" style={{display: 'flex', justifyContent: 'center', alignItems: 'center', borderColor: '2px solid white', padding: 0, margin: 0}}>
              <img className="profile-picture1" src={selectedUser.profileImage} alt="Profile" style={{width: 75, height: 75,  borderRadius: '50%', border: '2px solid white'}}/>
            </div>
            {/* Render detailed user profile details here */}
            <div style={{padding: 10, margin: 0, fontWeight: 'bold', fontSize: 28}}>
              <p className="profile-username1" style={{padding: 0, margin: 0, }}>{selectedUser.fullName}</p>
              {/* Star rating frame */}

              {/* Add more details as needed */}
            </div>
            </div>

            {/* Profile actions */}
            <div className="profile-actions1">
              {renderActions(selectedUser, selectedUser)}
            </div>

          </div>
          <div className="profileBody1" style={{display: 'flex', flexDirection: 'row', backgroundColor: '#CFDFE7', color: 'black', padding: 15, margin: 0, gap: 15, borderBottomLeftRadius: 10, borderBottomRightRadius: 10}}>
            <div className='leftSide1' style={{flex: 2, backgroundColor: 'white', padding: 10, borderRadius: 10}}>
              <div classname='userDetailsContainer1'>
                <UserDetails userDetails={selectedUser} />
              </div>
              <div className="userDetailCardsContainer1" style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: 10}}>
                <UserDetailCard title={"Services Availed"} value={selectedUser.servicesAvailed} />
                <UserDetailCard title={"Reports Received"} value={selectedUser.reportsReceived} />
                <UserDetailCard title={"Violation Record"} value={selectedUser.violationRecord} />
              </div>
            </div>
            {/* <hr class="verticalLine1" style={{width: 1, height: '100%', backgroundColor: 'black', border: 'none'}}/> */}
            <div className='rightSide1' style={{flex: 2, backgroundColor: 'white', padding: 10, borderRadius: 10, fontWeight: 'bold'}}>
              Preferred Services:
            </div>
          </div>
        </div>
      )}

      {!selectedUser && (
        <div className="scrollable-table" style={{ overflowX: 'auto', paddingBottom: 20 }}>
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
                width: width < 768 ? '15%' : '10%',
              },
              {
                dataIndex: "fullName",
                render: (text, record) => renderName(text, record),
                width: width < 768 ? '25%' : '20%',
              },
              // {
              //   dataIndex: "email",
              //   render: (text, record) => renderEmail(text, record),
              //   width: width < 768 ? '25%' : '20%',
              // },
              {
                dataIndex: "phone",
                render: (text, record) => renderMobile(text, record),
                width: width < 768 ? '20%' : '20%',
              },
              {
                dataIndex: "servicesAvailed",
                render: (text, record) => renderServicesAvailed(text, record),
                width: width < 768 ? '20%' : '20%',
              },
              {
                dataIndex: "reportsReceived",
                render: (text, record) => renderReportsReceived(text, record),
                width: width < 768 ? '20%' : '20%',
              },
              {
                dataIndex: 'actions',
                render: renderActions,
                width: '5%',
              }
            ]}
            loading={loading}
            dataSource={filteredDataBySort}
            pagination={false}
            showHeader={false}
          />
        </div>
      )}
    </div>
  );

}

export default SeekerList;
