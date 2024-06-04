import React, { useState, useEffect } from 'react';
import { FaEllipsisV } from 'react-icons/fa';
import { Table, Dropdown, Menu, Space, Card, Spin } from 'antd';
import { getFirestore, collection, getDocs, onSnapshot, doc, deleteDoc, getDoc, setDoc, query, where } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import Axios from 'axios';

function InProgressComplaints() {
	const [loading, setLoading] = useState(false);
	const [dataSource, setDataSource] = useState([]);
	const [changes, setChanges] = useState(false);
	const [showSpinner, setShowSpinner] = useState(true);
	const [updating, setUpdating] = useState(false);

	useEffect(() => {
		setLoading(true);

		const fetchReports = async () => {
			try {

				const response = await Axios.get('https://servicita-back-end-hazel.vercel.app//report/getReports');
				const reportsData = response.data.filter(report => {
					if (report.reportedId != '1') {
						return report;
					}})

				// Initialize array to store report info
				const reportInfoData = [];

				// Fetch additional data from Firebase for each report
				for (const report of reportsData) {
					var reporterDoc, reportedDoc

					const reporterResponse = await Axios.get(`https://servicita-back-end-hazel.vercel.app//admin/getUser/${report.reporterId}`); //for reporter profileImage
					const reportedResponse = await Axios.get(`https://servicita-back-end-hazel.vercel.app//admin/getUser/${report.reportedId}`); //for reported role

					const reporterSuspended = reporterResponse.data.data.suspension.isSuspended
					const reportedSuspended = reportedResponse.data.data.suspension.isSuspended

					const reporterEmail = reporterResponse.data.data.email;
					const reportedEmail = reportedResponse.data.data.email;

					const db = getFirestore();

					const reporterProfileImage = reporterResponse.data.data.profileImage
					const reportedProfileImage = reportedResponse.data.data.profileImage
					const reportedRole = reportedResponse.data.data.role
					const reporterRole = reporterResponse.data.data.role

					if (reportedRole == 'Provider') {
						reporterDoc = await getDoc(doc(db, 'seekers', report.reporterId));
						reportedDoc = await getDoc(doc(db, 'providers', report.reportedId));
					}
					else {
						reporterDoc = await getDoc(doc(db, 'providers', report.reporterId));
						reportedDoc = await getDoc(doc(db, 'seekers', report.reportedId));
					}

					const reporterData = reporterDoc.data();
					const reportedData = reportedDoc.data();

					console.log()

					reportInfoData.push({
						id: report._id,

						reporterId: report.reporterId,
						reporterName: `${reporterData.name.firstName} ${reporterData.name.lastName}`,
						reporterRole: reporterRole,
						reporterProfileImage: reporterProfileImage,
						reporterSuspended: reporterSuspended,
						reporterEmail: reporterEmail,


						reportedId: report.reportedId,
						reportedName: `${reportedData.name.firstName} ${reportedData.name.lastName}`,
						reportedRole: reportedRole,
						reportedProfileImage: reportedProfileImage,
						reportedSuspended: reportedSuspended,
						reportedEmail: reportedEmail,

						reason: report.reason,
						createdAt: new Date(report.createdAt), // Assuming createdAt is already a Date in MongoDB
						status: report.status
					});
				}







				setDataSource(reportInfoData);
				setLoading(false);
				setChanges(false)


				// Show spinner for 2 seconds
				setTimeout(() => {
					setShowSpinner(false);
				}, 1500);

			} catch (error) {
				console.error("Error fetching reports: ", error);
			} finally {
				setLoading(false);
			}
		};

		fetchReports();
	}, [changes]);


	const filterByStatus = dataSource.filter((report => {
		if (report.status == 'IN PROGRESS') {
			return report;
		}
	}))


	const handleMessage = async (record, type) => {
		const adminId = localStorage.getItem('adminId');
			const userId = type === 'reporter' ? record.reporterId : record.reportedId;
			const chatId = `${adminId}_${userId}`;
		
		const messageData = {
			users: [localStorage.getItem('adminId'), type === 'reporter' ? record.reporterId : record.reportedId],
			usersFullName: { admin: localStorage.getItem('adminName'), user: type === 'reporter' ? record.reporterName : record.reportedName },
			usersImage: { admin: 'https://firebasestorage.googleapis.com/v0/b/servicita-signin-fa66f.appspot.com/o/CMSC%20128%201.png?alt=media&token=84ee6b35-73ff-4667-9720-53f2a40490a3', user: type === 'reporter' ? record.reporterProfileImage : record.reportedProfileImage },
			usersId: { admin: localStorage.getItem('adminId'), user: type === 'reporter' ? record.reporterId : record.reportedId },
			lastMessage: '',
			lastSeen: { admin: true, user: false },
			createdAt: new Date(),
			lastMessageTime: new Date(),
			messages: [
				{
					text: type === 'reporter' ? `Hello ${record.reporterName}, it seems you have a complaint. How can I help you?` : `Hello ${record.reportedName}, it seems you have been reported by another user due to ${record.reason}. I would like to hear your side of the story.`,
					createdAt: new Date(),
					_id: `${chatId}_${new Date().getTime()}_${adminId}`,
					user: { _id: adminId }
				}

			]
		}

		try {
			setShowSpinner(true);
			
			const db = getFirestore();
			const chatRef = collection(db, 'adminChats');
			const q = query(chatRef, where('users', 'array-contains', adminId));
			const querySnapshot = await getDocs(q);

			const chatExists = querySnapshot.docs.some(doc => {
			const chatData = doc.data();
			return chatData.users.includes(userId);
			});
			if (chatExists) {
				alert('Chat already exists');
			} else {				
				const chatDocRef = doc(db, 'adminChats', chatId);
				await setDoc(chatDocRef, messageData);
				alert('Chat created successfully, you can now message the user');
			}

		} catch (error) {
			console.error("Error:", error)
		
		} finally {
			setShowSpinner(false);
		}
	}

	const handleResolve = async (record) => {
		setUpdating(true)

		try{
            await Axios.put(`https://servicita-back-end-hazel.vercel.app//report/updateReport/${record.id}`, {
                status: 'RESOLVED'
              });
			setChanges(true)
			setLoading(true)
		} catch (error) {
            console.error("Error:", error)
		} finally {
			setTimeout(() => {
				setUpdating(false); // Set updating/loading state to false after a delay
			}, 1200);
		}
	}

    // const handleResolve = async (record) => {
	// 	setUpdating(true)

	// 	try{
    //         await Axios.put(`https://servicita-back-end-hazel.vercel.app//report/updateReport/${record.id}`, {
    //             status: 'RESOLVED'
    //           });

	// 		const db = getFirestore();
	// 		const chatRef = collection(db, 'adminChats');
	// 		const querySnapshot = getDocs(chatRef);
	// 		const chatDocs = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
	// 		const chatExistsForReporter = chatDocs.find(chat => chat.users.includes(localStorage.getItem('adminId')) && chat.users.includes(record.reporterId));
	// 		const chatExistsForReported = chatDocs.find(chat => chat.users.includes(localStorage.getItem('adminId')) && chat.users.includes(record.reportedId));

	// 		if (chatExistsForReporter) {
	// 			await deleteDoc(doc(db, 'adminChats', chatExistsForReporter.id));
	// 		}

	// 		if (chatExistsForReported) {
	// 			await deleteDoc(doc(db, 'adminChats', chatExistsForReported.id));
	// 		}

	// 		 const imagesToDelete = [];

	// 		 chatDocs.forEach(chat => {
	// 			 chat.messages.forEach(message => {
	// 				 if (message.image) {
	// 					 imagesToDelete.push(message.image);
	// 				 }
	// 			 });
	// 		 });
	 
	// 		 const storage = getStorage();

	// 		imagesToDelete.forEach(async (imageUrl) => {
	// 			const imageRef = ref(storage, imageUrl);
	// 			await deleteObject(imageRef);
	// 		});

	// 		setChanges(true)
	// 		setLoading(true)
	// 	} catch (error) {
    //         console.error("Error:", error)
	// 	} finally {
	// 		setTimeout(() => {
	// 			setUpdating(false); // Set updating/loading state to false after a delay
	// 		}, 1200);
	// 	}
	// }

	const handleUnsuspendReporter = (record) => {
		try {
		  const userData = {
			email: record.reporterEmail
		  }
		  Axios.patch('http://:5001/admin/unsuspendUser', userData)
			.then((response) => {
			  alert('User unsuspended successfully');
			  setUnsuspendUser(true);
			})
			.catch((error) => {
			  console.error('Error unsuspending user: ', error);
			});
			setChanges(true)
			setLoading(true)
		} catch (error) {
		  console.error('Error unsuspending user: ', error);
		}
	  }

	const handleUnsuspendReported = (record) => {
		try {
		  const userData = {
			email: record.reportedEmail
		  }
		  Axios.patch('https://servicita-back-end-hazel.vercel.app//admin/unsuspendUser', userData)
			.then((response) => {
			  alert('User unsuspended successfully');
			  setUnsuspendUser(true);
			})
			.catch((error) => {
			  console.error('Error unsuspending user: ', error);
			});
			setChanges(true)
			setLoading(true)
		} catch (error) {
		  console.error('Error unsuspending user: ', error);
		}
	  }

	const renderActions = (record) => {
		if (!record) {
		  return null;
		}
	
		return (
		  <Dropdown
			overlay={
                <Menu>
                <Menu.SubMenu key="message" title="Message">
					<Menu.Item key="message_reporter" onClick={() => handleMessage(record, 'reporter')}>Reporter</Menu.Item>
					<Menu.Item key="message_reported" onClick={() => handleMessage(record, 'reported')}>Reported</Menu.Item>
				</Menu.SubMenu>

				{/* <Menu.SubMenu key="user" title="User">
					<Menu.Submenu key="user_reporter" title="Reporter">
						<Menu.Item key="reporter_5_hours" onClick={() => handleSubMenuClick(record, 5, 'reporter')}>5 hours</Menu.Item>
                        <Menu.Item key="reporter_1_day" onClick={() => handleSubMenuClick(record, 24, 'reporter')}>1 day</Menu.Item>
                        <Menu.Item key="reporter_1_week" onClick={() => handleSubMenuClick(record, 168, 'reporter')}>1 week</Menu.Item>
					</Menu.Submenu>
					<Menu.Submenu key="user_reported" title="Reporter">
						<Menu.Item key="reporter_5_hours" onClick={() => handleSubMenuClick(record, 5, 'reporter')}>5 hours</Menu.Item>
                        <Menu.Item key="reporter_1_day" onClick={() => handleSubMenuClick(record, 24, 'reporter')}>1 day</Menu.Item>
                        <Menu.Item key="reporter_1_week" onClick={() => handleSubMenuClick(record, 168, 'reporter')}>1 week</Menu.Item>
					</Menu.Submenu>
				</Menu.SubMenu> */}
		
                <Menu.SubMenu key="user" title="User">
                    <Menu.SubMenu key="suspend_reporter" title="Reporter">
						{record.reporterSuspended === true ? <Menu.Item key="unsuspend" onClick={() => handleUnsuspendReporter(record)}>Unsuspend</Menu.Item> : <Menu.SubMenu title="Suspend">
                        	<Menu.Item key="reporter_5_hours" onClick={() => handleSubMenuClick(record, 5, 'reporter')}>5 hours</Menu.Item>
                        	<Menu.Item key="reporter_1_day" onClick={() => handleSubMenuClick(record, 24, 'reporter')}>1 day</Menu.Item>
                        	<Menu.Item key="reporter_1_week" onClick={() => handleSubMenuClick(record, 168, 'reporter')}>1 week</Menu.Item>
						</Menu.SubMenu>
			}
                    </Menu.SubMenu>
			
                    <Menu.SubMenu key="suspend_reported" title="Reported">
					{record.reportedSuspended === true ? <Menu.Item key="unsuspend" onClick={() => handleUnsuspendReported(record)}>Unsuspend</Menu.Item> : <Menu.SubMenu title="Suspend">
                        	<Menu.Item key="reporter_5_hours" onClick={() => handleSubMenuClick(record, 5, 'reporter')}>5 hours</Menu.Item>
                        	<Menu.Item key="reporter_1_day" onClick={() => handleSubMenuClick(record, 24, 'reporter')}>1 day</Menu.Item>
                        	<Menu.Item key="reporter_1_week" onClick={() => handleSubMenuClick(record, 168, 'reporter')}>1 week</Menu.Item>
						</Menu.SubMenu>
			}
                    </Menu.SubMenu>
                </Menu.SubMenu>
                <Menu.Item key="resolve" onClick={() => handleResolve(record)}>Resolve</Menu.Item>
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


	  const handleSubMenuClick = async (record, action, type) => {
		try {
		  const userData = {
			userId: type === 'reporter' ? record.reporterId : record.reportedId,
			action: action
		  }
		  Axios.patch('https://servicita-back-end-hazel.vercel.app//admin/suspendUser', userData)
			.then((response) => {
			  alert('User suspended successfully');
			}
			)
			.catch((error) => {
			  console.error('Error suspending user: ', error);
			});
            await Axios.put(`https://servicita-back-end-hazel.vercel.app//report/updateReport/${record.id}`, {
                status: 'IN PROGRESS'
              });
			setChanges(true)
			setLoading(true)
		} catch (error) {
		  console.error('Error suspending user: ', error);
		} 
		// finally {
		// 	handleIgnore(record);
		// }
	  }

	
	// const menu = (record) => (
	// 	<Menu>
	// 		<Menu.Item key="ignore" onClick={() => handleIgnore(record)}>Ignore</Menu.Item>
	// 		<Menu.Item key="resolve" onClick={() => handleResolve(record)}>Resolve</Menu.Item>
	// 	</Menu>
	// );

	return (
		<div className='reviewComplaints1'>
		  <div>
			<h1 className='DashboardHeader'>In Progress Complaints</h1>
		  </div>
		  <div className='message-container'>
			{showSpinner ? (
			  <div className='showSpinner'>
				<Spin size="large" />
			  </div>
			) : (
			  filterByStatus.length === 0 ? (
				<div style={{padding: '10px 0px 0px 10px'}} >No current In Progress Complaints to review</div>
			  ) : (
				<div className='complaints-scroller1'>
				  {changes ? (
					<div className='updateSpinner'>
					  <Spin size="large" />
					</div>
				  ) : (
					<>
					  <div className='complaintsCount1' style={{padding: '10px 0px 0px 10px'}}>
						In Progress Complaints to Review: {filterByStatus.length}
					  </div>
					  <div className='reviewComplaintsRender1'>
						{filterByStatus.map((reportInfoData) => (
						  <div key={reportInfoData.id} className='complaintsCard1'>
							<div className='complaintsCardContent1'>
							  <div style={{ padding: '20px' }}>
								<div className='complaintsHeader1'>
								  <div className='complaintsLeft1'>
									<div className='serviceprovider1' style={{ display: 'flex', alignItems: 'center'}}>
									  <img alt="cover" src={reportInfoData.reporterProfileImage} style={{ width: '70px', height: '70px', borderRadius: '50%', border: '3px solid #002F45', margin: '0px 10px 0px 0px'}}></img>
									  <div className='nameDate1'>
										<p className='reporter-Name1' style={{fontSize: 18, fontWeight: 'bold'}}>{reportInfoData.reporterName}</p>
										<p className='report-date1' style={{fontSize: 12, margin: '3px 0px'}}>{reportInfoData.createdAt.toLocaleString()}</p>
									  </div>
									</div>
								  </div>
								  <div className='serviceRight1'>
									{renderActions(reportInfoData)}
								  </div>
								</div>
								<div className='complaintReason1' style={{margin: 10, fontSize: 14, textAlign: 'justify', maxHeight: 150, overflowY: 'auto'}}>{reportInfoData.reason}</div>
								<div className='bottom-part2' style={{display: 'flex', justifyContent: 'flex-end', gap: 5, fontSize: 12, marginTop: 25}}>
								  <div className='reported-user-label1'>Reported User: </div>
								  <div className='reported-user-role1'>({reportInfoData.reportedRole})</div>
								  <div className='reported-user-name1'>{reportInfoData.reportedName}</div>
								</div>
							  </div>
							</div>
						  </div>
						))}
					  </div>
					</>
				  )}
				</div>
			  )
			)}
		  </div>
		</div>
	  );

}
export default InProgressComplaints


