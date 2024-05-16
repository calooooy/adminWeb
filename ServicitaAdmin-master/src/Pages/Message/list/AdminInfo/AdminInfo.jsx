import "./adminInfo.css"

const AdminInfo = () => {
    return (
        <div className='adminInfo'>
            <div className="admin">
                <img src="../public/adt-logo.png" alt="wtf" />
                <h2>{localStorage.getItem('adminName')}</h2>
            </div>
            <div className="icon">
                {/* <img src="../message_assets/more.png" alt=""/>
                <img src="../message_assets/video.png" alt=""/> */}
                {/* <img src="../message_assets/edit.png" alt=""/> */}
            </div>
        </div>
    )
}

export default AdminInfo