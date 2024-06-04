import "./chatList.css";
import { getFirestore, collection, getDocs, onSnapshot, where, query } from 'firebase/firestore';
import Axios from 'axios';
import { useEffect, useState } from 'react';
import { Spin } from "antd";

const ChatList = ({ setActiveMessage }) => {
    const [messages, setMessages] = useState([]);
    const [filteredMessages, setFilteredMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [active, setActive] = useState({});

    const handleChatClick = (message) => {
        setLoading(true);
        setActiveMessage(message);
        setActive(message);
    
        setMessages(prevMessages => {
            const newMessages = prevMessages.map((msg) => ({
                ...msg,
                selected: msg.id === message.id,
            }));
            setFilteredMessages(newMessages);
            return newMessages;
        });
    
        setLoading(false);
    };
    

    const handleSearchChange = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);
        const filtered = messages.filter((message) =>
            message.usersFullName.user.toLowerCase().includes(query)
        );
        setFilteredMessages(filtered);
    };

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await Axios.get(`https://192.168.1.4:5001/admin/getAdmin/${localStorage.getItem('adminId')}`);
                const db = getFirestore();
                const chatRef = collection(db, 'adminChats');
                const q = query(chatRef, where('users', 'array-contains', response.data.data._id));
                const querySnapshot = await getDocs(q);
                const chatDocs = querySnapshot.docs.map((doc) => ({ id: doc.id, selected: false, ...doc.data() }));
                const sortedChat = chatDocs.sort((a, b) => {
                    const timeA = a.lastMessageTime instanceof Date ? a.lastMessageTime : a.lastMessageTime.toDate();
                    const timeB = b.lastMessageTime instanceof Date ? b.lastMessageTime : b.lastMessageTime.toDate();
                    return timeB - timeA;
                });
                setActive(sortedChat[0]);
                setActiveMessage(sortedChat[0]);
                const updatedMessages = sortedChat.map((msg, index) => ({
                    ...msg,
                    selected: index === 0,
                }));
                setMessages(updatedMessages);
                setFilteredMessages(updatedMessages);
            } catch (error) {
                console.log("Error getting documents: ", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();

        const unsubscribe = onSnapshot(collection(getFirestore(), "adminChats"), (snapshot) => {
            const chatDocs = snapshot.docs.map((doc) => ({ id: doc.id, selected: false, ...doc.data() }));
            const sortedChat = chatDocs.sort((a, b) => {
                const timeA = a.lastMessageTime instanceof Date ? a.lastMessageTime : a.lastMessageTime.toDate();
                const timeB = b.lastMessageTime instanceof Date ? b.lastMessageTime : b.lastMessageTime.toDate();
                return timeB - timeA;
            });
            setMessages(sortedChat);
            setFilteredMessages(sortedChat);
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className='chatList'>
            {messages.length > 0 && (
                <div className='search'>
                    <div className="searchBar">
                        <img src="../message_assets/search.png" alt="Search" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                        />
                    </div>
                </div>
            )}

            {loading ? (
                <div className="spinner">
                    <Spin />
                </div>
            ) : filteredMessages.length > 0 ? (
                filteredMessages.map((message) => (
                    <div
                        className={`item ${message.selected ? "selected" : ""}`}
                        key={message.id}
                        onClick={() => handleChatClick(message)}
                    >
                        <img src={message.usersImage.user} alt="User Avatar" />
                        <div className="texts">
                            <span>{message.usersFullName.user}</span>
                            <p>
                                {message.messages && message.messages.length > 0
                                    ? message.messages[0].user._id === localStorage.getItem('adminId')
                                        ? message.messages[0].video
                                            ? 'You sent a video'
                                            : message.messages[0].image
                                            ? 'You sent an image'
                                            : `You: ${message.messages[0].text}`
                                        : message.messages[0].video
                                        ? 'Sent a video'
                                        : message.messages[0].image
                                        ? 'Sent an image'
                                        : message.messages[0].text
                                    : 'You are now connected!'}
                            </p>
                        </div>
                    </div>
                ))
            ) : (
                <div className="noChat" style={{height:'auto'}}>
                    <p>No messages yet</p>
                </div>
            )}
        </div>
    );
};

export default ChatList;