import React, { useState, useEffect, useRef } from "react";
import { useAppContext } from "../../AppProvider";
import MessageInput from "./MessageInput";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faCheck,
  faSignOut,
  faTimes,
  faX,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";
import User from "../../assets/image/User.png";

const ChatWindow = ({ chatroomId, messages, setMessages, friendInfo }) => {
  const { sessionToken, id } = useAppContext();

  // wss://165.232.170.169/ws/chat/472c4cdf-6a77-4496-b194-1fb88cc6e043/?user_id=85c31eb2-0cb8-481b-8891-0210102c904d
  const wsUrl = `wss://165.232.170.169/ws/chat/${chatroomId}/?user_id=${id}`;
  const messagesEndRef = useRef(null);
  let navigate = useNavigate();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log("WebSocket connection established");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("WebSocket message received:", data); // Log dữ liệu nhận được từ WebSocket

      // Kiểm tra dữ liệu nhận được có phải là mảng `messages` hay không
      if (data.messages && Array.isArray(data.messages)) {
        console.log("Received chat messages:", data.messages); // Log danh sách tin nhắn nhận được

        // Cập nhật state với tin nhắn mới
        setMessages((prevMessages) => {
          // Lọc những tin nhắn mới chưa có trong prevMessages
          const newMessages = data.messages.filter(
            (newMessage) =>
              !prevMessages.some(
                (existingMessage) =>
                  existingMessage.message_id === newMessage.message_id
              )
          );

          // Nếu có tin nhắn mới, thêm vào prevMessages và return lại mảng mới
          if (newMessages.length > 0) {
            return [...prevMessages, ...newMessages];
          }

          // Nếu không có tin nhắn mới, giữ nguyên prevMessages
          return prevMessages;
        });
      } else {
        console.log("No valid messages or incorrect data format received");
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed");
    };

    // Dọn dẹp khi component unmount
    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [wsUrl, id, setMessages]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const isOwnMessage = (sender) => sender === id;

  const handleSendMessage = (messageContent) => {
    const newMessage = {
      message: messageContent,
    };

    // Gửi tin nhắn qua WebSocket
    const socket = new WebSocket(wsUrl);
    socket.onopen = () => {
      socket.send(JSON.stringify(newMessage));
    };
  };

  const isNewDay = (currentMessage, previousMessage) => {
    const currentDate = new Date(currentMessage.created_at).toDateString();
    const previousDate = previousMessage
      ? new Date(previousMessage.created_at).toDateString()
      : null;
    return currentDate !== previousDate;
  };

  const handleDetailPost = (postId) => {
    navigate(`/user/detail-post/${postId}`);
  };

  const openConfirm = () => setIsConfirmOpen(true);
  const closeConfirm = () => setIsConfirmOpen(false);

  const openCancel = () => setIsCancelOpen(true);
  const closeCancel = () => setIsCancelOpen(false);

  const openDelete = () => setIsDeleteOpen(true);
  const closeDelete = () => setIsDeleteOpen(false);

  const handleAcceptNego = async (negoId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SWEETHOME_API_ENDPOINT}/api/accept-negotiations/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionToken}`,
          },
          body: JSON.stringify({
            negotiation_id: negoId,
            is_accepted: true,
          }),
        }
      );

      if (response.ok) {
        console.log("Accept negotiation successfully");
        alert("Chấp nhận thương lượng thành công!");
        localStorage.setItem("friendInfo", "{}");
        window.location.reload();
      } else {
        const errorData = await response.json();
        console.error("Accept negotiation failed:", errorData);
        alert(
          "Chấp nhận thương lượng thất bại do người mua đã xóa thương lượng trước đó !"
        );
        localStorage.setItem("friendInfo", "{}");
        window.location.reload();
      }
    } catch (error) {
      console.error("Error accepting negotiation:", error);
      alert("Có lỗi xảy ra khi chấp nhận thương lượng!");
    }
  };

  const handleCancelNego = async (negoId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SWEETHOME_API_ENDPOINT}/api/accept-negotiations/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionToken}`,
          },
          body: JSON.stringify({
            negotiation_id: negoId,
            is_accepted: false,
          }),
        }
      );

      if (response.ok) {
        console.log("Accept negotiation successfully");
        alert("Hủy thương lượng thành công!");
        localStorage.setItem("friendInfo", "{}");
        window.location.reload();
      } else {
        const errorData = await response.json();
        console.error("Accept negotiation failed:", errorData);
        alert(
          "Hủy thương lượng thất bại do người mua đã xóa thương lượng trước đó !"
        );
        localStorage.setItem("friendInfo", "{}");
        window.location.reload();
      }
    } catch (error) {
      console.error("Error accepting negotiation:", error);
      alert("Có lỗi xảy ra khi hủy thương lượng!");
    }
  };

  const handleDeleteNego = async (negoId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SWEETHOME_API_ENDPOINT}/api/post-negotiations/${negoId}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        }
      );

      if (response.ok) {
        console.log("Delete negotiation successfully");
        alert("Xóa thương lượng thành công!");
        localStorage.setItem("friendInfo", "{}");
        window.location.reload();
      } else {
        const errorData = await response.json();
        console.error("Delete negotiation failed:", errorData);
        alert("Xóa thương lượng thất bại!");
        localStorage.setItem("friendInfo", "{}");
        window.location.reload();
      }
    } catch (error) {
      console.error("Error deleting negotiation:", error);
      alert("Có lỗi xảy ra khi xóa thương lượng!");
    }
  };

  return (
    <>
      {friendInfo.type ? (
        <div className="w-full mx-auto rounded-lg">
          <div className="">
            {friendInfo && (
              <div className="flex items-center mb-4 bg-white border-solid border-gray-300 border-[1px] p-2 rounded-lg shadow-md">
                <LazyLoadImage
                  src={
                    friendInfo.avatar
                      ? `${process.env.REACT_APP_SWEETHOME_API_ENDPOINT}${friendInfo.avatar}`
                      : User
                  }
                  alt="Avatar"
                  className="w-12 h-12 rounded-full mr-4 object-cover border-[1px] border-gray-400 border-solid"
                />
                <h2 className="text-[1rem] font-bold text-black flex items-center">
                  {friendInfo.userName
                    ? `${friendInfo.userName} - ${
                        friendInfo.type === "buyer" ? "Người mua" : "Người bán"
                      }`
                    : ""}
                </h2>
                <div className="ml-auto flex items-center gap-2 font-semibold">
                  {friendInfo.type === "buyer" && (
                    <div className="flex items-center gap-2">
                      <button
                        className="text-white text-sm bg-red-500 hover:bg-red-600 px-2 py-1 rounded-lg shadow-md transition-colors duration-300 flex items-center space-x-2"
                        onClick={openCancel}
                      >
                        <FontAwesomeIcon icon={faSignOut} />
                        <span>Hủy thương lượng</span>
                      </button>
                      <button
                        className="text-white text-sm bg-yellow-500 hover:bg-yellow-600 px-2 py-1 rounded-lg shadow-md transition-colors duration-300 flex items-center space-x-2"
                        onClick={openConfirm}
                      >
                        <FontAwesomeIcon icon={faCheck} />
                        <span>Chấp nhận thương lượng</span>
                      </button>
                    </div>
                  )}
                  {friendInfo.type === "seller" && (
                    <button
                      className="text-white text-sm bg-red-500 hover:bg-red-600 px-2 py-1 rounded-lg shadow-md transition-colors duration-300 flex items-center space-x-2"
                      onClick={openDelete}
                    >
                      <FontAwesomeIcon icon={faX} />
                      <span>Xóa thương lượng</span>
                    </button>
                  )}
                  <button
                    className="text-white text-sm bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded-lg shadow-md transition-colors duration-300 flex items-center space-x-2"
                    onClick={() => {
                      handleDetailPost(friendInfo.postId);
                    }}
                    disabled={!friendInfo.postId}
                  >
                    <FontAwesomeIcon icon={faArrowRight} />
                    <span>Đi đến bài đăng</span>
                  </button>
                </div>

                {/* Popup Xác Nhận */}
                {isConfirmOpen && (
                  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-2xl relative">
                      <h3 className="text-2xl font-semibold text-center mb-4 border-b border-solid border-gray-200 pb-2">
                        Xác Nhận
                      </h3>
                      <button
                        onClick={closeConfirm}
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                        aria-label="Đóng"
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                      <p className="mb-6 text-center font-semibold text-gray-700">
                        Bạn có chắc chắn muốn chấp nhận thương lượng này?
                      </p>
                      <div className="flex justify-center space-x-4 font-semibold">
                        <button
                          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors duration-300"
                          onClick={closeConfirm}
                        >
                          Hủy
                        </button>
                        <button
                          className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors duration-300 flex items-center space-x-2"
                          onClick={() => {
                            handleAcceptNego(friendInfo.negoId);
                            closeConfirm();
                          }}
                        >
                          <FontAwesomeIcon icon={faCheck} />
                          <span>Chấp nhận</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {isCancelOpen && (
                  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-2xl relative">
                      <h3 className="text-2xl font-semibold text-center mb-4 border-b border-solid border-gray-200 pb-2">
                        Xác Nhận
                      </h3>
                      <button
                        onClick={closeCancel}
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                        aria-label="Đóng"
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                      <p className="mb-6 text-center font-semibold text-gray-700">
                        Bạn có chắc chắn muốn hủy thương lượng này?
                      </p>
                      <div className="flex justify-center space-x-4 font-semibold">
                        <button
                          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors duration-300"
                          onClick={closeCancel}
                        >
                          Hủy
                        </button>
                        <button
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-300 flex items-center space-x-2"
                          onClick={() => {
                            handleCancelNego(friendInfo.negoId);
                            closeCancel();
                          }}
                        >
                          <FontAwesomeIcon icon={faSignOut} />
                          <span>Xác nhận hủy</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {isDeleteOpen && (
                  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-2xl relative">
                      <h3 className="text-2xl font-semibold text-center mb-4 border-b border-solid border-gray-200 pb-2">
                        Xác Nhận
                      </h3>
                      <button
                        onClick={closeDelete}
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                        aria-label="Đóng"
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                      <p className="mb-6 text-center font-semibold text-gray-700">
                        Bạn có chắc chắn muốn xóa thương lượng này?
                      </p>
                      <div className="flex justify-center space-x-4 font-semibold">
                        <button
                          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors duration-300"
                          onClick={closeDelete}
                        >
                          Hủy
                        </button>
                        <button
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-300 flex items-center space-x-2"
                          onClick={() => {
                            handleDeleteNego(friendInfo.negoId);
                            closeDelete();
                          }}
                        >
                          <FontAwesomeIcon icon={faX} />
                          <span>Xác nhận xóa</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="h-[33rem] overflow-y-auto flex flex-col gap-3 bg-white p-4 rounded-lg border-[1px] border-solid border-gray-300">
              {messages.length > 0 ? (
                messages.map((message, index) => (
                  <div key={message.message_id || `temp-${Math.random()}`}>
                    {index === 0 || isNewDay(message, messages[index - 1]) ? (
                      <div className="flex items-center my-10">
                        <div className="flex-grow border-t border-solid border-gray-300"></div>
                        <span className="mx-4 text-gray-500">
                          {new Date(message.created_at).toLocaleDateString(
                            "vi-VN",
                            {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </span>
                        <div className="flex-grow border-t border-solid border-gray-300"></div>
                      </div>
                    ) : null}
                    <div
                      className={`flex ${
                        isOwnMessage(message.sender)
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-2xl p-3 rounded-3xl shadow-lg break-words whitespace-pre-wrap ${
                          isOwnMessage(message.sender)
                            ? "bg-green-100 text-black text-sm"
                            : "bg-blue-100 text-black text-sm"
                        }`}
                      >
                        <p className="text-md font-semibold">
                          {message.content}
                        </p>
                        <div className="text-xs text-gray-500 mt-1 text-right">
                          {new Date(message.created_at).toLocaleTimeString(
                            "vi-VN",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="w-full flex items-center justify-center h-full">
                  <p className="font-bold text-lg">
                    Hãy bắt đầu một tin nhắn mới !
                  </p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <MessageInput onSend={handleSendMessage} />
          </div>
        </div>
      ) : (
        <div className="w-full flex items-center font-semibold justify-center h-full">
          <p className="w-auto">Chọn một người để bắt đầu nhắn tin!</p>
        </div>
      )}
    </>
  );
};

export default ChatWindow;
