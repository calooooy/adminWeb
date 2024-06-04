import React, { useState, useEffect } from 'react';
import { FaEllipsisV } from 'react-icons/fa';
import { Table, Dropdown, Menu, Space, Card, Spin } from 'antd';
import { getFirestore, collection, getDocs, onSnapshot, doc, deleteDoc, getDoc, setDoc, query, where } from 'firebase/firestore';
import Axios from 'axios';

function InProgressIssues() {
	const [loading, setLoading] = useState(false);
	const [dataSource, setDataSource] = useState([]);
	const [changes, setChanges] = useState(false);
	const [showSpinner, setShowSpinner] = useState(true);
	const [updating, setUpdating] = useState(false);

	useEffect(() => {
		setLoading(true);

		const fetchReports = async () => {
			try {

				const response = await Axios.get('https://172.16.4.26:5001/report/getReports');
				const reportsData = response.data.filter(report => {
					if (report.reportedId == '1') {
						return report;
					}})

				// console.log(reportsData.reportedId)

				// Initialize array to store report info
				const reportInfoData = [];

				// Fetch additional data from Firebase for each report
				for (const report of reportsData) {
					var reporterDoc, reportedDoc

					console.log(report.reportedId)

					const reporterResponse = await Axios.get(`https://172.16.4.26:5001/admin/getUser/${report.reporterId}`); //for reporter profileImage
					// const reportedResponse = await Axios.get(`https://172.16.4.26:5001/admin/getUser/${report.reportedId}`); //for reported role

					const db = getFirestore();

					const reporterProfileImage = reporterResponse.data.data.profileImage
					const reporterRole = reporterResponse.data.data.role
					// const reportedId = reportedResponse.data.data.reportedId

					if (reporterRole == 'Seeker') {
						reporterDoc = await getDoc(doc(db, 'seekers', report.reporterId));
					}
					else {
						reporterDoc = await getDoc(doc(db, 'providers', report.reporterId));
					}

					// reporterDoc = await getDoc(doc(db, 'seekers', report.reporterId));
					// reportedDoc = await getDoc(doc(db, 'providers', report.reportedId));

					// console.log(reporterProfileImage)
					// console.log(reportedRole)

					const reporterData = reporterDoc.data();
					// const reportedData = reportedDoc.data();

					// console.log(reporterData)
					// console.log(reportedData)


					reportInfoData.push({
						id: report._id,
						reporterId: report.reporterId,
						reporterName: `${reporterData.name.firstName} ${reporterData.name.lastName}`,
						reporterProfileImage: reporterProfileImage,
						reportedId: report.reportedId,
						// reportedName: `${reportedData.name.firstName} ${reportedData.name.lastName}`,
						// reportedRole: reportedRole,
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

	// const filterByStatus = dataSource.filter((data => {
	// 	if (data.status == 'Pending') {
	// 		return data;
	// 	}
	// }))



	const handleIgnore = async (record) => {
		console.log(record.id)
		setUpdating(true)

		try{
			await Axios.delete(`https://172.16.4.26:5001/report/deleteReport/${record.id}`)
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

	const handleView = (record) => {
		console.log("For view")
	}

	const handleResolve = async (record) => {
		setUpdating(true)

		try{
            await Axios.put(`https://172.16.4.26:5001/report/updateReport/${record.id}`, {
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

	const handleMessage = async (record) => {
		const adminId = localStorage.getItem('adminId');
			const userId = record.reporterId;
			const chatId = `${adminId}_${userId}`;
		
		const messageData = {
			users: [localStorage.getItem('adminId'), record.reporterId],
			usersFullName: { admin: localStorage.getItem('adminName'), user: record.reporterName },
			usersImage: { admin: 'https://firebasestorage.googleapis.com/v0/b/servicita-signin-fa66f.appspot.com/o/CMSC%20128%201.png?alt=media&token=84ee6b35-73ff-4667-9720-53f2a40490a3', user: record.reporterProfileImage },
			usersId: { admin: localStorage.getItem('adminId'), user: record.reporterId},
			lastMessage: '',
			lastSeen: { admin: true, user: false },
			createdAt: new Date(),
			lastMessageTime: new Date(),
			messages: [
				{
					text: `Hello ${record.reporterName},\n\nThank you for bringing this issue to our attention. We have received your report regarding the following issue:\n\n"${record.reason}"\n\nOur team is currently reviewing the details and will take appropriate action. If we need any additional information, we will contact you at the email address you provided.\n\nPlease note that we take all reports seriously and strive to address issues as promptly as possible. We appreciate your patience during this review process.\n\nIf you have any further questions or additional information to provide, please feel free to reply to this message or contact our support team directly.\n\nThank you for helping us maintain a safe and respectful community.\n\nSincerely,\n\nThe Support Team`,
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

	const renderActions = (record) => {
		if (!record) {
		  return null;
		}
	
		return (
		  <Dropdown
			overlay={
			  <Menu>
				<Menu.Item key="delete" onClick={() => handleResolve(record)}>Resolve</Menu.Item>
                {/* <Menu.Item key="delete" onClick={() => handleMessage(record)}>Message</Menu.Item> */}
				{/* <Menu.SubMenu title="Resolve">
				  <Menu.Item key="5_hours" onClick={() => handleSubMenuClick(record, 5)}>5 hours</Menu.Item>
				  <Menu.Item key="1_day" onClick={() => handleSubMenuClick(record, 24)}>1 day</Menu.Item>
				  <Menu.Item key="1_week" onClick={() => handleSubMenuClick(record, 168)}>1 week</Menu.Item>
				</Menu.SubMenu> */}
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


	  const handleSubMenuClick = (record, action) => {

		try {
		  const userData = {
			userId: record.reportedId,
			action: action
		  }
		  Axios.patch('https://172.16.4.26:5001/admin/suspendUser', userData)
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
			handleIgnore(record);
		}
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
			<h1 className='DashboardHeader'>In Progress Issues</h1>
		  </div>
		  <div className='message-container'>
			{showSpinner ? (
			  <div className='showSpinner'>
				<Spin size="large" />
			  </div>
			) : (
			  filterByStatus.length === 0 ? (
				<div style={{padding: '10px 0px 0px 10px'}} >No current In Progress Issues to review</div>
			  ) : (
				<div className='complaints-scroller1'>
				  {changes ? (
					<div className='updateSpinner'>
					  <Spin size="large" />
					</div>
				  ) : (
					<>
					  <div className='complaintsCount1' style={{padding: '10px 0px 0px 10px'}}>
                      In Progress Issues to Review: {filterByStatus.length}
					  </div>
					  <div className='reviewComplaintsRender1'>
						{filterByStatus.map((reportInfoData) => (
						  <div key={reportInfoData.id} className='complaintsCard1' style={{}}>
							<div className='complaintsCardContent1' style={{}}>
							  <div style={{ padding: '20px',}}>
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
								<div className='complaintReason1' style={{margin: "20px 10px 10px 20px", fontSize: 14, textAlign: 'justify', maxHeight: 150, overflowY: 'auto', }}>{reportInfoData.reason}</div>
								{/* <div className='bottom-part2' style={{display: 'flex', justifyContent: 'flex-end', gap: 5, fontSize: 12, marginTop: 25}}>
								  <div className='reported-user-label1'>Reported User: </div>
								  <div className='reported-user-role1'>({reportInfoData.reportedRole})</div>
								  <div className='reported-user-name1'>{reportInfoData.reportedName}</div>
								</div> */}
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
export default InProgressIssues


