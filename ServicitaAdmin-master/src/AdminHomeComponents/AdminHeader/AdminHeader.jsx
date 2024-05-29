import { Badge, Space, Dropdown, Menu, Popover, List } from "antd";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import '../AdminHeader/adminHeader.css'

function AdminHeader({ onLogout }) {
    const [username, setUsername] = useState(localStorage.getItem('adminNickname'));
    const location = useLocation();
    const [notificationVisible, setNotificationVisible] = useState(false);
    const [notificationsViewed, setNotificationsViewed] = useState(false);

    const getImagePath = (imageName) => {
        return '/' + imageName;
    };

    const notifications = [
        { title: "New Service for Approval", message: "A new service has been added: Nel's Home Salon", time: "2024-05-30T12:00:00Z" },
        { title: "New Complaint to Review", message: "*message format for report*", time: "2024-05-30T11:00:00Z" },
        { title: "Notification Title 3", message: "This is a sample notification message 3", time: "2024-05-30T10:00:00Z" },
        { title: "Notification Title 4", message: "This is a sample notification message 4", time: "2024-05-30T09:00:00Z" },
        { title: "Notification Title 5", message: "This is a sample notification message 5", time: "2024-05-30T08:00:00Z" },
        { title: "Notification Title 6", message: "This is a sample notification message 6", time: "2024-05-30T07:00:00Z" },
        { title: "Notification Title 7", message: "This is a sample notification message 7", time: "2024-05-30T06:00:00Z" },
        { title: "Notification Title 8", message: "This is a sample notification message 8", time: "2024-05-30T05:00:00Z" },
        { title: "Notification Title 9", message: "This is a sample notification message 9", time: "2024-05-30T07:00:00Z" },
        { title: "Notification Title 10", message: "This is a sample notification message 10", time: "2024-05-30T03:00:00Z" },
    ].sort((a, b) => new Date(b.time) - new Date(a.time)); // Sort by latest time

    const notificationContent = (
        <div style={{ width: '20vw', maxWidth: '300px', maxHeight: '50vh', overflowY: 'auto' }}>
            <List
                dataSource={notifications}
                renderItem={item => (
                    <List.Item className="list-item">
                        <List.Item.Meta
                            avatar={<img src={getImagePath("admin profile.png")} alt="Icon" style={{ width: '50px', padding: '5px', marginLeft:'10px', marginRight: '0px',borderRadius:'50%' }} />}
                            title={<b>{item.title}</b>}
                            description={<>
                                <div style={{ fontSize: '12px', color: 'black' }}>{item.message}</div>
                                <div style={{ fontSize: '10px', color: 'gray' }}>{new Date(item.time).toLocaleString()}</div>
                            </>}
                        />
                    </List.Item>
                )}
            />
        </div>
    );

    return (
        <div className="AdminHeader">
            <div>
                <img src={getImagePath("side-logo.png")} alt="Logo"></img>
            </div>
            {/* <img src={getImagePath("side-logo.png")} alt="Logo" /> */}
            <a className="headerTitle">Servicita</a>
            <div className="icons-container">
                <div className="userNameDisplay">
                    Hello, {username}!
                </div>
                <div style={{paddingRight:'10px', display:'flex', justifyContent:'center', alignItems:'center', marginTop:'12px'}}>
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
                        <Badge count={notificationsViewed ? 0 : notifications.length} dot>
                            <img
                                src={getImagePath("notif.png")}
                                alt="Notification"
                                style={{ width: '100%', height: '100%' }}
                            />
                        </Badge>
                    </Popover>
                    {/* <Badge count={10} dot>
                        <img src={getImagePath("msg.png")} alt="Message" style={{ width: '100%', height: '100%' }} />
                    </Badge> */}
                    <Badge>
                        <Dropdown overlay={<Menu>
                            <Menu.Item key="logout" onClick={onLogout}>Logout</Menu.Item>
                        </Menu>} trigger={['click']}>
                            <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
                                <img src={getImagePath("admin profile.png")} alt="Profile" style={{ width: '55px', marginLeft: '5px', marginRight: '30px', borderRadius:'50%', objectFit: 'cover' }} />
                            </a>
                        </Dropdown>
                    </Badge>
                </Space>
                </div>
            </div>
        </div>
    );
}

export default AdminHeader;
