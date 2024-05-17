import React, { useState, useEffect } from 'react';
import { FaEllipsisV, FaAngleLeft, FaStar, FaStarHalfAlt } from 'react-icons/fa';
import { Table, Dropdown, Menu, Space, Flex } from 'antd';
import { getFirestore, collection, getDocs, onSnapshot, doc, deleteDoc, getDoc } from 'firebase/firestore';
import Axios from 'axios';


import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title,);


//doughnut graph
const options1 = {
  cutout: 90,
  plugins: {
    legend: {
      display: false,
      position: 'bottom'
    },
  },
  layout: {
    padding: {
      bottom: 0, // Adjust bottom padding to create space between graph and legend
    },
  },
};

const textCenter = (selectedUser) => ({
  id: 'textCenter',
  beforeDatasetsDraw(chart, args, options) {
    const { ctx, chartArea, data } = chart;
    const dataset = data.datasets[0];
    //const total = dataset.data.reduce((acc, value, index) => acc + value * (dataset.data.length - index), 0);
    //const count = dataset.data.reduce((acc, value) => acc + value, 0);
    //const average = total / count;
    const text = selectedUser.rating;
    //? `${selectedUser.rating}` : `${average.toFixed(2)}`;

    const fontSize = 80;
    const centerX = (chartArea.left + chartArea.right) / 2;
    const centerY = (chartArea.top + chartArea.bottom) / 2;

    ctx.save();
    ctx.fillStyle = '#04528A';
    ctx.font = `${fontSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, centerX, centerY);
    ctx.restore();
  }
});

function generateRandomData(numLabels, min, max) {
  const data = [];
  for (let i = 0; i < numLabels; i++) {
    data.push(Math.floor(Math.random() * (max - min + 1)) + min);
  }
  return data;
}

function PieGraph({selectedUser}) {
  const labels = ['5', '4', '3', '2', '1'];
  const data = {
    labels: labels,
    datasets: [
      {
        label: 'Rating Count',
        data: [1, 3, 0, 0, 0],
        //[0, 0, 0, 0, 0],
        //generateRandomData(labels.length, 30, 100), // Generate random data between 30 and 100
        backgroundColor: [
          '#00365B',
          '#004E84',
          '#0070C8',
          '#76A8D5',
          '#CFDBE7',
        ],
        borderColor: [
          '#00365C',
          '#004E85',
          '#0070C9',
          '#76A8D6',
          '#CFDBE8',  
        ],
        borderWidth: 2,
      },
    ],
  };

  return (
    <div style={{ width: '250px', height: '250px' }}>
      <Doughnut options={options1} data={data} plugins={[textCenter(selectedUser)]} />
    </div>
  );
}

//bar graph

const options2 = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
      position: 'bottom',
    },
    title: {
      display: false,
      text: 'Response Time',
    },
  },
};

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function BarGraph() {
  const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const data = {
    labels,
    datasets: [
      {
        label: 'Response Time in s',
        data: labels.map(() => getRandomNumber(30,60)),
        backgroundColor: '#76A8D5',
      }
    ],
  };

  return <Bar options={options2} data={data} />;
}





/*
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const options = {
  plugins: {
    legend: {
      display: false,
      position: 'bottom'
    },
  },
  layout: {
    padding: {
      bottom: 0, // Adjust bottom padding to create space between graph and legend
    },
  },
};

const textCenter = {
  id: 'textCenter',
  beforeDatasetsDraw(chart, argsm, pluginOptions) {
    const {ctx, data} = chart;
    
    ctx.save();
    ctx.font = 'bolder 30px sans-serif';
    ctx.fillStyle = 'red';
    ctx.fillText('text', chart.getDatasetMeta(0).data[0].x, chart.getDatasetMeta(0).data[0].y);
  }
}

function generateRandomData(numLabels, min, max) {
  const data = [];
  for (let i = 0; i < numLabels; i++) {
    data.push(Math.floor(Math.random() * (max - min + 1)) + min);
  }
  return data;
}

function PieGraph() {
  const labels = ['5', '4', '3', '2', '1'];
  const data = {
    labels: labels,
    datasets: [
      {
        label: 'Rating Count',
        data: generateRandomData(labels.length, 30, 100), // Generate random data between 1 and 10
        backgroundColor: [
          '#00365B',
          '#004E84',
          '#0070C8',
          '#76A8D5',
          '#CFDBE7',
        ],
        borderColor: [
          '#00365C',
          '#004E85',
          '#0070C9',
          '#76A8D6',
          '#CFDBE8',  
        ],
        borderWidth: 2,
      },
    ],
  };

  return (
    <div style={{ width: '300px', height: '300px' }}>
      <Doughnut options={options} data={data} plugins = {[textCenter]}/>
    </div>
  );
}
*/


function ProviderList({ searchTerm, sortTerm, category, city, barangay, flagged, onSelectUser, toggleSearchBarVisibility }) {
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [showServiceOverlay, setShowServiceOverlay] = useState(false);
  const [deletedUser, setDeletedUser] = useState(false);
  const [unsuspendUser, setUnsuspendUser] = useState(false);

  useEffect(() => {
    setLoading(true);
    const db = getFirestore();
    const providerCollection = collection(db, "providers");

    const fetchProviders = async () => {
      try {
        const querySnapshot = await getDocs(providerCollection);
        const providerData = [];

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
          const providerInfo = {
            id: doc.id,
            fullName: fullName,
            address: fullAddress,
            city: data.address.cityMunicipality || "",
            barangay: data.address.barangay || "",
            rating: data.rating || "no rating yet",
            ratingCount: data.ratingCount,
            completedServices: data.completedServices || 0,
            reportsReceived: data.reportsReceived || 0,
            violationRecord: data.violationRecord || 0,
            services: data.services || [],
          };
          const response = await Axios.get(`http://172.16.4.26:5000/admin/getUser/${doc.id}`);
          const userData = response.data.data;
          providerInfo.profileImage = userData.profileImage;
          providerInfo.email = userData.email;
          providerInfo.phone = userData.mobile;
          providerInfo.suspension = userData.suspension;
          const serviceCollection = collection(db, "services");
          const serviceData = [];
          await Promise.all(providerInfo.services.map(async (service) => {
            const serviceDoc = await getDocs(serviceCollection);
            serviceDoc.forEach((doc) => {
              if (doc.id === service) {
                serviceData.push(doc.data());
              }
            });
          }));
          providerInfo.services = serviceData;
          providerData.push(providerInfo);
          console.log(providerInfo)

        }));

        setDataSource(providerData);
        setLoading(false);

      } catch (error) {
        console.error("Error fetching providers: ", error);
      } finally {
        setLoading(false);
        setDeletedUser(false);
        setUnsuspendUser(false);
      }
    };

    fetchProviders();

    // const unsubscribe = onSnapshot(providerCollection, () => {
    //   fetchProviders();
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

  const filteredDataByCategory = filteredDataByFlag.filter((data) => {
    if (category === '') {
      return data;
    } else if (data.services.some((service) => service.serviceType === category)) {
      return data;
    }
  });

  const filteredDataByCity = filteredDataByCategory.filter((data) => {

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

  if (!filteredDataBySort) {
    return null;
  }


  // useEffect(() => {
  //   if (selectedUser) {
  //     onSelectUser(selectedUser);
  //     const db = getFirestore();
  //     const providerCollection = collection(db, "providers");
  //     const providerDoc = doc(providerCollection, selectedUser.id);

  //     const unsubscribe = onSnapshot(providerDoc, async (doc) => {
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
  //         completedServices: data.completedServices || 0,
  //         reportsReceived: data.reportsReceived || 0,
  //         violationRecord: data.violationRecord || 0,
  //         services: data.services || [],

  //       };
  //       const response = await Axios.get(`http://192.168.1.10:5000/admin/getUser/${doc.id}`);
  //       const userData = response.data.data;
  //       updatedUser.profileImage = userData.profileImage;
  //       updatedUser.email = userData.email;
  //       updatedUser.phone = userData.mobile;
  //       const serviceCollection = collection(db, "services");
  //       const serviceData = [];
  //       await Promise.all(updatedUser.services.map(async (service) => {
  //         const serviceDoc = await getDocs(serviceCollection);
  //         serviceDoc.forEach((doc) => {
  //           if (doc.id === service) {
  //             serviceData.push(doc.data());
  //           }
  //         });
  //       }));
  //       updatedUser.services = serviceData;
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


  const renderCompletedServices = (text, record) => (
    <div
      style={{ display: 'flex', justifyContent: 'center', cursor: 'pointer' }}
      onClick={() => handleItemClick(record)}
    >
      <div style={{ width: 200, height: 35, backgroundColor: '#CFDFE7', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <span style={{ textAlign: 'center' }}>{"Completed Services: " + text}</span>
      </div>
    </div>
  );

  const renderRating = (text, record) => (
    <div
      style={{ display: 'flex', justifyContent: 'center', cursor: 'pointer' }}
      onClick={() => handleItemClick(record)}
    >
      <div style={{ width: 200, height: 35, backgroundColor: '#CFDFE7', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <span style={{ textAlign: 'center' }}>{"Rating: " + text}</span>
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
    console.log(record.id)
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
    const userData = {
      userId: record.id
    };
    Axios.post(`http://172.16.4.26:5000/admin/deleteUser`, userData)
      .then((response) => {
        const db = getFirestore();
        const providerCollection = collection(db, "providers");
        const providerDoc = doc(providerCollection, record.id);
        const providerServices = collection(db, "services");
        getDocs(providerServices)
          .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              if (doc.data().providerId === record.id) {
                deleteDoc(doc.ref) // Use doc.ref here to get the reference
                  .then(() => {
                    console.log("Document successfully deleted");
                  })
                  .catch((error) => {
                    console.error("Error deleting Firestore document: ", error);
                  });
              }
            });
            deleteDoc(providerDoc)
              .then(() => {
                alert("User deleted successfully");
                setDeletedUser(true);
              })
              .catch((error) => {
                console.error("Error deleting Firestore document: ", error);
              });
          })
          .catch((error) => {
            console.error("Error getting documents: ", error);
          });
      })
      .catch((error) => {
        console.error("Error deleting user: ", error);
      });
  };




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
      <div className="ProviderDetailCard">
        <div className="ProviderDetailCardTitle">{title}</div>
        <div className="ProviderDetailCardValue">{value}</div>
      </div>
    );
  }

  function handleServiceClick() {
    showServiceOverlay(true);
  }

  function handleServiceClick(service) {
    console.log(service);
    setSelectedService(service);
    setShowServiceOverlay(true);
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
              {renderStarRating(selectedUser.rating)}
              {/* Add more details as needed */}
            </div>

            {/* Profile actions */}
            <div className="profile-actions">
              {renderActions(selectedUser, selectedUser)}
            </div>

          </div>
          <div className="profileBody" style={{display: 'flex', flexDirection: 'row'}}>
            <div className='leftSide'>
              <UserDetails userDetails={selectedUser} />
              <div className='ServicesOffered'>Services Offered:
                {selectedUser.services.map((service, index) => (
                  <div key={index} className='ServicesOfferedList' onClick={() => handleServiceClick(service)}>
                    {service.name} ({service.serviceType})
                  </div>
                  ))
                }
              </div>
            </div>

            <div class="verticalLine"></div>
            
            <div className='rightSide' style={{display: 'flex', flexDirection: 'column', overflowY: 'auto', paddingRight: '10px'}}>
              <div className="userDetailCardsContainerProvider">
                <UserDetailCard title={"Completed Services"} value={selectedUser.completedServices} />
                <UserDetailCard title={"Reports Received"} value={selectedUser.reportsReceived} />
                <UserDetailCard title={"Violation Record"} value={selectedUser.violationRecord} />
              </div>
              <div className='Performance' style={{alignItems:'center', display:'flex', flexDirection:'column', padding: '20px', paddingTop: '10px'}}>
                
  <div style={{backgroundColor: 'white', width:'100%', marginBottom: '0px', textAlign: 'center'}}>
    <div className='customerRatingLabel'>Customer Rating</div>
    <div style={{ display: 'flex', flexDirection: 'column', justifyItems: 'center', alignItems: 'center', padding: '10px' }}>
  {selectedUser.ratingCount !== 0 ? (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <PieGraph selectedUser={selectedUser} />
      <div className='Legend' style={{ display: 'flex', flexDirection: 'column', margin: '20px', width: '100%', padding: '10px', marginTop: '10px' }}>
        <div className='up' style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', gap: '10px' }}>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: '15px', height: '15px', borderRadius: '50%', backgroundColor: '#00365B', marginRight: '3px' }}></div>
            <div>5 stars</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: '15px', height: '15px', borderRadius: '50%', backgroundColor: '#004E84', marginRight: '3px' }}></div>
            <div>4 stars</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: '15px', height: '15px', borderRadius: '50%', backgroundColor: '#0070C8', marginRight: '3px' }}></div>
            <div>3 stars</div>
          </div>
        </div>
        <div className='down' style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly' }}>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: '15px', height: '15px', borderRadius: '50%', backgroundColor: '#76A8D5', marginRight: '3px' }}></div>
            <div>2 stars</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: '15px', height: '15px', borderRadius: '50%', backgroundColor: '#CFDBE7', marginRight: '3px' }}></div>
            <div>1 star</div>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '270px', height: '270px', borderRadius: '50%', backgroundColor: 'gray', margin: '10px', marginBottom:'30px'}}>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '170px', height: '170px', borderRadius: '50%', backgroundColor: 'white', color: 'black', fontSize: '18px' }}>
        This user has no rating yet
      </div>
    </div>
  )}
