package main

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

const (
	TYPE_REGISTER        = "REGISTER"
	TYPE_PEER_INFO       = "PEER_INFO"
	TYPE_PEER_CHAT       = "PEER_CHAT"
	TYPE_PEER_DISCONNECT = "PEER_DISCONNECT"
	TYPE_GROUP_CHAT      = "GROUP_CHAT"
	TYPE_GROUP_ADD       = "GROUP_ADD"
	TYPE_GROUP_LEAVE     = "GROUP_LEAVE"
	TYPE_GROUP_CREATE    = "GROUP_CREATE"
)

type ChatMessage struct {
	Type    string `json:"type"`
	Id      string `json:"id"`
	Name    string `json:"name"`
	Message string `json:"message"`
	From    string `json:"from"`
	To      string `json:"to"`
}

type User struct {
	Uid         string `json:"uid"`
	DisplayName string `json:"displayName"`
}

var userIdSessionMap = make(map[string]*websocket.Conn)
var upgrader = websocket.Upgrader{}

func main() {

	http.HandleFunc("/chat", func(w http.ResponseWriter, r *http.Request) {
		upgrader.CheckOrigin = func(r *http.Request) bool { return true }
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Println("upgrade failed", err)
			return
		}
		defer conn.Close()

		for {

			mt, message, err := conn.ReadMessage()
			if err != nil {
				log.Println("read failed: ", err)
				return
			}
			var chatMessage ChatMessage
			json.Unmarshal(message, &chatMessage)
			log.Println(chatMessage)
			switch chatMessage.Type {
			case TYPE_REGISTER:
				handleRegisterMessage(mt, chatMessage, conn)
			case TYPE_PEER_CHAT:
				handlePeerChatMessage(mt, chatMessage, conn)
			case TYPE_PEER_DISCONNECT:
				handleDisconnectMessage(mt, chatMessage)
			default:
				log.Println("default case")
			}

		}
	})
	http.ListenAndServe(":8080", nil)
}

func handleRegisterMessage(mt int, chatMessage ChatMessage, session *websocket.Conn) {
	log.Printf("registering %v\n", chatMessage.Name)
	userIdSessionMap[chatMessage.Id] = session
	var keys []string
	for k := range userIdSessionMap {
		if chatMessage.From != k {
			keys = append(keys, k)
		}
	}
	var jsonData, _ = json.Marshal(keys)
	log.Println("map ", userIdSessionMap, len(keys), len(userIdSessionMap))
	session.WriteMessage(mt, jsonData)
}

func handlePeerChatMessage(mt int, chatMessage ChatMessage, session *websocket.Conn) {
	log.Printf("Sending peer msg from %v to %v\n", chatMessage.From, chatMessage.To)
	var jsonData, _ = json.Marshal(chatMessage)
	if userIdSessionMap[chatMessage.To] != nil {
		session := userIdSessionMap[chatMessage.To]
		err := session.WriteMessage(mt, jsonData)
		if err != nil {
			log.Println("faceing error in peer chat", err)
		}
	}
	session.WriteMessage(mt, jsonData)
}

func handleDisconnectMessage(mt int, chatMessage ChatMessage) {
	userIdSessionMap[chatMessage.From] = nil
	delete(userIdSessionMap, chatMessage.From)
	var keys []string
	for k := range userIdSessionMap {
		if chatMessage.From != k {
			keys = append(keys, k)
		}
	}
	var jsonData, _ = json.Marshal(keys)
	for k := range userIdSessionMap {
		if userIdSessionMap[k] != nil {
			userIdSessionMap[k].WriteMessage(mt, jsonData)
		}
	}
}

// func broadcast(mt int, messageType string, chatMessage Object) {
// 	log.Println("In broadcast with " + messageType + "  " + chatMessage)
// 	try {
// 		for (User user : userSet) {
// 			WebSocketSession userSession = userIdSessionMap.get(user.getUid());
// 			if (userSession != null && userSession.isOpen()) {
// 				userSession.sendMessage(new TextMessage(objectMapper.writeValueAsBytes(new MessageWrapper(messageType, chatMessage))));
// 			}
// 		}
// 	} catch (IOException e) {
// 		log.error("Error occurred during broadcast: ", e);
// 	}
// }
