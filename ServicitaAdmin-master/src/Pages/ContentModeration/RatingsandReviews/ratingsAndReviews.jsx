import React, { useState, useEffect } from 'react';
import { FaEllipsisV, FaStar, FaStarHalfAlt } from 'react-icons/fa';
import { Table, Dropdown, Menu, Space, Card } from 'antd';
import { getFirestore, collection, getDocs, onSnapshot, doc, deleteDoc, getDoc, updateDoc } from 'firebase/firestore';
import Axios from 'axios';

function RatingsAndReviews() {
    // const [dataSource, setDataSource] = useState([]);
    // const [loading, setLoading] = useState(false);

    // useEffect(() => {
    //     setLoading(true);
    //     const db = getFirestore();
    //     const servicesCollection = collection(db, "services");
    //     const providerCollection = collection(db, "providers");

    //     const fetchServices = async () => {
    //         try {
    //             const querySnapshot = await getDocs(servicesCollection);
    //             const servicesData = [];

    //             await Promise.all(querySnapshot.docs.map(async (doc) => {
    //                 const data = doc.data();
    //                 const servicesInfo = {
    //                     id: doc.id,
    //                     coverImage: data.coverImage,
    //                     description: data.description,
    //                     name: data.name,
    //                     minPrice: data.price.min,
    //                     maxPrice: data.price.max,
    //                     providerId: data.providerId,
    //                     verified: data.verified,
    //                     status: data.status,
    //                     rating: data.rating
    //                 };
    //                 const response = await Axios.get(`http://192.168.254.158:5000/admin/getUser/${data.providerId}`);
    //                 const userData = response.data.data;
    //                 servicesInfo.profileImage = userData.profileImage;

    //                 const providerQuerySnapshot = await getDocs(providerCollection);
    //                 providerQuerySnapshot.forEach(docSnapshot => {
    //                     const providerData = docSnapshot.data();

    //                     if (docSnapshot.id === data.providerId) {
    //                         servicesInfo.providerName = `${providerData.name.firstName} ${providerData.name.lastName}`;
    //                         return;
    //                     }
    //                 });

    //                 servicesData.push(servicesInfo);

    //             }));

    //             servicesData.sort((a, b) => {
    //                 if (a.name < b.name) {
    //                     return -1;
    //                 }
    //                 if (a.name > b.name) {
    //                     return 1;
    //                 }
    //                 return 0;
    //             });

    //             setDataSource(servicesData);
    //             setLoading(false);

    //         } catch (error) {
    //             console.error("Error fetching services: ", error);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     fetchServices();

    //     // const unsubscribe = onSnapshot(servicesCollection, () => {
    //     //   fetchServices();
    //     // });

    //     // return () => unsubscribe();
    // }, [dataSource]);



    // const filterByStatus = dataSource.filter((data => {
    //     if (data.status == 'Pending') {
    //         return data;
    //     }
    // }))

    // const filterByUpdatedStatus = dataSource.filter((data => {
    //     if (data.status == 'Pending') {
    //         return data;
    //     }
    // }))


    // const handleMenuClick = (record, { key }) => {
    //     // Handle different menu options here
    //     console.log("Clicked on", key, "for record:", record);
    //     // For now, just logging the clicked option
    // };

    // const handleMessage = (record) => {
    //     console.log("For message")
    // }

    // const handleApprove = async (record) => {
    //     const db = getFirestore();
    //     const servicesCollection = collection(db, "services");

    //     try {
    //         // Update the 'verified' field to true for the record
    //         const serviceDocRef = doc(servicesCollection, record.id);
    //         await updateDoc(serviceDocRef, {
    //             status: 'Active'
    //         });
    //         console.log("Record approved successfully");
    //     } catch (error) {
    //         console.error("Error approving record:", error);
    //     }

    //     // const unsubscribe = onSnapshot(servicesCollection, () => {
    //     //   updateVerified();
    //     // });

    //     // return () => unsubscribe();
    // }

    // const handleReject = async (record) => {
    //     const db = getFirestore();
    //     const servicesCollection = collection(db, "services");

    //     try {
    //         // Update the 'verified' field to true for the record
    //         const serviceDocRef = doc(servicesCollection, record.id);
    //         await updateDoc(serviceDocRef, {
    //             status: 'Rejected'
    //         });
    //         console.log("Record rejected successfully");
    //     } catch (error) {
    //         console.error("Error approving record:", error);
    //     }

    //     // const unsubscribe = onSnapshot(servicesCollection, () => {
    //     //   updateVerified();
    //     // });

    //     // return () => unsubscribe();
    // }

    // const menu = (record) => (
    //     <Menu>
    //         <Menu.Item key="message" onClick={() => handleMessage(record)}>Message</Menu.Item>
    //         <Menu.Item key="approve" onClick={() => handleApprove(record)}>Approve</Menu.Item>
    //         <Menu.Item key="reject" onClick={() => handleReject(record)}>Reject</Menu.Item>
    //     </Menu>
    // );

    // const renderStarRating = (rating) => {
    //     const fullStars = Math.floor(rating);
    //     const hasHalfStar = rating % 1 !== 0;

    //     const stars = [];
    //     for (let i = 0; i < 5; i++) {
    //         if (i < fullStars) {
    //             stars.push(<FaStar key={i} className="star" />);
    //         } else if (i === fullStars && hasHalfStar) {
    //             stars.push(<FaStarHalfAlt key={i} className="star" />);
    //         } else {
    //             stars.push(<FaStar key={i} className="empty-star" />);
    //         }
    //     }

    //     return <div className="star-rating">{stars}</div>;
    // };

    return (
        <div style={{ width: '100%' }}>
            <div>
                <h1 className='DashboardHeader'>Ratings and Reviews</h1>
                <hr className='Divider' style={{ width: '1185px' }} />
            </div>
            {/* <div style={{ paddingTop: '20px', paddingLeft: '20px', paddingRight: '0px' }}>
                <div className='service-scroller' style={{ display: 'flex', gap: '20px', flexDirection: 'column', overflowY: 'auto', overscrollBehaviorInline: 'contain', width: '1100px', maxHeight: '595px', padding: '0px 20px 20px 0px' }}>
                    {filterByUpdatedStatus.map(servicesInfo => (
                        <div style={{ width: '100%', height: '540px', backgroundColor: '#FFFFFF', boxShadow: '7px 5px 5px rgba(30, 30, 30, 0.3)', gap: '10px' }}>
                            <div key={servicesInfo.id} style={{ width: '100%', marginRight: '10px', borderRadius: '0px' }}>
                                <div style={{ padding: '20px' }}>
                                    <div className='serviceHeader' style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                                        <div className='serviceLeft' style={{ display: 'flex', flexDirection: 'row', justifyContent: 'left', alignItems: 'center' }}>
                                            <div className='serviceprovider' style={{ display: 'flex', alignItems: 'center' }}>
                                                <img alt="cover" src={servicesInfo.profileImage} style={{ width: '60px', height: '60px', borderRadius: '50%' }}></img>
                                            </div>
                                            <div>
                                                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'left', marginLeft: '10px' }}>
                                                    <p className='provider-Name' style={{ fontSize: '20px', margin: '5px 8px 0 8px' }}>{servicesInfo.providerName}</p>
                                                    <div style={{ margin: '0 8px 8px 8px' }}>{renderStarRating(servicesInfo.rating)}</div>
                                                </div>

                                            </div>
                                        </div>
                                        <div className='serviceRight'>
                                            <Dropdown overlay={() => menu(servicesInfo)} trigger={['click']}>
                                                <FaEllipsisV className='service-listing-ellipsis' style={{ height: '25px', width: '25px', marginRight: '15px', cursor: 'pointer' }} />
                                            </Dropdown>
                                        </div>

                                    </div>

                                    <div className='description' style={{ marginRight: '10px', fontSize: '15px', whiteSpace: 'pre-wrap', marginBottom: '10px' }}>{servicesInfo.description}</div>

                                    <div className='bottom-part' style={{ display: 'flex', justifyContent: 'space-between', marginRight: '15px', marginBottom: '15px' }}>
                                        <div className='price' style={{ color: '#1C729A', fontSize: '30px' }}>P{servicesInfo.minPrice} - P{servicesInfo.maxPrice}</div>
                                        <button className='book-now'>Book Now</button>
                                    </div>



                                </div>
                            </div>
                        </div>

                    ))}
                </div>
            </div> */}
        </div>
    );
}
export default RatingsAndReviews