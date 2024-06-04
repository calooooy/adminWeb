import React, { useState, useEffect } from 'react';
import { FaEllipsisV } from 'react-icons/fa';
import { Table, Dropdown, Menu, Space, Card, Spin } from 'antd';
import { getFirestore, collection, getDocs, onSnapshot, doc, deleteDoc, getDoc, updateDoc } from 'firebase/firestore';
import Axios from 'axios';

function PendingComplaints() {
	const [loading, setLoading] = useState(false);
	const [dataSource, setDataSource] = useState([]);
	const [changes, setChanges] = useState(false);
	const [showSpinner, setShowSpinner] = useState(true);
	const [updating, setUpdating] = useState(false);

	useEffect(() => {
		setLoading(true);

		const fetchReports = async () => {
			try {

				const response = await Axios.get('http://3.26.59.191:5001/report/getReports');
				const reportsData = response.data.filter(report => {
					if (report.reportedId != '1') {
						return report;
					}})

				// Initialize array to store report info
				const reportInfoData = [];

				// Fetch additional data from Firebase for each report
				for (const report of reportsData) {
					var reporterDoc, reportedDoc

					const reporterResponse = await Axios.get(`http://3.26.59.191:5001/admin/getUser/${report.reporterId}`); //for reporter profileImage
					const reportedResponse = await Axios.get(`http://3.26.59.191:5001/admin/getUser/${report.reportedId}`); //for reported role

					const db = getFirestore();

					const reporterProfileImage = reporterResponse.data.data.profileImage
					const reportedRole = reportedResponse.data.data.role

					if (reportedRole == 'Provider') {
						reporterDoc = await getDoc(doc(db, 'seekers', report.reporterId));
						reportedDoc = await getDoc(doc(db, 'providers', report.reportedId));
					}
					else {
						reporterDoc = await getDoc(doc(db, 'providers', report.reporterId));
						reportedDoc = await getDoc(doc(db, 'seekers', report.reportedId));
					}

					// reporterDoc = await getDoc(doc(db, 'seekers', report.reporterId));
					// reportedDoc = await getDoc(doc(db, 'providers', report.reportedId));

					// console.log(reporterProfileImage)
					// console.log(reportedRole)

					const reporterData = reporterDoc.data();
					const reportedData = reportedDoc.data();

					// console.log(reporterData)
					// console.log(reportedData)


					reportInfoData.push({
						id: report._id,
						reporterId: report.reporterId,
						reporterName: `${reporterData.name.firstName} ${reporterData.name.lastName}`,
						reporterProfileImage: reporterProfileImage,
						reportedId: report.reportedId,
						reportedName: `${reportedData.name.firstName} ${reportedData.name.lastName}`,
						reportedRole: reportedRole,
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
		if (report.status == 'PENDING') {
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
			await Axios.delete(`http://3.26.59.191:5001/report/deleteReport/${record.id}`)
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

	const handleTakeAction = async (record) => {
		setUpdating(true)

		try{
            await Axios.put(`http://3.26.59.191:5001/report/updateReport/${record.id}`, {
                status: 'IN PROGRESS'
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

	const renderActions = (record) => {
		if (!record) {
		  return null;
		}
	
		return (
		  <Dropdown
			overlay={
			  <Menu>
				<Menu.Item key="delete" onClick={() => handleIgnore(record)}>Ignore</Menu.Item>
                <Menu.Item key="delete" onClick={() => handleTakeAction(record)}>Take Action</Menu.Item>
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
		  Axios.patch('http://3.26.59.191:5001/admin/suspendUser', userData)
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
			<h1 className='DashboardHeader'>Pending Complaints</h1>
		  </div>
		  <div className='message-container'>
			{showSpinner ? (
			  <div className='showSpinner'>
				<Spin size="large" />
			  </div>
			) : (
			  filterByStatus.length === 0 ? (
				<div style={{padding: '10px 0px 0px 10px'}} >No current Pending Complaints to review</div>
			  ) : (
				<div className='complaints-scroller1'>
				  {changes ? (
					<div className='updateSpinner'>
					  <Spin size="large" />
					</div>
				  ) : (
					<>
					  <div className='complaintsCount1' style={{padding: '10px 0px 0px 10px'}}>
						Pending Complaints to Review: {filterByStatus.length}
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
								<div className='complaintReason1' style={{margin: 10, fontSize: 14, textAlign: 'justify', maxHeight: 150, overflowY: 'auto', width: 'auto'}}>{reportInfoData.reason}</div>
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
export default PendingComplaints


