import './../Admin.css';
import PageContent from '../AdminHomeComponents/PageContent/PageContent';
import AdminHeader from '../AdminHomeComponents/AdminHeader/AdminHeader';
import SideMenu from '../AdminHomeComponents/SideMenu/SideMenu';
import { useState } from 'react';


function AdminHome({onLogout}) {
    // const [seekerDataSource, setSeekerDataSOurce] = useState([])

    // useEffect(() => {
    //     setLoading(true);
    //     const db = getFirestore();
    //     const seekerCollection = collection(db, "seekers");
    
    //     const fetchSeekers = async () => {
    //       try {
    //         const querySnapshot = await getDocs(seekerCollection);
    //         const seekerData = [];
    
    //         await Promise.all(querySnapshot.docs.map(async (doc) => {
    //           const data = doc.data();
    //           const firstName = data.name?.firstName || "";
    //           const lastName = data.name?.lastName || "";
    //           const fullName = `${firstName} ${lastName}`;
    //           const streetAddress1 = data.address?.streetAddress1 || "";
    //           const streetAddress2 = data.address?.streetAddress2 || "";
    //           const barangay = data.address?.barangay || "";
    //           const city = data.address?.cityMunicipality || "";
    //           const fullAddress = streetAddress2 !== "" ? `${streetAddress1}, ${streetAddress2}, ${barangay}, ${city}` : `${streetAddress1}, ${barangay}, ${city}`;
    //           const seekerInfo = {
    //             id: doc.id,
    //             fullName: fullName,
    //             address: fullAddress,
    //             city: data.address.cityMunicipality || "",
    //             barangay: data.address.barangay || "",
    //             servicesAvailed: data.servicesAvailed || 0,
    //             reportsReceived: data.reportsReceived || 0,
    //             violationRecord: data.violationRecord || 0,
    //           };
    //           const response = await Axios.get(`http://192.168.254.158:5000/admin/getUser/${doc.id}`);
    //           const userData = response.data.data;
    //           seekerInfo.profileImage = userData.profileImage;
    //           seekerInfo.email = userData.email;
    //           seekerInfo.phone = userData.mobile;
    //           seekerInfo.suspension = userData.suspension;
    //           seekerData.push(seekerInfo);
    //         }));
    
    //         setSeekerDataSource(seekerData);
    //         setLoading(false);
    
    //       } catch (error) {
    //         console.error("Error fetching seekers ", error);
    //       } finally {
    //         setLoading(false);
    //         setDeletedUser(false);
    //         setUnsuspendUser(false);
    //       }
    //     };
    
    //     fetchSeekers();
    
    //     // const unsubscribe = onSnapshot(seekerCollection, () => {
    //     //   fetchSeekers();
    //     // });
    
    //     // return () => unsubscribe();
    
    
    //   }, [flagged, selectedUser, deletedUser, unsuspendUser]);


    return <div className="AdminHome">
       <AdminHeader onLogout={onLogout}/>

       <div className='SideMenuAndPageContent'>
         
        <SideMenu></SideMenu>
        {/* <button className="logOutButton" onClick={onLogout}>Logout</button> */}
        <PageContent></PageContent>
       </div>
    </div>
}

export default AdminHome;