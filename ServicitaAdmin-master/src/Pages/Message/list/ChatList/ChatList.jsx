import "./chatList.css"
import { getFirestore, collection, getDocs, onSnapshot, where, doc, deleteDoc, getDoc, query } from 'firebase/firestore';
import Axios from 'axios';
import { useEffect, useState } from 'react';
import { Spin } from "antd";


const ChatList = ({ setActiveMessage }) => {

    const [messages, setMessages] = useState([]);
    // const [messages, setMessages] = useState([
    //     {
    //         id: 1,
    //         userName: "Carl Wyndel",
    //         lastMessage: "HAHAAHAHHAHAHA",
    //         userImage: "https://firebasestorage.googleapis.com/v0/b/servicita-signin-fa66f.appspot.com/o/CMSC%20128%201.png?alt=media&token=84ee6b35-73ff-4667-9720-53f2a40490a3",
    //         selected: false,
    //         createdAt: new Date()
    //     },
    //     {
    //         id: 2,
    //         userName: "Leah Tenebroso",
    //         lastMessage: "Personality: Black Cat",
    //         userImage: "../message_assets/avatar.png",
    //         selected: false,
    //         createdAt: new Date() + 1
    //     },
    //     {
    //         id: 3,
    //         userName: "Kent John Dico",
    //         lastMessage: "Research Topic: Attendance using IP",
    //         userImage: "../message_assets/avatar.png",
    //         selected: false,
    //         createdAt: new Date() + 3
    //     },
    //     {
    //         id: 4,
    //         userName: "Mga Manifesters",
    //         lastMessage: "Looorrrd tabaaaanng",
    //         userImage: "../message_assets/avatar.png",
    //         selected: false,
    //         createdAt: new Date() + 4
    //     },
    //     {
    //         id: 5,
    //         userName: "Nel Obrero",
    //         lastMessage: "umaalog alog",
    //         userImage: "../message_assets/avatar.png",
    //         selected: false,
    //         createdAt: new Date() + 5
    //     },
    //     {
    //         id: 6,
    //         userName: "ANTI-DEL TECH",
    //         lastMessage: "Daniel: paabli ko pultahan bai",
    //         userImage: "../message_assets/avatar.png",
    //         selected: false,
    //         createdAt: new Date() + 6
    //     },
    //     {
    //         id: 7,
    //         userName: "Daniel ALexis Cruz",
    //         lastMessage: "send card number nimo bai",
    //         userImage: "../message_assets/avatar.png",
    //         selected: false,
    //         createdAt: new Date() + 2
    //     },

    // ]);
    

    const [loading, setLoading] = useState(true);

    const handleChatClick = (message) => {
        setActiveMessage(message);
        const newMessages = messages.map((msg) => ({
            ...msg,
            selected: msg.id === message.id,
        }));
        setMessages(newMessages);
    };


    useEffect(() => {
        async function fetchData() {
            try {
                const response = await Axios.get(`http://172.16.4.26:5000/admin/getAdmin/${localStorage.getItem('adminId')}`);
                const db = getFirestore();
                const chatRef = collection(db, 'adminChats');
                const q = query(chatRef, where('users', 'array-contains', response.data.data._id));
                const querySnapshot = await getDocs(q);
                const chatDocs = querySnapshot.docs.map((doc) => ({ id: doc.id, selected: false, ...doc.data() }));
                const sortedChat = chatDocs.sort((a, b) =>{
                    const timeA = a.lastMessageTime instanceof Date ? a.lastMessageTime : a.lastMessageTime.toDate();
                    const timeB = b.lastMessageTime instanceof Date ? b.lastMessageTime : b.lastMessageTime.toDate();
                    return timeB - timeA;
                });
                
                setActiveMessage(sortedChat[0]);
                const updatedMessages = sortedChat.map((msg, index) => ({
                    ...msg,
                    selected: index === 0,
                }));
                setMessages(updatedMessages);
            } catch (error) {
            console.log("Error getting documents: ", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();

        const unsubscribe = onSnapshot(collection(getFirestore(), "adminChats"), (snapshot) => {
            const chatDocs = snapshot.docs.map((doc) => ({ id: doc.id, selected: false, ...doc.data() }));
            const sortedChat = chatDocs.sort((a, b) =>{
                const timeA = a.lastMessageTime instanceof Date ? a.lastMessageTime : a.lastMessageTime.toDate();
                const timeB = b.lastMessageTime instanceof Date ? b.lastMessageTime : b.lastMessageTime.toDate();
                return timeB - timeA;
            });
            setMessages(sortedChat);
        }
        );

        return () => unsubscribe();
    }, []);

    return (



        <div className='chatList'>

            {/* No search if no messages */}

            { messages.length > 0 &&
            <div className='search'>
                <div className="searchBar">
                    <img src="../message_assets/search.png" alt="" />
                    <input type="text" placeholder="Search..." />
                </div>
            </div>
            }
    
        {loading === false ? messages.length > 0 ?
            <>
            
           {messages.map((message) => (
            <div
                className={`item ${message.selected === true ? "selected" : ""}`}
                key={message.id}
                onClick={() => handleChatClick(message)}
            >
                <img src={message.usersImage.user} alt="User Avatar" />
                <div className="texts">
                    <span>{message.usersFullName.user}</span>
                    <p>{message.messages && message.messages.length > 0 ? message.messages[0].user._id === localStorage.getItem('adminId') ? message.messages[0].video ? 'You sent a video' : message.messages[0].image ? 'You sent an image' : `You: ${message.messages[0].text}` : message.messages[0].video ? 'Sent a video' : message.messages[0].image ? 'Sent an image' : message.messages[0].text : 'You are now connected!'}</p>
                </div>
            </div>
        ))} 
            </>
            :
            <div className="noChat">
                {/* <img src="../message_assets/empty.png" alt="" /> */}
                <p>No messages yet</p>
            </div>
            :
            <>
            <div className="spinner">
                <Spin />
            </div>
                </>
        }

        
        </div>
    )
}

export default ChatList