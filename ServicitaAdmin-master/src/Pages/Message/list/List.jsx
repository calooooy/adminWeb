import "./list.css"
import AdminInfo from "./AdminInfo/AdminInfo"
import ChatList from "./ChatList/ChatList"

const List = ({setActiveMessage}) => {

    const setActiveChat = (message) => {
        setActiveMessage(message)
        console.log("Actives Chat: ", message)
    }

    return (
        <div className='list'>
            <AdminInfo/>
            <ChatList setActiveMessage={setActiveChat}/>
        </div>
    )
}

export default List