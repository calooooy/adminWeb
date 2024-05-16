import React, { useState, useEffect } from 'react';
import '../../Admin.css';
import { Space, Table } from 'antd';
import './../../firebase';
import { getFirestore, addDoc, collection, getDocs, onSnapshot } from 'firebase/firestore';
import Axios from 'axios';


function Dashboard() {

	const db = getFirestore();
	const seekerCollection = collection(db, "seekers");
	const providerCollection = collection(db, "providers");

	const [seekers, setSeekers] = useState([]);
	const [providers, setProviders] = useState([]);
	const [completedServicesCount, setCompletedServicesCount] = useState(0);


	useEffect(() => {
		const fetchSeekers = async () => {
			const querySnapshot = await getDocs(seekerCollection);
			const seekerData = [];
			querySnapshot.forEach((doc) => {
				seekerData.push(doc.data());
			});
			setSeekers(seekerData);
		};

		const fetchProviders = async () => {
			const querySnapshot = await getDocs(providerCollection);
			const providerData = [];
			querySnapshot.forEach((doc) => {
				providerData.push(doc.data());
			});
			setProviders(providerData);
		};

		const iterateOverCompletedServicesCount = async () => {
			const querySnapshot = await getDocs(providerCollection);
			let totalCount = 0;

			querySnapshot.forEach((doc) => {
				const providerData = doc.data();
				const completedServices = providerData.completedServices || 0;

				if (typeof completedServices === 'number') {
					totalCount += completedServices;
				}
			});

			setCompletedServicesCount(totalCount);
		};

		fetchSeekers();
		fetchProviders();
		iterateOverCompletedServicesCount();

		const unsubscribeSeekers = onSnapshot(seekerCollection, (snapshot) => {
			const data = snapshot.docs.map(doc => doc.data());
			setSeekers(data);
		});

		const unsubscribeProviders = onSnapshot(providerCollection, (snapshot) => {
			const data = snapshot.docs.map(doc => doc.data());
			setProviders(data);
		});


		return () => {
			unsubscribeSeekers();
			unsubscribeProviders();
		};
	}, [seekerCollection, providerCollection]);


	const seekerCount = seekers.length;
	const providerCount = providers.length;
	const completedServiceCount = completedServicesCount;

	return (
		<div style={{ width: '100%' }}>
			<h1 className='DashboardHeader'>Dashboard</h1>
			<hr className='Divider' style={{ width: '100%' }} />
			<div style={{width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
				<div style={{padding: '20px', display: 'flex', flexDirection: 'column'}}>
					<Space direction="horizontal" style={{marginBottom: '20px', width: '685px', justifyContent: 'space-between'}}>
						<DashboardCard title={"Service Seekers"} value={seekerCount}></DashboardCard>
						<DashboardCard title={"Service Providers"} value={providerCount}></DashboardCard>
						<DashboardCard title={"Completed Service "} value={completedServiceCount}></DashboardCard>
					</Space>
					<div style={{backgroundColor:'white', width: '685px', height:'360px'}}>
						<DashboardChart />
						</div>
				</div>
					<div style={{alignItems:'center', justifyContent: 'center', padding: '0px 0px 0px 20px'}}>
						<Space>
							<div className='TopPerforming'>
								<TopPerforming />
							</div>
						</Space>
					</div>
						</div>
						</div>
	);
}

function DashboardCard({ title, value }) {
	return (
		<div className="square">
			<div className="cardTitle">{title}</div>
			<div className="value">{value}</div>
		</div>
	);
}


function TopPerforming() {
	const [dataSource, setDataSource] = useState([]);
	const [loading, setLoading] = useState(false);

	function computeCombinedScore(rating, completedServices, ratingWeight, servicesWeight) {
		const combinedScore = (rating * ratingWeight) + (completedServices * servicesWeight);
		return combinedScore;
	}

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
					const providerInfo = {
						id: doc.id,
						fullName: fullName,
						profileImage: data.profileImage || "",
						rating: data.rating || 0,
						completedServices: data.completedServices || 0
					};
					const response = await Axios.get(`http://172.16.4.26:5000/admin/getUser/${doc.id}`);
					const userData = response.data.data;
					console.log(userData);
					providerInfo.profileImage = userData.profileImage;
					providerData.push(providerInfo);
				}));

				const rankedProviders = providerData.map(provider => ({
					...provider,
					combinedScore: computeCombinedScore(provider.rating, provider.completedServices, 0.7, 0.3)
				})).sort((a, b) => {
					if (b.combinedScore !== a.combinedScore) {
						return b.combinedScore - a.combinedScore;
					} else {
						return a.fullName.localeCompare(b.fullName);
					}
				});

				rankedProviders.forEach((provider, index) => {
					provider.rank = index + 1;
				});

				setDataSource(rankedProviders.slice(0, 5));
				setLoading(false);
			} catch (error) {
				console.error("Error fetching providers:", error);
				setLoading(false);
			}
		};

		fetchProviders();

		// const unsubscribe = onSnapshot(providerCollection, () => {
		// fetchProviders();
		// });

		// return () => unsubscribe();
	}, []);

	const renderImage = (url) => (
		<div style={{ width: 50, height: 50, borderRadius: '50%', overflow: 'hidden' }}>
			<img src={url} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
		</div>
	);

	return (
		<div>
			<h1 className="topPerformingTableTitle">Top Performing Service Providers</h1>
			<Table
				style={{ width: '100%', marginLeft: '0px' }}
				components={{
					body: {
						cell: ({ children }) => <td>{children}</td>
					}
				}}
				size='small'
				columns={[
					{
						dataIndex: "rank",
						render: (text) => <span style={{
							color: '#75B9D9',
							fontSize: '32px',
							textAlign: 'center', // Center align the text
							display: 'flex', // Use flexbox to center vertically
							justifyContent: 'center', // Center horizontally
							alignItems: 'center' // Center vertically
						}}>{text}</span>
					},
					{
						dataIndex: "profileImage",
						render: renderImage,
						width: '50px'
					},
					{
						dataIndex: "fullName",
						render: (text, record) => (
							<span style={{ textAlign: 'left', fontSize: '20px' }}>{text}</span>
						)
					}
				]}
				loading={loading}
				dataSource={dataSource}
				pagination={false}
			/>
		</div>
	);
}


