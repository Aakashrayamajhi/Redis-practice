import React, { useEffect, useState, useRef } from "react";
import { Video, Phone, Search, MoreVertical, Plus, Image, Paperclip, Smile } from "lucide-react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import "./chat.css";

const socket = io("http://localhost:3000");

const Chat = () => {
    const { id } = useParams();
    const [user, setUser] = useState({});
    const [msg, setMsg] = useState("");
    const [messages, setMessages] = useState([]);
    const messagesEndRef = useRef(null);

    const currentUserId = localStorage.getItem("userId") || "me";

    useEffect(() => {
        const fetchUser = async () => {
            const res = await fetch(`http://localhost:3000/profile/${id}`, {
                credentials: "include",
            });
            const data = await res.json();
            setUser(data);
        };
        if (id) fetchUser();
    }, [id]);

    useEffect(() => {
        const fetchHistory = async () => {
            const res = await fetch(
                `http://localhost:3000/message/history/${id}?currentUserId=${currentUserId}`,
                { credentials: "include" }
            );
            const data = await res.json();
            setMessages(
                data.map((m) => ({ msg: m.content, senderId: m.sender }))
            );
        };
        if (id) fetchHistory();
    }, [id, currentUserId]);

    useEffect(() => {
        socket.emit("register", { userId: currentUserId });
    }, [currentUserId]);

    useEffect(() => {
        const handler = (data) => {
            if (data.senderId !== currentUserId) {
                setMessages((prev) => [...prev, data]);
            }
        };
        socket.on("receivingmessage", handler);
        return () => socket.off("receivingmessage", handler);
    }, [currentUserId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = () => {
        if (!msg.trim()) return;

        setMessages((prev) => [...prev, { msg, senderId: currentUserId }]);

        socket.emit("sendingmessage", {
            msg,
            to: id,
            senderId: currentUserId,
        });

        setMsg("");
    };

    return (
        <div className="chat-container">
            {/* Header */}
            <div className="chat-header">
                <div className="user-info">
                    <img src={user.pic} alt="" />
                    <div>
                        <h2>{user.name}</h2>
                        <p>Online</p>
                    </div>
                </div>

                <div className="icons">
                    <Video size={20} />
                    <Phone size={20} />
                    <Search size={20} />
                    <MoreVertical size={20} />
                </div>
            </div>

            {/* Messages */}
            <div className="chat-body">
                <div className="date">TODAY</div>

                {messages.map((data, index) => (
                    <div
                        key={index}
                        className={`message-row ${
                            data.senderId === currentUserId ? "right" : "left"
                        }`}
                    >
                        <div className="message-bubble">
                            {data.msg}
                        </div>
                    </div>
                ))}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="chat-input">
                <Plus size={18} />
                <Image size={18} />
                <Paperclip size={18} />

                <input
                    type="text"
                    placeholder="Write a message..."
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />

                <Smile size={18} />

                <button onClick={handleSend}>➤</button>
            </div>
        </div>
    );
};

export default Chat;