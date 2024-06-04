import { Route, Routes } from "react-router-dom";

import Dashboard from "../../Pages/Dashboard/dashboard";
import Message from "../../Pages/Message/message";
import ViewServiceSeekerList from "../../Pages/UserManagement/ViewServiceSeekerList/serviceSeekerList";
import ViewServiceProviderList from "../../Pages/UserManagement/ViewServiceProviderList/serviceProviderList";
import ReportedIssues from "../../Pages/UserManagement/Reported Issues/reportedIssues";
import PendingIssues from "../../Pages/UserManagement/Reported Issues/Pending Issues/pendingIssues";
import InProgressIssues from "../../Pages/UserManagement/Reported Issues/In Progress Issues/inProgressIssues";
import ResolvedIssues from "../../Pages/UserManagement/Reported Issues/Resolved Issues/resolvedIssues";
import PerformanceMonitoring from "../../Pages/ServiceProviderPerformance/PerfromanceMonitoring/PerformanceMonitoring";
import RatingsAndReviews from "../../Pages/ContentModeration/RatingsandReviews/ratingsAndReviews";
import NewServiceListings from "../../Pages/ContentModeration/NewServiceListings/newServiceListings";
import ReviewComplaints from "../../Pages/ContentModeration/ReviewComplaints/ReviewComplaints";
import PendingComplaints from "../../Pages/ContentModeration/ReviewComplaints/PendingComplaints";
import InProgressComplaints from "../../Pages/ContentModeration/ReviewComplaints/InProgressComplaints";
import ResolvedComplaints from "../../Pages/ContentModeration/ReviewComplaints/ResolvedComplaints";



function AdminRoutes() {
    return (
        
            <Routes>
                <Route path="/" element={<Dashboard />} ></Route>
                <Route path="/dashboard" element={<Dashboard />} ></Route>
                <Route path='/message' element={<Message />} ></Route>

                {/* <Route path="/message" element={<Message />} ></Route> */}
                <Route path="/viewSeekerList" element={<ViewServiceSeekerList />} ></Route>
                <Route path="/viewProviderList" element={<ViewServiceProviderList />} ></Route>
                {/* <Route path="/viewReportedIssues" element={<ReportedIssues />} ></Route> */}
                <Route path="/viewReportedIssues/pendingIssues" element={<PendingIssues />} ></Route>
                <Route path="/viewReportedIssues/inProgressIssues" element={<InProgressIssues />} ></Route>
                <Route path="/viewReportedIssues/resolvedIssues" element={<ResolvedIssues />} ></Route>

                <Route path="/performanceMonitoring" element={<PerformanceMonitoring />} ></Route>
                <Route path="/newServiceListing" element={<NewServiceListings />} ></Route>
                {/* <Route path="/ratingsAndReviews" element={<RatingsAndReviews />} ></Route> */}
                {/* <Route path="/reviewComplaints" element={<ReviewComplaints />} ></Route> */}

                <Route path="/reviewComplaints/pendingComplaints" element={<PendingComplaints />} ></Route>
                <Route path="/reviewComplaints/inProgressComplaints" element={<InProgressComplaints />} ></Route>
                <Route path="/reviewComplaints/resolvedComplaints" element={<ResolvedComplaints />} ></Route>
            </Routes>
        
    )
}
export default AdminRoutes;