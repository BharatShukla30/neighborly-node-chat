import React from 'react'
import ChatSection from '../components/ChatSection'
import GroupSection from '../components/GroupSection'


function Main({ socket, username, userId, room }) {
  return (
    <div className="flex item-center justify-center gap-1 w-full h-[90%] mx-auto my-5 ">
      <div className="  w-full mx-auto grid grid-cols-12  ">
        <div className='col-start-2 col-span-4'>
          <GroupSection />
        </div>
        <div className="col-span-6">
          <ChatSection           
              className = ""
              socket={socket}
              username={username}
              userId={userId}
              room={room}
              />
        </div>
      </div>
    </div>
  )
}

export default Main