import React, { useState, useEffect } from 'react';
import { FaEllipsisV } from 'react-icons/fa';
import { Table, Dropdown, Menu, Space, Card, Spin } from 'antd';
import { getFirestore, collection, getDocs, onSnapshot, doc, deleteDoc, getDoc, updateDoc } from 'firebase/firestore';
import Axios from 'axios';


function NewServiceListings() {
	const [dataSource, setDataSource] = useState([]);
	const [loading, setLoading] = useState(false);
	const [updating, setUpdating] = useState(false);
	const [showSpinner, setShowSpinner] = useState(true);

	useEffect(() => {
		setLoading(true);

		const db = getFirestore();
		const servicesCollection = collection(db, "services");
		const providerCollection = collection(db, "providers");

		const fetchServices = async () => {
			try {
				const querySnapshot = await getDocs(servicesCollection);
				const servicesData = [];

				await Promise.all(querySnapshot.docs.map(async (doc) => {
					const data = doc.data();
					const servicesInfo = {
						id: doc.id,
						coverImage: data.coverImage,
						description: data.description,
						name: data.name,
						minPrice: data.price.min,
						maxPrice: data.price.max,
						providerId: data.providerId,
						verified: data.verified,
						status: data.status
					};
					const response = await Axios.get(`https://192.168.1.4:5001/admin/getUser/${data.providerId}`);
					const userData = response.data.data;
					servicesInfo.profileImage = userData.profileImage;

					const providerQuerySnapshot = await getDocs(providerCollection);
					providerQuerySnapshot.forEach(docSnapshot => {
						const providerData = docSnapshot.data();

						if (docSnapshot.id === data.providerId) {
							servicesInfo.providerName = `${providerData.name.firstName} ${providerData.name.lastName}`;
							return;
						}
					});

					servicesData.push(servicesInfo);

				}));

				servicesData.sort((a, b) => {
					if (a.name < b.name) {
						return -1;
					}
					if (a.name > b.name) {
						return 1;
					}
					return 0;
					});

				setDataSource(servicesData);
				setLoading(false);

				// Show spinner for 2 seconds
				setTimeout(() => {
					setShowSpinner(false);
				}, 1500);

			} catch (error) {
				console.error("Error fetching services: ", error);
			}
		};

		fetchServices();

		// const unsubscribe = onSnapshot(servicesCollection, () => {
		// fetchServices();
		// });

		// return () => unsubscribe();
	}, [dataSource]);



	const filterByStatus = dataSource.filter((data => {
		if (data.status == 'Pending') {
			return data;
		}
	}))

	const filterByUpdatedStatus = dataSource.filter((data => {
		if (data.status == 'Pending') {
			return data;
		}
	}))


	const handleMenuClick = (record, { key }) => {
		// Handle different menu options here
		console.log("Clicked on", key, "for record:", record);
		// For now, just logging the clicked option
	};

	const handleMessage = (record) => {
		console.log("For message")
	}

	const handleApprove = async (record) => {
		setUpdating(true);

		const db = getFirestore();
		const servicesCollection = collection(db, "services");

		try {
			// Update the 'verified' field to true for the record
			const serviceDocRef = doc(servicesCollection, record.id);
			await updateDoc(serviceDocRef, {
				status: 'Active'
			});
			console.log("Record approved successfully");
		} catch (error) {
			console.error("Error approving record:", error);
		} finally {
			setTimeout(() => {
				setUpdating(false); // Set updating/loading state to false after a delay
			}, 1200); // Adjust the delay duration as needed (in milliseconds)
		}

		// const unsubscribe = onSnapshot(servicesCollection, () => {
		// updateVerified();
		// });

		// return () => unsubscribe();
	}

	const handleReject = async (record) => {
		setUpdating(true);

		const db = getFirestore();
		const servicesCollection = collection(db, "services");

		try {
			// Update the 'verified' field to true for the record
			const serviceDocRef = doc(servicesCollection, record.id);
			await updateDoc(serviceDocRef, {
				status: 'Rejected'
			});
			console.log("Record rejected successfully");
		} catch (error) {
			console.error("Error approving record:", error);
		} finally {
			setTimeout(() => {
				setUpdating(false); // Set updating/loading state to false after a delay
			}, 1200); // Adjust the delay duration as needed (in milliseconds)
		}

		// const unsubscribe = onSnapshot(servicesCollection, () => {
		// updateVerified();
		// });

		// return () => unsubscribe();
	}

	const menu = (record) => (
		<Menu>
			<Menu.Item key="message" onClick={() => handleMessage(record)}>Message</Menu.Item>
			<Menu.Item key="approve" onClick={() => handleApprove(record)}>Approve</Menu.Item>
			<Menu.Item key="reject" onClick={() => handleReject(record)}>Reject</Menu.Item>
		</Menu>
	);

	return (
		<div className='newServiceListing'>
			<div>
				<h1 className='DashboardHeader'>New Service Listing</h1>
				{/* <hr className='Divider' style={{ width: '1185px' }} /> */}
			</div>
			<div className='message-container'>
				<div className='newServiceListingRender1' style={{height: '100%', overflowX: 'hidden'}}>
					{showSpinner ? (
						<div className='showSpinner'>
							<Spin size="large" />
						</div>
					) : (
						<>
							<div className='serviceListingCount1' style={{padding: '10px'}}>
								{filterByUpdatedStatus.length === 0 
									? 'No new service listings to be reviewed' 
									: `Service Listings to Review: ${filterByUpdatedStatus.length}`}
							</div>
							{filterByUpdatedStatus.length > 0 && (
								<div className='service-scroller1' style={{backgroundColor: 'white', padding: '15px', margin: '2px 15px 15px 15px', display:'flex', flexDirection:'row', gap: '15px', borderRadius: '10px', overflowX: 'scroll', boxSizing: 'border-box', }}>
									{updating ? (
										<div className='updateSpinner'>
											<Spin size="large" />
										</div>
									) : (
										<>
											{filterByUpdatedStatus.map(servicesInfo => (
												<div className='serviceCard1' style={{ width: '300px',  borderRadius: '15px', backgroundColor: '#ededed'}} key={servicesInfo.id}>
														<div className='serviceCardImage1' style={{ width: '300px' }}>
															<img alt="cover" src={servicesInfo.coverImage} style={{ width: '100%', aspectRatio: '4/4', objectFit: 'cover', borderTopLeftRadius: '15px', borderTopRightRadius: '10px', padding: '0px', margin: '0px' }} />
														</div>
														<div className='serviceContents1' style={{padding: '0px', margin: '0px'}}>
															<div className='serviceHeader1' style={{margin: '0px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: '0px 10px'}}>
																<div className='serviceLeft1' style={{padding: '0px', margin: '0px'}}>
																	<h3 className='serviceName1' style={{padding: '0px', margin: '0px', fontSize: 24}}>{servicesInfo.name}</h3>
																	<div className='serviceprovider1' style={{ gap: '5px',display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', padding: '0px', margin: '0px'}}>
																		<img alt="cover" src={servicesInfo.profileImage} style={{ width: '25px', height: '25px', borderRadius: '50%', padding: '0px', margin: '3px 0px', border: '1px solid #1C729A'}} />
																		<p className='provider-Name1' style={{padding: '0px', margin: '0px', fontSize: 16}}>{servicesInfo.providerName}</p>
																	</div>
																</div>
																<div className='serviceRight1' style={{width: 30, height: 30, borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
																	<Dropdown overlay={() => menu(servicesInfo)} trigger={['click']}>
																		<FaEllipsisV className='service-listing-ellipsis1' style={{height: '20px'}}/>
																	</Dropdown>
																</div>
															</div>
															<div className='description1' style={{height: 80, padding: '5px 20px', fontSize: 12, textAlign: 'justify'}}>{servicesInfo.description}</div>
															<div className='price1' style={{padding: 10, display: 'flex', justifyContent: 'end', fontSize: 24, color: '#1C729A'}}>P{servicesInfo.minPrice} - P{servicesInfo.maxPrice}</div>
														
														</div>
													</div>
											))}
										</>
									)}
								</div>
							)}
						</>
					)}
				</div>
			</div>
		</div>
	);
	
	



}
export default NewServiceListings