</div>

  </div>
  <div style={{backgroundColor: 'white', width:'100%', height:'300px', margin: '20px', textAlign: 'center'}}>
    <div className='customerRatingLabel'>Response Time by Weekday</div>
    <div style={{display: 'grid', justifyItems:'center', alignItems: 'center', padding: '20px', paddingTop: '20px'}}>
      <BarGraph />
    </div>
  </div>
</div>

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
                dataIndex: "completedServices",
                render: (text, record) => renderCompletedServices(text, record)
              },
              {
                dataIndex: "rating",
                render: (text, record) => renderRating(text, record)
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

      {showServiceOverlay && selectedService && (
        <div className="serviceDetailsOverlay">
          <div className="serviceDetails">
            <div className="serviceDetailsHeader">
              <div className="back-button" onClick={() => setShowServiceOverlay(false)}>
                <FaAngleLeft />
              </div>
              <div className="serviceDetailsTitle">{selectedService.name}</div>
            </div>
            <div className="serviceDetailsBody">
              <hr></hr>
              <div className="serviceDetailsDescription">{selectedService.description}</div>
              <hr></hr>
              <div className="serviceDetailsPrice"> ₱{selectedService.price.min} - ₱{selectedService.price.max}</div>
              {/* Design a week schedule regarding the availability displaying all 7 days with start time and end time */}
              <hr></hr>
              <div className="serviceDetailsSchedule">
                {selectedService.availability.map((day, index) => (
                  <div>
                    <div key={index} className="serviceDetailsDay">
                      <div>
                        <div className='dayLabel'>{day.day}</div>
                      </div>
                      <div>
                        <div>{day.startTime}</div>
                        <div> - </div>
                        <div>{day.endTime}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

}

export default ProviderList;
