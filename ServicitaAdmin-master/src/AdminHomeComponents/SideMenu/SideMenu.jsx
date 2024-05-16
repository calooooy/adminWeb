import { Menu } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import {
  DashboardOutlined,
  UserOutlined,
  ContainerOutlined,
  TeamOutlined,
  UsergroupDeleteOutlined,
  FileAddOutlined,
  StarOutlined,
  FrownOutlined,
  MessageOutlined
} from '@ant-design/icons';
import { useEffect, useState } from "react";

function SideMenu() {
  const location = useLocation()
  const [selectedKeys, setSelectedKeys] = useState('/')

  useEffect(() => {
    const pathName = location.pathname
    setSelectedKeys(pathName)

  }, [location.pathname])

  const navigate = useNavigate()

  return <div className="SideMenu">
    <Menu
      className="SideMenuVertical"
      mode="inline"
      onClick={(item) => {
        navigate(item.key);
      }}
      selectedKeys={[selectedKeys]}
      items={[
        { label: "Dashboard", icon: <DashboardOutlined style={{ fontSize: '20px' }} />, key: "/home/dashboard" },
        { label: "Message", icon: <MessageOutlined style={{ fontSize: '20px' }} />, key: "/home/message" },
        {
          label: "User Management", icon: <UserOutlined style={{ fontSize: '20px' }} />, key: "/home/userManagement", children: [
            { label: "View Service Seeker List", icon: <TeamOutlined style={{ fontSize: '20px' }} />, key: "/home/viewSeekerList" },
            { label: "View Service Provider List", icon: <UsergroupDeleteOutlined style={{ fontSize: '20px' }} />, key: "/home/viewProviderList" }
          ]
        },
        // {
        //   label: "Service Provider Performance", key: "/home/serviceProviderPerformance", children: [
        //     { label: "Performance Monitoring", key: "/home/performanceMonitoring" },
        //     { label: "Review Complaints", key: "/home/reviewComplaints" }
        //   ]
        // },
        {
          label: "Content Moderation", icon: <ContainerOutlined style={{ fontSize: '20px' }} />, key: "/home/contentModeration", children: [
            { label: "New Service Listing", icon: <FileAddOutlined style={{ fontSize: '20px' }} />, key: "/home/newServiceListing" },
            // { label: "Ratings and Reviews", icon: <StarOutlined style={{ fontSize: '20px' }} />, key: "/home/ratingsAndReviews" },
            { label: "Review Complaints", icon: <FrownOutlined style={{ fontSize: '20px' }} />, key: "/home/reviewComplaints", children: [
              { label: "Pending Complaints", key: "/home/reviewComplaints/pendingComplaints" },
              { label: "In Progress Complaints", key: "/home/reviewComplaints/inProgressComplaints"},
              { label: "Resolved Complaints", key: "/home/reviewComplaints/resolvedComplaints"}
            ]}
          ]
        }
      ]}></Menu>

  </div>
}
export default SideMenu;