/* FOR GRAPH */

import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Filler,
	Legend,
	} from 'chart.js';
	import { Line } from 'react-chartjs-2';

	ChartJS.register(
		CategoryScale,
		LinearScale,
		PointElement,
		LineElement,
		Title,
		Tooltip,
		Filler,
		Legend
	);

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
                position: 'bottom',
            },
            title: {
                display: true,
                text: 'Sales Report',
                font: { size: 20, }, 
                align: 'center',
            },
        },
        scales: {
            x: { grid: { display: false }},
            y: { grid: { display: false }},
          }
    };

	function DashboardChart() {
        const [data, setData] = useState(generateRandomData());
      
        function generateRandomData() {
          const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
          const randomData = labels.map(() => Math.random() * 1000);
          return {
            labels,
            datasets: [
              {
                fill: true,
                label: 'Monthly Sales Report',
                data: randomData,
                borderColor: '#78BDDD',
                backgroundColor: 'rgba(53, 162, 255, 0.16)',
                tension: 0.3
              },
            ],
          };
        }
      
        return <Line options={options} data={data} />;
      }

/* END OF FOR GRAPH */

export default Dashboard;


/* FOR GRAPH */

// import {
// 	Chart as ChartJS,
// 	CategoryScale,
// 	LinearScale,
// 	PointElement,
// 	LineElement,
// 	Title,
// 	Tooltip,
// 	Filler,
// 	Legend,
// 	} from 'chart.js';
// 	import { Line } from 'react-chartjs-2';

// 	ChartJS.register(
// 		CategoryScale,
// 		LinearScale,
// 		PointElement,
// 		LineElement,
// 		Title,
// 		Tooltip,
// 		Filler,
// 		Legend
// 	);


// 	function DashboardChart() {
// 		const options = {
// 			responsive: true,
// 			plugins: {
// 				legend: {
// 					position: 'bottom',
// 				},
// 				title: {
// 					display: true,
// 					text: 'Sales Report',
// 				},
// 			},
// 			};

// 				const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// 		const data = {
// 			labels,
// 			datasets: [
// 				{
// 					fill: true,
// 					label: 'Monthly Sales Report',
// 					data: labels.map(() => Math.random()*1000),
// 					borderColor: 'rgb(53, 162, 235)',
// 					backgroundColor: 'rgba(53, 162, 235, 0.5)',
// 				},
// 			],
// 			};

// 		return <Line options={options} data={data} />;
// 	}

// /* END OF FOR GRAPH */


