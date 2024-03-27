import React, { useState, SyntheticEvent, useEffect } from "react";
import { auth } from "../firebase";
import { User } from "firebase/auth";
import {
  TYPE_PEER_CHAT,
  TYPE_PEER_DISCONNECT,
  TYPE_PEER_INFO,
  TYPE_REGISTER,
} from "../utils/constants";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  globalMessagesListState,
  globalUserState,
  globalUsersListState,
} from "../recoil/atoms";
type Props = {};

const Chat = (props: Props) => {
  const [messagesList, setMessagesList] = useRecoilState(
    globalMessagesListState
  );
  const [message, setMessage] = useState("");
  const [usersList, setUsersList] = useRecoilState(globalUsersListState);
  const [activeChat, setActiveChat] = useState<Partial<User> | null>(null);
  const globalUser = useRecoilValue(globalUserState);
  const handleLogout = async () => {
    webSocket?.send(
      JSON.stringify({
        type: TYPE_PEER_DISCONNECT,
        id: globalUser?.uid,
        // name: globalUser?.displayName,
      })
    );
    await auth.signOut();
  };
  const [webSocket, setWebSocket] = useState<WebSocket | null>(null);
  // let ws: WebSocket | null = null;

  useEffect(() => {
    let ws = new WebSocket("ws://localhost:8080/chat");
    setWebSocket(ws);
    return () => {
      ws!.onclose = () => console.log("disconnected");
    };
  }, []);
  if (webSocket) {
    webSocket.onopen = () => {
      console.log("connected");
      webSocket?.send(
        JSON.stringify({
          type: TYPE_REGISTER,
          id: globalUser?.uid,
          name: globalUser?.displayName,
        })
      );
    };
    webSocket.onmessage = (msg) => {
      let actualMessage = JSON.parse(msg.data);
      switch (actualMessage.type) {
        case TYPE_PEER_INFO:
          setUsersList([...actualMessage.data]);
          break;
        case TYPE_PEER_CHAT:
          setMessagesList([...messagesList, actualMessage]);
          break;
        default:
          break;
      }
    };
    webSocket.onclose = () => {
      console.log(webSocket, "hello");
    };
  }
  const sendMessage = () => {
    if (webSocket)
      webSocket.send(
        JSON.stringify({
          type: TYPE_PEER_CHAT,
          name: globalUser?.displayName,
          message: message,
          from: globalUser?.uid,
          to: activeChat?.uid,
        })
      );
    setMessage("");
  };
  const handleMessageChange = (e: SyntheticEvent) => {
    setMessage((e.target as HTMLInputElement).value);
  };
  const handleActiveChatChange = (activeUser: Partial<User>) => {
    setActiveChat(activeUser);
  };
  return (
    <div>
      <a onClick={handleLogout} className="cursor-pointer">
        Logout
      </a>
      <h2>Chat</h2>
      <h3>{auth.currentUser?.uid}</h3>
      <h3>{auth.currentUser?.displayName}</h3>
      <div className="grid grid-cols-3 p-10">
        <div className="col-span-1">
          <h1>Should contain the list of contacts or online friends</h1>
          <ul className="">
            {usersList
              .filter((friend) => friend.uid !== globalUser?.uid)
              .map((friend) => (
                <li
                  className={`p-4 border border-4 ${
                    activeChat?.uid === friend.uid ? "border-green-500" : ""
                  } cursor-pointer`}
                  onClick={() => handleActiveChatChange(friend)}
                >
                  {friend.displayName}
                </li>
              ))}
          </ul>
        </div>
        <div className="col-span-2">
          <h1>Should contain the chat</h1>
          {activeChat ? (
            <div>
              <div className="flex flex-col overflow-y-auto max-h-[500px]">
                {messagesList
                  .filter(
                    (msg) =>
                      (msg.from === activeChat?.uid &&
                        msg.to === globalUser?.uid) ||
                      (msg.from === globalUser?.uid &&
                        msg.to === activeChat?.uid)
                  )
                  .map((msg) => (
                    <div
                      className={`flex flex-col p-1 overflow-visible ${
                        msg.from === globalUser?.uid
                          ? "items-end"
                          : "items-start"
                      }`}
                    >
                      <p className="text-xs">
                        {msg.from === globalUser?.uid ? "You" : msg.name}
                      </p>
                      <p className="text-md">{msg.message}</p>
                    </div>
                  ))}
              </div>
              <div>
                <input
                  className="border border-red-300 w-full"
                  onChange={handleMessageChange}
                  value={message}
                />
              </div>
              <button onClick={sendMessage}>Send message</button>
            </div>
          ) : (
            <span>Select a user to view chats</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
