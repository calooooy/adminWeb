import React, { useState, useEffect } from 'react';
import '../../Admin.css';
import '../Dashboard/dashboard.css'
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
			{/* <hr className='Divider' style={{ width: '100%'}} /> */}

		   <div className='message-container'>
				<div className='dbLeft'>
					<div className='dbCard'>
						<div className='item'>
							<h2>Service Seekers</h2>
							<h1>{seekerCount}</h1>
						</div>
						<div className='item'>
							<h2>Service Providers</h2>
							<h1>{providerCount}</h1>
						</div>
						<div className='item'>
							<h2>Completed Services</h2>
							<h1>{completedServicesCount}</h1>
						</div>
					</div>
					<div className='dbGraph'>
						<DashboardChart />
						{/* <div style={{backgroundColor:'white', width: '100%', height:'300px'}}>
							<DashboardChart />
						</div> */}
					</div>
				</div>
				<div className='dbRight'>
				<div style={{alignItems:'center', justifyContent: 'center', padding: '0px 0px 0px 0px'}}>
						
							<div className='TopPerforming'>
								<TopPerforming />
							</div>
					</div>
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
					const response = await Axios.get(`http://3.26.59.191:/admin/getUser/${doc.id}`);
					const userData = response.data.data;
					// console.log(userData);
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
		<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', }}>
		  <img src={url} alt="User" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '50%', border: '2px solid #75B9D9', padding: '0px' }} />
		</div>
	  );
	  

	return (
		<div>
			<div className="topPerformingTableTitle">Top Performing Providers</div>
			<Table
				style={{ width: '100%'}}
				components={{
					body: {
						cell: ({ children }) => <td style={{padding:'10px 3px', justifyContent:'center', alignItems:'center', }}>{children}</td>
					}
				}}
				size='large'
				columns={[
					{
						dataIndex: "rank",
						render: (text) => <span style={{
							color: '#75B9D9',
							fontSize: '32px',
							textAlign: 'center', // Center align the text
							display: 'flex', // Use flexbox to center vertically
							justifyContent: 'center', // Center horizontally
							alignItems: 'center', // Center vertically
							padding: '3px'
						}}>{text}</span>
					},
					{
						dataIndex: "profileImage",
						render: renderImage,
						align: 'center',
					},
					{
						dataIndex: "fullName",
						render: (text, record) => (
							<span style={{ textAlign: 'center', fontSize: '18px' }}>{text}</span>
						)
					}
				]}
				loading={loading}
				dataSource={dataSource}
				pagination={false}
				showHeader={false}
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
		maintainAspectRatio: false,
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
            y: {
				min: 0, // Set the minimum value for the y-axis
				max: 1000, // Set the maximum value for the y-axis
				grid: { display: false },
			},
          }
    };

	function DashboardChart() {
        const [data, setData] = useState(generateRandomData());
      
        function generateRandomData() {
          const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
          const randomData = labels.map(() => Math.random() * 700 + 300);
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

