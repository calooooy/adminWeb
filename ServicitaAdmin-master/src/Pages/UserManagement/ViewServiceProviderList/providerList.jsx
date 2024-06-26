import React, { useState, useEffect } from 'react';
import { FaEllipsisV, FaAngleLeft, FaStar, FaStarHalfAlt } from 'react-icons/fa';
import { Table, Dropdown, Menu, Space, Flex, Modal } from 'antd';
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

    const fontSize = 70;
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



function ProviderList({ searchTerm, sortTerm, category, city, barangay, flagged, onSelectUser, toggleSearchBarVisibility }) {
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [showServiceOverlay, setShowServiceOverlay] = useState(false);
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
          const response = await Axios.get(`https://servicita-back-end-hazel.vercel.app/admin/getUser/${doc.id}`);
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
  //       const response = await Axios.get(`https://servicita-back-end-hazel.vercel.app/admin/getUser/${doc.id}`);
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

  
  const renderImage = (url, record) => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        cursor: 'pointer',
      }}
      onClick={() => handleItemClick(record)}
    >
      <div style={{ width: '50px', height: '50px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #75B9D9', }}>
        <img src={url} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    </div>
  );

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
          color: 'inherit', // Use the default text color
          fontSize: '15px',
          whiteSpace: 'normal', // Allow text to wrap
          wordWrap: 'break-word', // Break long words
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
            textAlign: 'left',
            textDecoration: 'none', // Remove underline by default
            color: 'inherit', // Use the default text color
            fontSize: '20rm',
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

  // const renderCompletedServices = (text, record) => (
  //   <div
  //     style={{ display: 'flex', justifyContent: 'left', cursor: 'pointer' }}
  //     onClick={() => handleItemClick(record)}
  //   >
  //     {/* <div style={{ width: 'auto', height: 35, backgroundColor: '#CFDFE7', display: 'flex', justifyContent: 'center', alignItems: 'center' }}> */}
  //       <span style={{ textAlign: 'center' }}>{"Completed Services: " + text}</span>
  //     {/* </div> */}
  //   </div>
  // );

  const renderCompletedServices = (text, record) => (
    <div
      style={{ display: 'flex', justifyContent: 'left', cursor: 'pointer' }}
      onClick={() => handleItemClick(record)}
    >
      <span
        style={{
          textAlign: 'left',
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
        {"Completed Services: " + text}
      </span>
    </div>
  );

  const renderRating = (text, record) => (
  <div
    style={{ textAlign: 'left', display: 'flex', justifyContent: 'flex-start', cursor: 'pointer' }} // Use 'flex-start' to justify content to the left
    onClick={() => handleItemClick(record)}
  >
    <span
      style={{
        textAlign: 'left',
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
      {"Rating: " + text}
    </span>
  </div>
);

  
  

  // <span style={{ textAlign: 'center' }}>{"Completed Services: " + text}</span>
  // <span style={{ textAlign: 'center' }}>{"Rating: " + text}</span>

  // const renderRating = (text, record) => (
  //   <div
  //     style={{ display: 'flex', justifyContent: 'center', cursor: 'pointer' }}
  //     onClick={() => handleItemClick(record)}
  //   >
  //     {/* <div style={{ width: 'auto', height: 35, backgroundColor: '#CFDFE7', display: 'flex', justifyContent: 'center', alignItems: 'center' }}> */}
  //       <span style={{ textAlign: 'center' }}>{"Rating: " + text}</span>
  //     {/* </div> */}
  //   </div>
  // );

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

    return <div className="star-rating1" style={{display: 'flex', width: 90}}>{stars}</div>;
  };


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
      Axios.patch('https://servicita-back-end-hazel.vercel.app/admin/suspendUser', userData)
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

  const handleReward = (record) => {
    Modal.info({
      title: 'Rewards and Voucers',
      content: 'This feature is coming soon.',
      centered: true,
    });
  };

  const handleDelete = (record) => {
    const userData = {
      userId: record.id
    };
    Axios.post(`https://servicita-back-end-hazel.vercel.app/admin/deleteUser`, userData)
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
      Axios.patch('https://servicita-back-end-hazel.vercel.app/admin/unsuspendUser', userData)
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
      <div className="userDetailCard1" style={{ borderRadius: 10, padding: '20px 10px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#ededed'}}>
        <div className="userDetailCardTitle1" style={{fontWeight: 'bold', fontSize: 24, textAlign: 'center'}}>{title}</div>
        <div className="userDetailCardValue1" style={{fontWeight: 'bolder', fontSize: 64, color: '#266F92'}}>{value}</div>
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
              <p className="profile-username1" style={{padding: 0, margin: 0, }}>{selectedUser.fullName}</p>              {/* Star rating frame */}
              {renderStarRating(selectedUser.rating)}
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
              <UserDetails userDetails={selectedUser} />
              <div className='ServicesOffered1'style={{padding: '0px 5px', fontWeight: 'bold'}} >Services Offered:
                <div style={{padding: 10, overflowY: 'auto', maxHeight: 200, fontWeight: 'normal'}}>
                  {selectedUser.services.map((service, index) => (
                    <div key={index} className='ServicesOfferedList1' style={{margin: 10, backgroundColor: 'white', padding: '5px 10px', borderRadius: 10, border: '1px solid #002F45'}} onClick={() => handleServiceClick(service)}>
                      {service.name} ({service.serviceType})
                    </div>
                    ))
                  }
                </div>
              </div>
            </div>

            {/* <div class="verticalLine"></div> */}
            
            <div className='rightSide1' style={{flex: 3, height: '50vh', backgroundColor: 'white', padding: 10, borderRadius: 10, fontWeight: 'bold', overflowY: 'auto'}}>              
              <div className="userDetailCardsContainer1" style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginBottom: 20}}>
                <UserDetailCard title={"Completed Services"} value={selectedUser.completedServices} />
                <UserDetailCard title={"Reports Received"} value={selectedUser.reportsReceived} />
                <UserDetailCard title={"Violation Record"} value={selectedUser.violationRecord} />
              </div>

              <div className='Performance1' style={{alignItems:'center', display:'flex', flexDirection:'column', padding: '0px 5px'}}>
                {/* Rating */}
                <div style={{backgroundColor: '#ededed', width:'100%', textAlign: 'center', borderRadius: 10, }}>
                  <div className='customerRatingLabel' style={{borderRadius: 10}}>Customer Rating</div>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyItems: 'center', alignItems: 'center', padding: '10px' }}>
                  {selectedUser.ratingCount !== 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <PieGraph selectedUser={selectedUser} />
                    <div className='Legend' style={{ display: 'flex', flexDirection: 'column', width: '100%', padding: '15px 10px', gap: 5 }}>
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
                          No rating yet
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {/* Response Time */}
                <div style={{backgroundColor: '#ededed', width:'100%', borderRadius: 10, marginTop: 40, padding: '15px 0px', margin: '20px', textAlign: 'center'}}>
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
        <div className="scrollable-table" style={{ overflowX: 'auto', paddingBottom: 20}}>
        <Table
          style={{ width: '100%' }}
          size='small'
          columns={[
            {
              dataIndex: "profileImage",
              render: renderImage,
              width: width < 768 ? '15%' : '10%', // Adjust width based on screen size
            },
            {
              dataIndex: "fullName",
              render: renderName,
              width: width < 768 ? '25%' : '20%', // Adjust width based on screen size
            },
            // {
            //   dataIndex: "email",
            //   render: renderEmail,
            //   width: width < 768 ? '25%' : '20%', // Adjust width based on screen size
            // },
            {
              dataIndex: "phone",
              render: renderMobile,
              width: width < 768 ? '20%' : '20%', // Adjust width based on screen size
            },
            {
              dataIndex: "completedServices",
              render: renderCompletedServices,
              width: width < 768 ? '20%' : '20%', // Adjust width based on screen size
            },
            {
              dataIndex: "rating",
              render: renderRating,
              width: width < 768 ? '20%' : '20%', // Adjust width based on screen size
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

      {showServiceOverlay && selectedService && (
        <div className="serviceDetailsOverlay">
          <div className="serviceDetails" style={{backgroundColor: 'white', border: '1px solid #002F45', color: '#002F45'}}>
            <div className="serviceDetailsHeader">

              <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
              <div className="back-button" style={{color: '#002F45',}} onClick={() => setShowServiceOverlay(false)}>
                <FaAngleLeft />
              </div>
              <div>
                <div className="serviceName1" style={{fontSize: 32, fontWeight: 'bold'}}>{selectedService.name}</div>
                <div className="serviceType1">{selectedService.serviceType}</div>
              </div>
              </div>
              

              {/* <div>

              </div> */}


            </div>
            <div className="serviceDetailsBody">
              <hr style={{backgroundColor: '#002F45', border: 'none', height: 1}}></hr>

              <div style={{display: 'flex'}}>
                <div style={{flex: 0.6, fontWeight: 'bolder', fontSize: 18}}>Service Description</div>
                <div className="serviceDetailsDescription" style={{flex: 1, textAlign: 'justify'}}>{selectedService.description}</div>
              </div>

              <hr style={{backgroundColor: '#002F45', border: 'none', height: 1}}></hr>

              <div style={{display: 'flex'}}>
                <div style={{flex: 0.6, fontWeight: 'bolder', fontSize: 18}}>Service Fee</div>
                <div className="serviceDetailsPrice" style={{flex: 1, textAlign: 'justify', fontWeight: 'normal'}}> ₱{selectedService.price.min} - ₱{selectedService.price.max}</div>
              </div>

              {/* Design a week schedule regarding the availability displaying all 7 days with start time and end time */}
              <hr style={{backgroundColor: '#002F45', border: 'none', height: 1}}></hr>
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