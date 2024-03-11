import React, { useCallback, useMemo, useState } from "react"
import ScrollToBottom from "react-scroll-to-bottom"
import { FaCircleUser } from "react-icons/fa6"
import {useDropzone} from 'react-dropzone'
import * as LR from '@uploadcare/blocks';
import blocksStyles from '@uploadcare/blocks/web/lr-file-uploader-regular.min.css?url';

LR.registerBlocks(LR);

function Chat({ socket, username, userId, room }) {
  const [currentMessage, setCurrentMessage] = useState("")
  const [messageList, setMessageList] = useState([])
 
  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        group_id: room,
        senderId: userId,
        senderName: username,
        msg: currentMessage,
        time: new Date(Date.now()),
      }

      await socket.emit("send-message", messageData)
      setMessageList((list) => [...list, messageData])
      setCurrentMessage("")
    }
  }

  useMemo(() => {
    socket.on("receive_message", (data) => {
      data.time = new Date(data.time)
      setMessageList((list) => [...list, data])
    })
  }, [socket])

  return (
    <div className=" h-full w-full outline outline-1 outline-offset-2     border-x-slate-600 rounded-md outline-slate-800 shadow-lg shadow-indigo-500/40 p-10">
      <div className="text-center pointer-events-none">
        <p className="pointer-events-none text-gray-600 text-md ">Live Chat</p>
      </div>
      <div className="chat-body   flex flex-col items-start  rounded-t   w-full h-[90%]">
        <ScrollToBottom className="w-full container">

      {/* TODO: remove below later */}
            <div
                class="flex item-start gap-2.5 my-4  w-full item-center  "
              >
                <FaCircleUser className="w-8 h-8 rounded-full text-blue-600" />
                <div class="flex justify-between items-center w-full leading-1.5 ">
                  <p class="text-sm font-normal py-2.5 px-4 text-left bg-blue-400 text-white border-gray-200 backdrop-blur-md rounded-e-xl rounded-es-xl  backdrop-brightness-125 shadow-md  ">
                    Simpsons adfadfkvj
                  </p>
                  <p class="text-sm ">
                    <span class="text-sm pr-3 font-normal text-gray-500 dark:text-gray-400 text-right">
                            11.45
                    </span>
                  </p>
                </div>
                  
            </div>

          {messageList.map((messageContent) => {
            return (
              <div
                class="flex items-start gap-2.5 my-4  w-full items-center  "
                key={messageContent.date}
              >
                <FaCircleUser className="w-8 h-8 rounded-full text-white" />
                <div class="flex justify-between items-center w-full leading-1.5 ">
                  <p class="text-sm font-normal py-2.5 px-4 text-left bg-blue-400 text-white border-gray-200 backdrop-blur-md rounded-e-xl rounded-es-xl  backdrop-brightness-125 shadow-lg  ">
                    {messageContent.msg}
                  </p>
                  <p class="text-sm ">
                    <span class="text-sm pr-3 font-normal text-gray-500 dark:text-gray-400 text-right">
                      {new Date(messageContent.time).getHours()}:
                      {new Date(messageContent.time).getMinutes()}
                    </span>
                  </p>
                </div>
                  
              </div>
            )
          })}
        </ScrollToBottom>
      </div>
      {/* <div className="chat-footer">
        <input
          type="text"
          value={currentMessage}
          placeholder="Hey..."
          onChange={(event) => {
            setCurrentMessage(event.target.value);
          }}
          onKeyDown={(event) => {
            event.key === "Enter" && sendMessage();
          }}
        />
        <button onClick={sendMessage}>&#9658;</button>
      </div> */}

      <form >
        <label for="chat" class="sr-only">
          Your message
        </label>
        <div class="flex items-center px-3 py-2 rounded-lg transparent"  >
          <button
            type="button"
            class=" inline-flex rounded-full justify-center p-2 text-gray-500  cursor-pointer "
          >
          <lr-file-uploader-regular
            css-src="https://cdn.jsdelivr.net/npm/@uploadcare/blocks@0.32.4/web/lr-file-uploader-regular.min.css"
            ctx-name="my-uploader"
            class="my-config"
          >
          </lr-file-uploader-regular>

          </button>


          <input
            type="text"
            value={currentMessage}
            onChange={(event) => {
              setCurrentMessage(event.target.value)
            }}
            id="chat"
            class="overflow-auto resize-none block mx-4 p-2.5 w-full text-sm bg-white text-gray-800 rounded-full border border-gray-300 focus:ring-blue-500 focus:border-blue-500 "
            placeholder="Your message..."
            onKeyDown={(event) => {
              event.key === "Enter" && sendMessage();
            }}
          ></input>
          
          <button
            type="submit"
            onClick={sendMessage}
            class="inline-flex justify-center p-2 bg-blue-500 p-3 text-white rounded-full cursor-pointer hover:bg-blue-100"
          >
            <svg
              class="w-5 h-5 rotate-90 rtl:-rotate-90"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 18 20"
            >
              <path d="m17.914 18.594-8-18a1 1 0 0 0-1.828 0l-8 18a1 1 0 0 0 1.157 1.376L8 18.281V9a1 1 0 0 1 2 0v9.281l6.758 1.689a1 1 0 0 0 1.156-1.376Z" />
            </svg>
            <span class="sr-only">Send message</span>
          </button>
        </div>
      </form>
    </div>
  )
}

export default Chat
