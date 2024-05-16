import "./chat.css";
import { useState, useEffect, useRef } from "react";
import { getFirestore, collection, getDocs, onSnapshot, doc, deleteDoc, getDoc, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const Chat = ( {message} ) => {


    const [text, setText] = useState("");


    const [messages, setMessages] = useState([]);
    const [image, setImage] = useState({
        file: null,
        url: null
    })
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {

        if (message?.id === undefined) {
            setLoading(false);
            return;
        }

        const db = getFirestore();
        const messagesCollection = collection(db, 'adminChats');
        const q = doc(messagesCollection, message.id);
        const fetchData = async () => {
            try {
                const response = await getDoc(q);
                const data = response.data();
                const sortMessages = data.messages.sort((a, b) => {
                    const timeA = a.createdAt instanceof Date ? a.createdAt : a.createdAt.toDate();
                const timeB = b.createdAt instanceof Date ? b.createdAt : b.createdAt.toDate();
                    return timeA - timeB;
                });
                setMessages(sortMessages);
            } catch (error) {
                console.log("Error getting documents: ", error);
            }
            finally {
                setLoading(false);
            }
        }
        fetchData();

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.data();
            const sortMessages = data.messages.sort((a, b) => {
                const timeA = a.createdAt instanceof Date ? a.createdAt : a.createdAt.toDate();
                const timeB = b.createdAt instanceof Date ? b.createdAt : b.createdAt.toDate();
                    return timeA - timeB;
            });
            setMessages(sortMessages);
        }

        );

        return () => {
            unsubscribe();
        }


    }, [message]);

    const handleImg = async (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            setImage({
                file: file,
                url: reader.result
            });
        }

        let imgUrl = null;

        if (file) {
            const storageRef = ref(getStorage(), `adminChats/${message.id}/${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);
            const snapshot = await uploadTask;
            imgUrl = await getDownloadURL(snapshot.ref);
        } else {
            setImage({
                file: null,
                url: null
            });
            return;
        }
        try {
            setLoading(true);
            const db = getFirestore();
            const messagesCollection = collection(db, 'adminChats');
            const q = doc(messagesCollection, message.id);
            const response = await getDoc(q);
            const data = response.data();
            const messages = data.messages;

            const newMessage = {
                _id: `${message.id}_${new Date().getTime()}_${message.usersId.admin}`,
                user: {
                    _id: message.usersId.admin,
                },
                image: imgUrl,
                createdAt: new Date(),
                text: '',
            };

            const newMessages = [...messages, newMessage];

            const sortMessages = newMessages.sort((a, b) => {
                const timeA = a.createdAt instanceof Date ? a.createdAt : a.createdAt.toDate();
                const timeB = b.createdAt instanceof Date ? b.createdAt : b.createdAt.toDate();
                return timeB - timeA;
            });

            const lastMessageTime = sortMessages[0].createdAt;

           

            await setDoc(q, { messages: sortMessages, lastMessageTime: lastMessageTime }, { merge: true });

            const sortMessages2 = newMessages.sort((a, b) => {
                const timeA = a.createdAt instanceof Date ? a.createdAt : a.createdAt.toDate();
                const timeB = b.createdAt instanceof Date ? b.createdAt : b.createdAt.toDate();
                return timeA - timeB;
            });

            setMessages(sortMessages2);

            setImage({
                file: null,
                url: null
            });

        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setLoading(false);
        }
    }

    const bottomRef = useRef(null);

    const formatTimeStamps = (time) => {
        if (time instanceof Date) {
    
            return `${time.toLocaleDateString()} ${time.toLocaleTimeString()}`;
        } else if (time && typeof time.toMillis === 'function') {
 
            const date = new Date(time.toMillis());
            return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        } else {

            return '';
        }
    };
    

    const handleSendMessage = async () => {
        const finalText = text;
    
        setText('');

    
        try {

            

            const db = getFirestore();
            const messagesCollection = collection(db, 'adminChats');
            const q = doc(messagesCollection, message.id);
            const response = await getDoc(q);
            const data = response.data();
            const messages = data.messages;
            const newMessage = {
                _id: `${message.id}_${new Date().getTime()}_${message.usersId.admin}`,
                user: {
                    _id: message.usersId.admin,
                },
                text: finalText,
                createdAt: new Date(),
            };
            const newMessages = [...messages, newMessage];
    
            const sortMessages = newMessages.sort((a, b) => {
                const timeA = a.createdAt instanceof Date ? a.createdAt : a.createdAt.toDate();
                const timeB = b.createdAt instanceof Date ? b.createdAt : b.createdAt.toDate();
                return timeB - timeA;
            });            
            
            const lastMessageTime = sortMessages[0].createdAt;

            console.log("Sorted Messages:", sortMessages); // Log sorted messages array
    
            await setDoc(q, { messages: sortMessages, lastMessageTime: lastMessageTime }, { merge: true });
            const sortMessages2 = newMessages.sort((a, b) => {
                const timeA = a.createdAt instanceof Date ? a.createdAt : a.createdAt.toDate();
                const timeB = b.createdAt instanceof Date ? b.createdAt : b.createdAt.toDate();
                return timeA - timeB;
            });

            setMessages(sortMessages2);
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };
    
    

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    return (
        <div className='chat'>
            {loading === false ? messages.length > 0 ?
            <>
            <div className="top">
                <div className="user">
                    <img src={message.usersImage.user} alt="Avatar" />
                    <div className="texts">
                        <span>{message.usersFullName.user}</span>
                        {/* <p>service provider</p> */}
                    </div>
                </div>
                <div className="icons">
                    {/* <img src="../message_assets/phone.png" alt="Phone Icon" />
                    <img src="../message_assets/video.png" alt="Video Icon" /> */}
                    <img src="../message_assets/info.png" alt="Info Icon" />
                </div>
            </div>
            <div className="center">
                {messages.map(msg => (
                    <div className={`message ${msg.user._id === message.usersId.admin ? 'own' : ''}`} key={msg.id}>
                        {msg.user._id !== message.usersId.admin && <img src={message.usersImage.user} alt="Avatar" />}
                        
                        {msg.image ? (
            <div className="img-text-container">
                <div className={`img ${msg.user._id === message.usersId.admin ? 'own' : ''}`}>
                    <img src={msg.image} alt="Image" />
                </div>
                <div className="texts">
                    <span>{formatTimeStamps(msg.createdAt)}</span>
                </div>
            </div>
                       
                        ) :   <div className="texts">
                                <p>{msg.text}</p>
                                <span>{formatTimeStamps(msg.createdAt)}</span>
                            </div>  
                        }

             
                      
                    </div>
                ))}
                <div ref={bottomRef}></div>
            </div>
            <div className="bottom">
                <div className="icons">
                    <label htmlFor="file">
                    <img src="../message_assets/img.png" alt="" />
                    </label>
                    <input type="file" id="file" accept="image/*" onChange={handleImg} style={{ display: 'none' }} />
                </div>
                
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyPress={handleKeyPress}
                />
                {/* <div className="emoji">
                    <img src="../message_assets/emoji.png" alt="Emoji Icon" onClick={() => setOpen(prev => !prev)} />
                    {open && (
                        <div className="picker">
                            <EmojiPicker onEmojiClick={handleEmoji} style={{ width: '250px', height: '350px' }} />
                        </div>
                    )}
                </div> */}
                <button className={`sendButton ${!text ? 'disabled' : ''}`} onClick={handleSendMessage} disabled={!text}>Send</button>

            </div>
            </> :
            null
           :
            null
            }

        </div>
    );
};

export default Chat;
