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
					const response = await Axios.get(`http://172.16.4.26:5000/admin/getUser/${data.providerId}`);
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
				<hr className='Divider' style={{ width: '1185px' }} />
			</div>
			<div className='newServiceListingRender'>
				{showSpinner ? (
					<div className='showSpinner'>
						<Spin size="large" />
					</div>
				) : (
					filterByUpdatedStatus.length === 0 ? (
						<div>No new service listings to be reviewed</div>
					) : (
						<div>

						<div className='service-scroller'>
							{updating ? (
								<div className='updateSpinner'>
									<Spin size="large" />
								</div>
							) : (
								<>
								<div className='serviceListingCount'>
									Service Listings to Review: {filterByUpdatedStatus.length}
								</div>
								{filterByUpdatedStatus.map(servicesInfo => (
									<div className='serviceCard'>
										<div key={servicesInfo.id} className='serviceCardContent'>
											<div className='serviceCardImage' >
												<img alt="cover" src={servicesInfo.coverImage} style={{ width: '100%', aspectRatio: '4/4', objectFit: 'cover', marginBottom: '-20px' }} />
											</div>
											<div className='serviceContents' >
												<div className='serviceHeader'>
													<div className='serviceLeft'>
														<h3 className='serviceName'>{servicesInfo.name}</h3>
														<div className='serviceprovider'>
															<img alt="cover" src={servicesInfo.profileImage} style={{ width: '25px', height: '25px', borderRadius: '50%' }}></img>
															<p className='provider-Name'>{servicesInfo.providerName}</p>
														</div>
													</div>
													<div className='serviceRight'>
														<Dropdown overlay={() => menu(servicesInfo)} trigger={['click']}>
															<FaEllipsisV className='service-listing-ellipsis'/>
														</Dropdown>
													</div>

												</div>

												<div className='description'>{servicesInfo.description}</div>

												<div className='bottom-part'>
													<div className='price'>P{servicesInfo.minPrice} - P{servicesInfo.maxPrice}</div>
												</div>
											</div>
										</div>
									</div>
								))}

							</>)}
						</div>
						</div>
					)
				)}
			</div>
		</div>
	);



}
export default NewServiceListings








{/* <img alt="cover" src={servicesInfo.coverImage} style={{ width: '100%', aspectRatio: '4/4', objectFit: 'cover', marginBottom: '-20px' }} /> height: 200, */}


{/* <div style={{ padding: '20px', paddingBottom: '10px', width: '100%', overflowX: 'auto' }}>
	<div style={{ display: 'flex', maxWidth: '100%' }}>
		{filterByVerified.map(servicesInfo => (
			<Card key={servicesInfo.id} style={{ width: 'calc(50% - 10px)', marginBottom: '0px', marginRight: '10px', borderRadius: '0px' }}>
				<img alt="cover" src={servicesInfo.coverImage} style={{ width: '100%', height: 200, objectFit: 'cover' }} />
				<div style={{}}>
					<h3>{servicesInfo.name}</h3>
					<p>{servicesInfo.description}</p>
					<p>Price Range: P{servicesInfo.minPrice} - P{servicesInfo.maxPrice}</p>
					<p>Provider: {servicesInfo.providerName}</p>
				</div>
			</Card>
		))}
	</div>
	</div> */}


{/* <div style={{ padding: '20px' }}>
	<div className='service-scroller' style={{ display: 'grid', gap: '15px', gridAutoFlow: 'column', gridAutoColumns: '33%', overflowX: 'auto', overscrollBehaviorInline: 'contain', width: '100%' }}>
		{filterByVerified.map(servicesInfo => (
			<div style={{ width: '100%', height: '500px', backgroundColor: '#FFFFFF', boxShadow: '7px 5px 5px rgba(30, 30, 30, 0.3)' }}>
				<div key={servicesInfo.id} style={{ width: '100%', marginRight: '10px', borderRadius: '0px' }}>
					<div style={{ inlineSize: '100%', aspectRatio: '16/9', objectFit: 'cover' }}>
						<img alt="cover" src={servicesInfo.coverImage} style={{ width: '100%', height: 200, objectFit: 'cover' }} />
					</div>
					<div style={{}}>
						<h3>{servicesInfo.name}</h3>
						<p>{servicesInfo.description}</p>
						<p>Price Range: P{servicesInfo.minPrice} - P{servicesInfo.maxPrice}</p>
						<p>Provider: {servicesInfo.providerName}</p>
					</div>
				</div>
			</div>

		))}
	</div>
</div> */}
