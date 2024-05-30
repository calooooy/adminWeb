import { Badge, Space, Dropdown, Menu, Popover, List } from "antd";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Axios from 'axios';
import '../AdminHeader/adminHeader.css';
import { BellOutlined, } from '@ant-design/icons';

function AdminHeader({ onLogout }) {
    const [username, setUsername] = useState(localStorage.getItem('adminNickname'));
    const location = useLocation();
    const [notificationVisible, setNotificationVisible] = useState(false);
    const [notificationsViewed, setNotificationsViewed] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const userId = '66111acbea0491231d30d8a7';
                if (!userId) {
                    console.log('User ID not found.');
                    setIsLoading(false);
                    return;
                }

                const response = await Axios.get(`http://172.16.4.26:5000/notifications/getNotifications/${userId}`);
                const notificationsData = response.data.data;

                const notificationInfoData = [];

                for (const notification of notificationsData) {
                    const otherUserResponse = await Axios.get(`http://172.16.4.26:5000/admin/getUser/${notification.otherUserId}`);
                    const otherProfileImage = otherUserResponse.data.data.profileImage;

                    notificationInfoData.push({
                        id: notification.id,
                        title: notification.title,
                        message: notification.message,
                        createdAt: notification.createdAt,
                        otherUserIcon: otherProfileImage,
                    });
                }

                setNotifications(notificationInfoData);

            } catch (error) {
                console.error('Error fetching notifications:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    const getImagePath = (imageName) => {
        return '/' + imageName;
    };

    const sortedNotifications = notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const notificationContent = (
        <div style={{ width: '300px', maxWidth: '300px', maxHeight: '50vh', overflowY: 'auto' }}>
            <List
                dataSource={sortedNotifications}
                renderItem={item => (
                    <List.Item className="list-item">
                        <List.Item.Meta
                            avatar={<img src={item.otherUserIcon} alt="Icon" style={{ width: '50px', height: '50px', padding: '3px', marginLeft: '10px', marginRight: '0px', borderRadius: '50%' }} />}
                            title={<b>{item.title}</b>}
                            description={<>
                                <div style={{ fontSize: '12px', color: 'black' }}>{item.message}</div>
                                <div style={{ fontSize: '9px', color: 'gray' }}>{new Date(item.createdAt).toLocaleString()}</div>
                            </>}
                        />
                    </List.Item>
                )}
            />
        </div>
    );

    return (
        <div className="AdminHeader">
            <div style={{display: 'flex', alignItems: 'center'}}>
                <img src={getImagePath("side-logo.png")} alt="Logo" style={{ width: '100%', height: '100%' }} />
                <a className="headerTitle">Servicita</a>
            </div>
            
            <div className="icons-container">
                {/* <div className="userNameDisplay">
                    Hello, {username}!
                </div> */}
                <div style={{ paddingRight: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', }}>
                    <Space>
                        <Popover
                            content={notificationContent}
                            title="Notifications"
                            trigger="click"
                            visible={notificationVisible}
                            onVisibleChange={(visible) => {
                                setNotificationVisible(visible);
                                if (visible) {
                                    setNotificationsViewed(true);
                                }
                            }}
                        >
                            <Badge count={notificationsViewed ? 0 : sortedNotifications.length}>
                                <div className="notifbadge">
                                    <BellOutlined style={{fontSize:'30px'}} />
                                </div>
                            </Badge>
                        </Popover>
                        <Badge>
                            <div className="notifbadge" style={{ borderRadius:'50%', width:'55px', height: '55px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop:'12px', marginLeft: '10px'}}>
                                <Dropdown overlay={<Menu>
                                    <Menu.Item key="logout" onClick={onLogout}>Logout</Menu.Item>
                                    </Menu>} trigger={['click']}>
                                    <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
                                        <img src={getImagePath("admin profile.png")} alt="Profile" style={{ width: '55px',  borderRadius: '50%', objectFit: 'cover' }} />
                                    </a>
                                </Dropdown>
                            </div>
                        </Badge>
                    </Space>
                </div>
            </div>
        </div>
    );
}

export default AdminHeader;
