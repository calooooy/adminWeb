import { useState } from 'react';
import '../../Admin.css';
import List from './list/List'
import Chat from './chat/Chat'


function Message() {

	const [finalActiveChat, setFinalActiveChat] = useState(null)

	const setActiveChat = (message) => {
		setFinalActiveChat(message)
		console.log("Active Chat: ", message)
	}

	return (
		<div style={{ width: '100%' }}>
			<h1 className='DashboardHeader'>Message</h1>
			<hr className='Divider' style={{ width: '100%' }} />

            <div className='message-container'>
                <List setActiveMessage={setActiveChat}/>
				{finalActiveChat !== null ? (
                    <Chat message={finalActiveChat} />
                ) : (
                    <Chat message={{}} />
                )}
            </div>
		</div>
	);
}



export default Message;

