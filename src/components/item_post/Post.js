import React, { useState, useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faComment,
  faBookmark,
  faDollarSign,
  faMapMarkerAlt,
  faBed,
  faRulerCombined,
  faCompass,
  faBath,
  faRoad,
  faHandshake,
  faEdit,
  faTrash,
  faBuilding,
  faFileContract,
  faCheck,
  faX,
  faTimes,
  faExclamationTriangle,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import {
  FaPen,
  FaRegFileAlt,
  FaDollarSign,
  FaCreditCard,
  FaCalendarAlt,
  FaStickyNote,
} from "react-icons/fa";

import ProfileInformation from "../profile_information/ProfileInformation";
import { useAppContext } from "../../AppProvider";
import axios from "axios";
import ImageCard from "../image_card/ImageCard";
import DetailDescription from "../detail_description/DetailDescription";
import Swal from "sweetalert2";

function Post({ post, type }) {
  const { id, sessionToken, role, posts, setPost } = useAppContext();
  const navigate = useNavigate();
  const [reactionsCount, setReactionsCount] = useState(post.reactions_count);
  const [savesCount, setSavesCount] = useState(post.save_count);
  const [isClicked, setIsClicked] = useState();
  const [isSaved, setIsSaved] = useState();

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [price, setPrice] = useState("");
  const [negotiationDate, setNegotiationDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [negotiationNote, setNegotiationNote] = useState("");

  const [selectedPostIdD, setSelectedPostIdD] = useState(null);
  const [showPopupD, setShowPopupD] = useState(false);
  const [showPopUpConfirm, setShowPopUpConfirm] = useState(false);
  const [showPopUpDelete, setShowPopUpDelete] = useState(false);

  const [isStatusPopupOpen, setIsStatusPopupOpen] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const getStatusClass = (status) => {
    switch (status) {
      case "Đang bán":
        return "bg-gradient-to-r from-blue-400 to-blue-600";
      case "Đã bán":
        return "bg-gradient-to-r from-gray-400 to-gray-600";
      case "Đang thương lượng":
        return "bg-gradient-to-r from-yellow-400 to-yellow-600";
      default:
        return "bg-gradient-to-r from-red-400 to-red-600";
    }
  };

  useEffect(() => {
    setReactionsCount(post.reactions_count);
    setSavesCount(post.save_count);
  }, [post.reactions_count, post.save_count]);

  useEffect(() => {
    setIsClicked(false);
    setIsSaved(false);
    // Check like
    const checkLiked = async () => {
      if (role !== "admin" && role) {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_SWEETHOME_API_ENDPOINT}/api/user-posts-like/`,
            {
              headers: {
                Authorization: `Bearer ${sessionToken}`,
                "Content-Type": "application/json",
              },
            }
          );
          if (response.status === 200) {
            const likedPosts = response.data.map((post) => post.post_id);
            if (likedPosts.includes(post.post_id)) {
              setIsClicked(true);
            }
          }
        } catch (error) {
          console.error("Error checking liked posts:", error);
        }
      }
    };

    // Check save
    const checkSaved = async () => {
      if (role !== "admin" && role) {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_SWEETHOME_API_ENDPOINT}/api/saved-posts/${id}/`,
            {
              headers: {
                Authorization: `Bearer ${sessionToken}`,
                "Content-Type": "application/json",
              },
            }
          );
          if (response.status === 200) {
            const savedPosts = response.data.map((post) => post.post_id);
            if (savedPosts.includes(post.post_id)) {
              setIsSaved(true);
            }
          }
        } catch (error) {
          console.error("Error checking saved posts:", error);
        }
      }
    };

    checkSaved();
    checkLiked();
  }, [post.post_id, sessionToken, id, role]);

  const handleClick = useCallback(async () => {
    if (!sessionToken) {
      alert("Bạn cần đăng nhập để thực hiện hành động này.");
      return;
    } else {
      setIsClicked((prevClicked) => {
        setReactionsCount((prevCount) =>
          prevClicked ? prevCount - 1 : prevCount + 1
        );
        return !prevClicked;
      });
      try {
        const res = await axios.post(
          `${process.env.REACT_APP_SWEETHOME_API_ENDPOINT}/api/posts/${post.post_id}/like/`,
          {},
          {
            headers: {
              Authorization: `Bearer ${sessionToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (res.status === 200) {
          console.log("Like post successfully");
        }
      } catch (error) {
        console.error("Error liking the post:", error);
      }
    }
  }, [sessionToken, post.post_id]);

  const handleSaveClick = useCallback(async () => {
    if (!sessionToken) {
      alert("Bạn cần đăng nhập để thực hiện hành động này.");
      return;
    }
    // Dựa vào 'isSaved' để xác định phương thức
    const method = isSaved ? "DELETE" : "POST";

    // Cập nhật UI ngay lập tức
    setIsSaved(!isSaved);
    setSavesCount((prev) => (isSaved ? prev - 1 : prev + 1));

    try {
      await axios({
        method,
        url: `${process.env.REACT_APP_SWEETHOME_API_ENDPOINT}/api/saved-posts/${post.post_id}/`,
        data: {},
        headers: {
          Authorization: `Bearer ${sessionToken}`,
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Error saving the post:", error);
    }
  }, [sessionToken, post.post_id, isSaved]);

  const formatPrice = (price) => {
    if (price >= 1_000_000_000) {
      const billionValue = parseFloat((price / 1_000_000_000).toFixed(5));
      return `${billionValue} tỷ VNĐ`;
    } else if (price >= 1_000_000) {
      const millionValue = parseFloat((price / 1_000_000).toFixed(5));
      return `${millionValue} triệu VNĐ`;
    } else {
      return `${price} VNĐ`;
    }
  };
  const handleDetailClick = () => {
    if (!sessionToken) {
      alert("Bạn cần đăng nhập để thực hiện hành động này.");
      return;
    } else if (role === "user") {
      navigate(`/user/detail-post/${post.post_id}`);
    } else {
      navigate(`/admin/detail-post/${post.post_id}`);
    }
  };

  const handleDelete = async (postId) => {
    const userConfirmed = window.confirm(
      "Bạn có chắc chắn muốn xóa bài đăng này không?"
    );
    if (!userConfirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_SWEETHOME_API_ENDPOINT}/api/posts/${postId}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${sessionToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        setPost(posts.filter((post) => post.id !== postId));
      } else {
        console.error("Failed to delete the post");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdate = (postId) => {
    navigate(`/user/update-post/${postId}`);
  };

  const handleStatusUpdate = async (postId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SWEETHOME_API_ENDPOINT}/api/sold-posts/${postId}/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionToken}`,
          },
          body: JSON.stringify({
            sale_status: "Đã bán",
          }),
        }
      );

      if (response.ok) {
        alert("Cập nhật trạng thái thành công!");
        window.location.reload();
      } else {
        alert("Cập nhật trạng thái thất bại!");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Có lỗi xảy ra khi cập nhật trạng thái!");
    }
  };

  // Thương lượng
  const handleNeogotiate = (postId) => {
    if (!sessionToken) {
      alert("Bạn cần đăng nhập để thực hiện hành động này.");
      return;
    } else {
      setIsPopupOpen(true);
    }
  };

  const handlePriceChange = (e) => {
    let value = e.target.value;
    value = value.replace(/[^0-9,]/g, "");
    const numericValue = value.replace(/,/g, "");
    const formattedValue = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    setPrice(formattedValue);
  };

  const handleSubmit = async () => {
    if (!price || !negotiationDate || !paymentMethod || !negotiationNote) {
      Swal.fire({
        icon: "warning",
        title: "Thiếu thông tin",
        text: "Vui lòng điền đầy đủ các trường bắt buộc.",
        confirmButtonText: "Đóng",
        confirmButtonColor: "#dc3545",
        didOpen: () => {
          const popup = Swal.getPopup();
          popup.style.fontFamily = "'Montserrat', sans-serif";
          popup.style.fontWeight = 600;
        },
      });
      return;
    }

    const numericPrice = price.replace(/,/g, "");

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_SWEETHOME_API_ENDPOINT}/api/post-negotiations/${post.post_id}/`,
        {
          negotiation_price: parseInt(numericPrice, 10),
          negotiation_date: negotiationDate,
          payment_method: paymentMethod,
          negotiation_note: negotiationNote,
        },
        {
          headers: {
            Authorization: `Bearer ${sessionToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Negotiation response:", response.data);

      setIsPopupOpen(false);
      setPrice("");
      setNegotiationDate("");
      setPaymentMethod("");
      setNegotiationNote("");

      Swal.fire({
        icon: "success",
        title: "Thành công",
        text: "Đã gửi yêu cầu thương lượng thành công!",
        confirmButtonText: "Đóng",
        confirmButtonColor: "#28a745",
        didOpen: () => {
          const popup = Swal.getPopup();
          popup.style.fontFamily = "'Montserrat', sans-serif";
          popup.style.fontWeight = 600;
        },
      }).then(() => {
        window.location.reload();
      });
    } catch (error) {
      console.error("Error submitting negotiation:", error);
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Mức giá thương lượng bạn đưa ra không phù hợp. Vui lòng hãy thử lại với mức giá khác.",
        confirmButtonText: "Đóng",
        confirmButtonColor: "#dc3545",
        didOpen: () => {
          const popup = Swal.getPopup();
          popup.style.fontFamily = "'Montserrat', sans-serif";
          popup.style.fontWeight = 600;
        },
      });
    }
  };

  const handleClose = () => {
    setIsPopupOpen(false);
    setPrice("");
    setNegotiationDate("");
    setPaymentMethod("");
    setNegotiationNote("");
  };

  const handleApprovePost = async (postId) => {
    setShowPopupD(false);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_SWEETHOME_API_ENDPOINT}/api/admin/posts/`,
        {
          post_id: postId,
          status: "đã duyệt",
        },
        {
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        }
      );
      if (response.status === 200) {
        alert("Duyệt bài đăng thành công");
        window.location.reload();
      } else {
        alert("Duyệt bài đăng thất bại");
        window.location.reload();
      }
    } catch (error) {
      console.error("Error updating post status:", error);
    }
  };

  const handleRefusePost = async (postId) => {
    setShowPopUpConfirm(false);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_SWEETHOME_API_ENDPOINT}/api/admin/posts/`,
        {
          post_id: postId,
          status: "bị từ chối",
        },
        {
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        }
      );
      if (response.status === 200) {
        alert("Từ chối duyệt bài đăng thành công");
        window.location.reload();
      } else {
        alert("Từ chối duyệt bài đăng thất bại");
        window.location.reload();
      }
    } catch (error) {
      console.error("Error updating post status:", error);
    }
  };

  const handleAdminDelete = async (postId) => {
    setShowPopUpDelete(false);
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_SWEETHOME_API_ENDPOINT}/api/admin/posts/${postId}/`,
        {
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        }
      );
      if (response.status === 200) {
        alert("Xóa bài đăng thành công");
        window.location.reload();
        navigate("/admin/dashboard");
      } else {
        alert("Xóa bài đăng thất bại");
        window.location.reload();
      }
    } catch (error) {
      console.error("Error updating post status:", error);
    }
  };

  return (
    <div className="w-full mx-auto p-[1rem] bg-white rounded-lg shadow-md border-[1px] border-gray-300 border-double overflow-hidden font-montserrat ">
      {/* Header */}
      <div
        className="flex justify-between items-center px-2 cursor-pointer"
        onClick={handleDetailClick}
      >
        <h2 className="text-xl font-semibold text-black rounded-lg flex items-center">
          <FaPen className="mr-2" />
          {post.title}
        </h2>

        <div
          className={`px-5 max-w-[15rem] text-center py-2 text-white font-bold rounded-[0.5rem] ${getStatusClass(
            post.sale_status
          )}`}
        >
          {post.sale_status}
        </div>
      </div>

      {/* main_container */}
      <div className="flex flex-row justify-center gap-2">
        {/* Left (45%) */}
        <div className="w-[45%]">
          {/* Img */}
          <ImageCard postId={post.post_id} />
          {/* Neo_btn */}
          {id !== post.user.user_id &&
            role !== "admin" &&
            (post.sale_status === "Đang bán" ||
              post.sale_status === "Đang thương lượng") && (
              <div className="pt-3 flex justify-center items-center">
                <button
                  className="bg-gradient-to-r from-yellow-500 to-yellow-400 font-semibold text-black  text-sm px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 transform hover:scale-105 transition-transform duration-200 ease-in-out hover:from-yellow-600 hover:to-yellow-500"
                  onClick={() => {
                    handleNeogotiate(post.post_id);
                  }}
                >
                  <FontAwesomeIcon icon={faHandshake} className="text-lg" />
                  Thương lượng
                </button>
                {isPopupOpen && (
                  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white text-black p-8 rounded-xl shadow-2xl max-w-3xl w-full">
                      <h2 className="text-xl font-bold text-gray-800 mb-4 text-center border-b-[2px] border-gray-500 border-solid pb-2">
                        Hãy nhập giá tiền và thông tin bạn muốn thương lượng
                      </h2>
                      <p className="text-sm text-gray-600 mb-6 text-center">
                        <strong className="font-bold text-red-500">
                          Chú ý:
                        </strong>{" "}
                        Khi thương lượng, giá thương lượng mà bạn đưa ra không
                        được nhỏ hơn{" "}
                        <span className="text-red-500 font-semibold">70%</span>{" "}
                        giá tiền mà chủ bài viết đã đăng bán.
                      </p>

                      {/* Trường Giá Thương Lượng */}
                      <div className="mb-4">
                        <label
                          htmlFor="price"
                          className="block text-gray-800 font-bold mb-2"
                        >
                          Giá Thương Lượng (VNĐ)
                        </label>
                        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                          <div className="px-3">
                            <FaDollarSign className="text-gray-500" />
                          </div>
                          <input
                            type="text"
                            id="price"
                            value={price}
                            onChange={handlePriceChange}
                            className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none"
                            placeholder="Nhập giá tiền (VNĐ)"
                            required
                          />
                        </div>
                      </div>

                      {/* Trường Ngày Thương Lượng */}
                      <div className="mb-4">
                        <label
                          htmlFor="negotiationDate"
                          className="block text-gray-800 font-bold mb-2"
                        >
                          Ngày Bắt Đầu Giao Dịch
                        </label>
                        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                          <div className="px-3">
                            <FaCalendarAlt className="text-gray-500" />
                          </div>
                          <input
                            type="date"
                            id="negotiationDate"
                            min={today}
                            value={negotiationDate}
                            onChange={(e) => setNegotiationDate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none"
                            required
                          />
                        </div>
                      </div>

                      {/* Trường Hình Thức Trả Tiền */}
                      <div className="mb-4">
                        <label
                          htmlFor="paymentMethod"
                          className="block text-gray-800 font-bold mb-2"
                        >
                          Hình Thức Trả Tiền
                        </label>
                        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                          <div className="px-3">
                            <FaCreditCard className="text-gray-500" />
                          </div>
                          <select
                            id="paymentMethod"
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none"
                            required
                          >
                            <option value="" disabled>
                              Chọn hình thức trả tiền
                            </option>
                            <option value="trả góp">Trả góp</option>
                            <option value="trả trước">Trả trước</option>
                            <option value="một lần">Thanh toán một lần</option>
                            <option value="khác">Khác</option>
                            {/* Thêm các lựa chọn khác nếu cần */}
                          </select>
                        </div>
                      </div>

                      {/* Trường Ghi Chú Thêm */}
                      <div className="mb-6">
                        <label
                          htmlFor="negotiationNote"
                          className="block text-gray-800 font-bold mb-2"
                        >
                          Ghi Chú Thêm
                        </label>
                        <div className="flex items-start border border-gray-300 rounded-lg overflow-hidden">
                          <div className="px-3 mt-2">
                            <FaStickyNote className="text-gray-500" />
                          </div>
                          <textarea
                            id="negotiationNote"
                            value={negotiationNote}
                            onChange={(e) => setNegotiationNote(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none"
                            placeholder="Ghi chú thêm (tùy chọn)"
                            rows="3"
                          ></textarea>
                        </div>
                      </div>

                      {/* Nút Xác Nhận và Hủy Bỏ */}
                      <div className="flex justify-center gap-4">
                        <button
                          type="button"
                          className="bg-blue-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300 ease-in-out"
                          onClick={handleSubmit}
                        >
                          Xác nhận
                        </button>
                        <button
                          type="button"
                          className="bg-gray-300 text-gray-800 font-bold px-4 py-2 rounded-lg hover:bg-gray-400 transition duration-300 ease-in-out"
                          onClick={handleClose}
                        >
                          Hủy bỏ
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

          {/* Check post đang thương lượng thì không được sửa */}

          <div className="pt-3 pb-7 flex justify-center items-center gap-7">
            {id === post.user.user_id && post.sale_status === "Đang bán" && (
              <>
                <button
                  className="bg-gradient-to-r from-blue-500 to-blue-400 text-white text-sm font-semibold w-[7rem] px-1 py-2 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  onClick={() => {
                    handleUpdate(post.post_id);
                  }}
                >
                  <FontAwesomeIcon icon={faEdit} className="text-lg" />
                  Cập nhật
                </button>
              </>
            )}
            {id === post.user.user_id &&
              (post.sale_status === "Đang thương lượng" ||
                post.sale_status === "Đã cọc") && (
                <>
                  <button
                    className="bg-gradient-to-r from-blue-500 to-blue-400 text-white text-sm font-semibold w-[7rem] px-1 py-2 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    onClick={() => setIsStatusPopupOpen(true)}
                  >
                    <FontAwesomeIcon icon={faEdit} className="text-lg" />
                    Cập nhật
                  </button>

                  {/* Status Update Popup */}
                  {isStatusPopupOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
                      <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-8 w-full max-w-xl relative transform transition-all duration-300 ease-out scale-100 shadow-2xl border border-blue-100">
                        <button
                          onClick={() => setIsStatusPopupOpen(false)}
                          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors duration-200"
                        >
                          <FontAwesomeIcon icon={faTimes} size="lg" />
                        </button>

                        <h2 className="text-xl font-bold text-gray-800 mb-4 text-center border-b-[2px] border-gray-500 border-solid pb-2">
                          <FontAwesomeIcon icon={faEdit} className="mr-2" />
                          Cập Nhật Trạng Thái
                        </h2>

                        <p className="text-sm text-gray-600 mb-8 text-center italic">
                          Hiện tại bạn chỉ có thể cập nhật trạng thái của bài
                          đăng là "Đã bán".
                        </p>

                        <div className="flex flex-col gap-4">
                          <div className="flex items-center space-x-4 p-4 font-semibold bg-gray-100">
                            <FontAwesomeIcon
                              icon={faInfoCircle}
                              className="text-blue-500 text-xl"
                            />
                            <div className="flex flex-row justify-start items-center gap-5 w-full">
                              <p className="font-semibold text-gray-700 mb-1">
                                Trạng thái hiện tại:
                              </p>
                              <p className="text-blue-600 w-auto bg-blue-200 px-3 py-1 rounded-3xl">
                                {post.sale_status}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4 p-4 font-semibold bg-gray-100">
                            <FontAwesomeIcon
                              icon={faExclamationTriangle}
                              className="text-red-500 text-xl"
                            />
                            <div className="flex flex-row justify-start items-center gap-5 w-full">
                              <p className="font-semibold text-gray-700 mb-1">
                                Trạng thái mới:
                              </p>
                              <p className="text-red-600 w-auto bg-red-200 px-3 py-1 rounded-3xl">
                                Đã bán
                              </p>
                            </div>
                          </div>

                          <div className="flex justify-end space-x-4 border-t border-gray-100 pt-2">
                            <button
                              className="px-6 py-2.5 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-all duration-200 flex items-center space-x-2 hover:shadow-md"
                              onClick={() => setIsStatusPopupOpen(false)}
                            >
                              <FontAwesomeIcon icon={faTimes} />
                              <span>Hủy</span>
                            </button>
                            <button
                              className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-semibold flex items-center space-x-2 hover:shadow-md"
                              onClick={() => handleStatusUpdate(post.post_id)}
                            >
                              <FontAwesomeIcon icon={faCheck} />
                              <span>Xác nhận</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            {id === post.user.user_id && (
              <>
                <button
                  className="bg-gradient-to-r from-red-500 to-red-400 text-white text-sm font-semibold w-[7rem] px-1 py-2 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-300"
                  onClick={() => {
                    handleDelete(post.post_id);
                  }}
                >
                  <FontAwesomeIcon icon={faTrash} className="text-lg" />
                  Xóa
                </button>
              </>
            )}

            {/* Admin */}

            {role === "admin" && post.status === "Đang chờ duyệt" && (
              <div className="flex justify-center items-center gap-10">
                <button
                  className="bg-gradient-to-r from-yellow-500 to-yellow-400 text-black font-bold px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transform hover:scale-105 transition-transform duration-200 ease-in-out hover:from-yellow-600 hover:to-yellow-500"
                  onClick={() => {
                    setShowPopupD(true);
                    setSelectedPostIdD(post.post_id);
                  }}
                >
                  <FontAwesomeIcon icon={faCheck} className="text-lg" />
                  Duyệt bài
                </button>

                <button
                  className="bg-gradient-to-r from-red-500 to-red-400 text-white font-bold px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transform hover:scale-105 transition-transform duration-200 ease-in-out hover:from-red-600 hover:to-red-500"
                  onClick={() => {
                    setShowPopUpConfirm(true);
                    setSelectedPostIdD(post.post_id);
                  }}
                >
                  <FontAwesomeIcon icon={faX} className="text-lg" />
                  Từ chối
                </button>
              </div>
            )}

            {role === "admin" && post.status === "Đã duyệt" && (
              <div className="flex justify-center items-center">
                <button
                  className="bg-gradient-to-r from-red-500 to-red-400 text-white font-bold px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transform hover:scale-105 transition-transform duration-200 ease-in-out hover:from-red-600 hover:to-red-500"
                  onClick={() => {
                    setShowPopUpDelete(true);
                    setSelectedPostIdD(post.post_id);
                  }}
                >
                  <FontAwesomeIcon icon={faX} className="text-lg" />
                  Xóa bài đăng
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right column (55%) */}
        <div className="flex flex-col bg-white gap-2 justify-center w-full mt-2">
          {post.estate_type === "Nhà" && (
            <div className="flex flex-col gap-4 p-4 text-gray-700 text-lg font-semibold bg-white ">
              <div className="flex flex-row justify-between items-start gap-4 w-full">
                {/* DetailDescription */}
                <div className="flex-1">
                  <DetailDescription
                    description={post.description}
                    maxLength={52}
                    moreLink={`/user/detail-post/${post.post_id}`}
                    onClick={handleDetailClick}
                  />
                </div>

                <div
                  className="flex items-center justify-start bg-gradient-to-br from-yellow-200 to-orange-300 text-orange-700 
                             rounded-lg p-4 shadow-lg shadow-orange-300 mb-3 border-2 border-white 
                            max-w-xs transform hover:scale-105 transition-transform duration-200 ease-out"
                >
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faDollarSign} className="text-lg" />
                    <p className="text-lg font-extrabold">Giá bán:</p>
                  </div>
                  <p className="text-lg font-extrabold ml-4">
                    {formatPrice(post.price)}
                  </p>
                </div>
              </div>

              {/* Giao diện tối ưu */}
              <div className="flex flex-col items-start justify-center">
                {/* Địa chỉ */}
                <div className="w-auto max-w-[42rem] bg-white p-2 flex items-center gap-2">
                  {/* Biểu tượng */}
                  <div className="w-8 h-8 flex items-center justify-center bg-red-100 rounded-full">
                    <FontAwesomeIcon
                      icon={faMapMarkerAlt}
                      className="text-red-500 text-lg"
                    />
                  </div>

                  {/* Label và Nội dung */}
                  <div className="flex items-center gap-2">
                    <p className="text-red-500 font-bold text-sm whitespace-nowrap">
                      Địa chỉ:
                    </p>
                    <p className="text-gray-700 text-sm bg-red-50 p-2 rounded-xl">
                      {post.address}, Phường {post.ward}, Quận {post.district},
                      Thành phố {post.city}
                    </p>
                  </div>
                </div>

                <div className="w-full bg-white">
                  <table className="table-auto w-full border-collapse border border-gray-200">
                    <tbody>
                      <tr>
                        <td className="w-1/2 align-top">
                          <table className="table-auto w-full">
                            <tbody>
                              <tr>
                                <td className="flex items-center gap-2 border border-gray-200 p-2">
                                  <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full">
                                    <FontAwesomeIcon
                                      icon={faRulerCombined}
                                      className="text-gray-500 text-lg"
                                    />
                                  </div>
                                  <p className="text-gray-500 font-bold text-sm">
                                    Diện tích:
                                  </p>
                                </td>
                                <td className="">
                                  <p className="text-gray-700 text-sm text-center bg-blue-100 px-2 py-1 rounded-xl">
                                    {post.area} m²
                                  </p>
                                </td>
                              </tr>
                              <tr>
                                <td className="flex items-center gap-2 border border-gray-200 p-2">
                                  <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full">
                                    <FontAwesomeIcon
                                      icon={faCompass}
                                      className="text-gray-500 text-lg"
                                    />
                                  </div>
                                  <p className="text-gray-500 font-bold text-sm">
                                    Hướng:
                                  </p>
                                </td>
                                <td className="border border-gray-200">
                                  <p className="text-gray-700 text-sm text-center bg-blue-100 px-2 py-1 rounded-xl">
                                    {post.orientation}
                                  </p>
                                </td>
                              </tr>
                              <tr>
                                <td className="flex items-center gap-2 border border-gray-200 p-2">
                                  <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full">
                                    <FontAwesomeIcon
                                      icon={faRoad}
                                      className="text-gray-500 text-lg"
                                    />
                                  </div>
                                  <p className="text-gray-500 font-bold text-sm">
                                    Mặt tiền:
                                  </p>
                                </td>
                                <td className="border border-gray-200">
                                  <p className="text-gray-700 text-sm text-center bg-blue-100 px-2 py-1 rounded-xl">
                                    {post.frontage} m
                                  </p>
                                </td>
                              </tr>
                              <tr>
                                <td className="flex items-center gap-2 border border-gray-200 p-2">
                                  <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full">
                                    <FontAwesomeIcon
                                      icon={faBath}
                                      className="text-gray-500 text-lg"
                                    />
                                  </div>
                                  <p className="text-gray-500 font-bold text-sm">
                                    Số phòng tắm:
                                  </p>
                                </td>
                                <td className="border border-gray-200">
                                  <p className="text-gray-700 text-sm text-center bg-blue-100 px-2 py-1 rounded-xl">
                                    {post.bathroom}
                                  </p>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                        <td className="w-1/2 align-top">
                          <table className="table-auto w-full">
                            <tbody>
                              <tr>
                                <td className="flex items-center gap-2 border border-gray-200 p-2">
                                  <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full">
                                    <FaRegFileAlt className="text-gray-500 text-lg" />
                                  </div>
                                  <p className="text-gray-500 font-bold text-sm">
                                    Tình trạng pháp lý:
                                  </p>
                                </td>
                                <td className="border border-gray-200">
                                  <p className="text-gray-700 text-sm text-center bg-blue-100 px-2 py-1 rounded-xl">
                                    {post.legal_status}
                                  </p>
                                </td>
                              </tr>
                              <tr>
                                <td className="flex items-center gap-2 border border-gray-200 p-2">
                                  <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full">
                                    <FontAwesomeIcon
                                      icon={faBuilding}
                                      className="text-gray-500 text-lg"
                                    />
                                  </div>
                                  <p className="text-gray-500 font-bold text-sm">
                                    Số tầng:
                                  </p>
                                </td>
                                <td className="border border-gray-200">
                                  <p className="text-gray-700 text-sm text-center bg-blue-100 px-2 py-1 rounded-xl">
                                    {post.floor}
                                  </p>
                                </td>
                              </tr>
                              <tr>
                                <td className="flex items-center gap-2 border border-gray-200 p-2">
                                  <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full">
                                    <FontAwesomeIcon
                                      icon={faBed}
                                      className="text-gray-500 text-lg"
                                    />
                                  </div>
                                  <p className="text-gray-500 font-bold text-sm">
                                    Số phòng ngủ:
                                  </p>
                                </td>
                                <td className="border border-gray-200">
                                  <p className="text-gray-700 text-sm text-center bg-blue-100 px-2 py-1 rounded-xl">
                                    {post.bedroom}
                                  </p>
                                </td>
                              </tr>
                              <tr>
                                <td
                                  colSpan="2"
                                  className="border border-gray-200 pt-2"
                                >
                                  <div className="flex items-center justify-end w-auto">
                                    <button
                                      className="w-auto bg-gradient-to-r from-blue-500 to-blue-400 text-white text-sm font-medium px-3 py-2 rounded-md shadow-lg flex items-center gap-2 transform hover:scale-105 transition-transform duration-200 ease-in-out hover:from-blue-600 hover:to-blue-500"
                                      onClick={() => {
                                        handleDetailClick();
                                      }}
                                    >
                                      Xem chi tiết bài đăng
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          {post.estate_type === "Đất" && (
            <div className="flex flex-col gap-4 p-4 text-gray-700 text-lg font-semibold bg-white ">
              <div className="flex flex-row justify-between items-start gap-4 w-full">
                {/* DetailDescription */}
                <div className="flex-1">
                  <DetailDescription
                    description={post.description}
                    maxLength={52}
                    moreLink={`/user/detail-post/${post.post_id}`}
                    onClick={handleDetailClick}
                  />
                </div>

                <div
                  className="flex items-center justify-start bg-gradient-to-br from-yellow-200 to-orange-300 text-orange-700 
                             rounded-lg p-4 shadow-lg shadow-orange-300 mb-3 border-2 border-white 
                            max-w-xs transform hover:scale-105 transition-transform duration-200 ease-out"
                >
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faDollarSign} className="text-lg" />
                    <p className="text-lg font-extrabold">Giá bán:</p>
                  </div>
                  <p className="text-lg font-extrabold ml-4">
                    {formatPrice(post.price)}
                  </p>
                </div>
              </div>
              {/* Giao diện tối ưu */}
              <div className="flex flex-col gap-1 items-start justify-center">
                <div className="w-auto max-w-[42rem] bg-white p-1 flex items-center gap-2">
                  <div className="w-8 h-8 flex items-center justify-center bg-red-100 rounded-full">
                    <FontAwesomeIcon
                      icon={faMapMarkerAlt}
                      className="text-red-500 text-lg"
                    />
                  </div>

                  {/* Label và Nội dung */}
                  <div className="flex items-center gap-2">
                    <p className="text-red-500 font-bold text-sm whitespace-nowrap">
                      Địa chỉ:
                    </p>
                    <p className="text-gray-700 text-sm bg-red-50 p-2 rounded-xl">
                      {post.address}, Phường {post.ward}, Quận {post.district},
                      Thành phố {post.city}
                    </p>
                  </div>
                </div>

                <div className="w-full bg-white">
                  <table className="table-auto w-full border-collapse border border-gray-200">
                    <tbody>
                      <tr>
                        <td className="w-1/2 align-top">
                          <table className="table-auto w-full">
                            <tbody>
                              <tr>
                                <td className="flex items-center gap-2 border border-gray-200 p-2">
                                  <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full">
                                    <FontAwesomeIcon
                                      icon={faRulerCombined}
                                      className="text-gray-500 text-lg"
                                    />
                                  </div>
                                  <p className="text-gray-500 font-bold text-sm">
                                    Diện tích:
                                  </p>
                                </td>
                                <td className="">
                                  <p className="text-gray-700 text-sm text-center bg-blue-100 px-2 py-1 rounded-xl">
                                    {post.area} m²
                                  </p>
                                </td>
                              </tr>
                              <tr>
                                <td className="flex items-center gap-2 border border-gray-200 p-2">
                                  <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full">
                                    <FontAwesomeIcon
                                      icon={faFileContract}
                                      className="text-gray-500 text-lg"
                                    />
                                  </div>
                                  <p className="text-gray-500 font-bold text-sm">
                                    Lô đất:
                                  </p>
                                </td>
                                <td className="border border-gray-200">
                                  <p className="text-gray-700 text-sm text-center bg-blue-100 px-2 py-1 rounded-xl">
                                    {post.land_lot
                                      ? post.land_lot
                                      : "Chưa có thông tin"}
                                  </p>
                                </td>
                              </tr>
                              <tr>
                                <td className="flex items-center gap-2 border border-gray-200 p-2">
                                  <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full">
                                    <FontAwesomeIcon
                                      icon={faFileContract}
                                      className="text-gray-500 text-lg"
                                    />
                                  </div>
                                  <p className="text-gray-500 font-bold text-sm">
                                    Thửa đất số:
                                  </p>
                                </td>
                                <td className="border border-gray-200">
                                  <p className="text-gray-700 text-sm text-center bg-blue-100 px-2 py-1 rounded-xl">
                                    {post.land_parcel
                                      ? post.land_parcel
                                      : "Chưa có thông tin"}
                                  </p>
                                </td>
                              </tr>

                              <tr>
                                <td className="flex items-center gap-2 border border-gray-200 p-2">
                                  <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full">
                                    <FontAwesomeIcon
                                      icon={faFileContract}
                                      className="text-gray-500 text-lg"
                                    />
                                  </div>
                                  <p className="text-gray-500 font-bold text-sm">
                                    Tờ bản đồ số:
                                  </p>
                                </td>
                                <td className="border border-gray-200">
                                  <p className="text-gray-700 text-sm text-center bg-blue-100 px-2 py-1 rounded-xl">
                                    {post.map_sheet_number
                                      ? post.map_sheet_number
                                      : "Chưa có thông tin"}
                                  </p>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                        <td className="w-1/2 align-top">
                          <table className="table-auto w-full">
                            <tbody>
                              <tr>
                                <td className="flex items-center gap-2 border border-gray-200 p-2">
                                  <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full">
                                    <FaRegFileAlt className="text-gray-500 text-lg" />
                                  </div>
                                  <p className="text-gray-500 font-bold text-sm">
                                    Tình trạng pháp lý:
                                  </p>
                                </td>
                                <td className="border border-gray-200">
                                  <p className="text-gray-700 text-sm text-center bg-blue-100 px-2 py-1 rounded-xl">
                                    {post.legal_status}
                                  </p>
                                </td>
                              </tr>
                              <tr>
                                <td className="flex items-center gap-2 border border-gray-200 p-2">
                                  <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full">
                                    <FontAwesomeIcon
                                      icon={faCompass}
                                      className="text-gray-500 text-lg"
                                    />
                                  </div>
                                  <p className="text-gray-500 font-bold text-sm">
                                    Hướng:
                                  </p>
                                </td>
                                <td className="border border-gray-200">
                                  <p className="text-gray-700 text-sm text-center bg-blue-100 px-2 py-1 rounded-xl">
                                    {post.orientation}
                                  </p>
                                </td>
                              </tr>
                              <tr>
                                <td className="flex items-center gap-2 border border-gray-200 p-2">
                                  <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full">
                                    <FontAwesomeIcon
                                      icon={faRoad}
                                      className="text-gray-500 text-lg"
                                    />
                                  </div>
                                  <p className="text-gray-500 font-bold text-sm">
                                    Mặt tiền:
                                  </p>
                                </td>
                                <td className="border border-gray-200">
                                  <p className="text-gray-700 text-sm text-center bg-blue-100 px-2 py-1 rounded-xl">
                                    {post.frontage} m
                                  </p>
                                </td>
                              </tr>
                              <tr>
                                <td
                                  colSpan="2"
                                  className="border border-gray-200 pt-2"
                                >
                                  <div className="flex items-center justify-end w-auto">
                                    <button
                                      className="w-auto bg-gradient-to-r from-blue-500 to-blue-400 text-white text-sm font-medium px-3 py-2 rounded-md shadow-lg flex items-center gap-2 transform hover:scale-105 transition-transform duration-200 ease-in-out hover:from-blue-600 hover:to-blue-500"
                                      onClick={() => {
                                        handleDetailClick();
                                      }}
                                    >
                                      Xem chi tiết bài đăng
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-center ">
            <div className="flex space-x-8 mt-2 justify-center gap-10 w-[55%] border-t-[3px] border-gray-200 border-solid pt-2 pl-5 pr-5">
              {role !== "admin" && (
                <>
                  {/* Heart */}
                  <div className="flex flex-col items-center text-gray-500 gap-2">
                    <button
                      onClick={handleClick}
                      className="focus:outline-none"
                      title="Yêu thích"
                    >
                      <div className="flex gap-2 items-center space-x-1">
                        <FontAwesomeIcon
                          icon={faHeart}
                          className={`w-6 h-6 transition duration-100 ${
                            isClicked ? "text-red-400" : "text-gray-500"
                          }`}
                        />
                        <span>{reactionsCount}</span>
                      </div>
                    </button>
                    <span className="text-xs">Yêu thích</span>
                  </div>
                  {/* Chat */}
                  <div
                    className="flex flex-col items-center text-gray-500 gap-2 cursor-pointer"
                    onClick={handleDetailClick}
                    title="Bình luận"
                  >
                    <div className="flex gap-2 items-center space-x-1">
                      <FontAwesomeIcon icon={faComment} className="w-6 h-6" />
                      <span>{post.comments_count}</span>
                    </div>
                    <span className="text-xs">Bình luận</span>
                  </div>

                  {/* Save */}
                  <div
                    className="flex flex-col items-center text-gray-500 gap-2"
                    title="Lưu bài"
                  >
                    <button
                      onClick={() => {
                        if (post.user.user_id === id) {
                          alert("Không thể lưu bài đăng của chính mình!");
                          return;
                        }
                        handleSaveClick();
                      }}
                      className="focus:outline-none"
                    >
                      <div className="flex gap-2 items-center space-x-1">
                        <FontAwesomeIcon
                          icon={faBookmark}
                          className={`w-6 h-6 transition duration-100 ${
                            isSaved ? "text-yellow-400" : "text-gray-500"
                          }`}
                        />
                        <span>{savesCount}</span>
                      </div>
                    </button>
                    <span className="text-xs">Lưu bài</span>
                  </div>
                </>
              )}

              {/* Save */}
              {/* {type !== "personal-page" && (

              )} */}

              {showPopupD && (
                <div
                  className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50"
                  style={{ zIndex: 9999 }}
                >
                  <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-xl mx-4">
                    <div className="font-montserrat">
                      <div className="text-center">
                        <p className="font-extrabold text-[1.3rem] text-gray-800">
                          Xác nhận
                        </p>
                      </div>
                      <hr className="my-4 border-gray-300" />
                      <p className="text-gray-600 text-[0.95rem] text-center font-bold leading-snug">
                        Bạn chắc chắn muốn thực hiện hành động này? Hãy kiểm tra
                        kỹ trước khi xác nhận.
                      </p>
                      <div className="flex justify-center mt-6 gap-4">
                        <button
                          className="flex items-center bg-red-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-600 transition"
                          onClick={() => setShowPopupD(false)}
                        >
                          <FontAwesomeIcon icon={faX} className="mr-2" />
                          Đóng
                        </button>
                        <button
                          className="flex items-center bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                          onClick={() => handleApprovePost(selectedPostIdD)}
                        >
                          <FontAwesomeIcon icon={faCheck} className="mr-2" />
                          OK
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {showPopUpConfirm && (
                <div
                  className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50"
                  style={{ zIndex: 9999 }}
                >
                  <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-xl mx-4">
                    <div className="font-montserrat">
                      <div className="text-center">
                        <p className="font-extrabold text-[1.3rem] text-gray-800">
                          Xác nhận
                        </p>
                      </div>
                      <hr className="my-4 border-gray-300" />
                      <p className="text-gray-600 text-[0.95rem] text-center font-bold leading-snug">
                        Bạn có chắc chắn từ chối duyệt bài đăng này? Hãy kiểm
                        tra kỹ trước khi xác nhận.
                      </p>
                      <div className="flex justify-center mt-6 gap-4">
                        <button
                          className="flex items-center bg-red-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-600 transition"
                          onClick={() => setShowPopUpConfirm(false)}
                        >
                          <FontAwesomeIcon icon={faX} className="mr-2" />
                          Đóng
                        </button>
                        <button
                          className="flex items-center bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                          onClick={() => handleRefusePost(selectedPostIdD)}
                        >
                          <FontAwesomeIcon icon={faCheck} className="mr-2" />
                          OK
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {showPopUpDelete && (
                <div
                  className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50"
                  style={{ zIndex: 9999 }}
                >
                  <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-xl mx-4">
                    <div className="font-montserrat">
                      <div className="text-center">
                        <p className="font-extrabold text-[1.3rem] text-gray-800">
                          Xác nhận
                        </p>
                      </div>
                      <hr className="my-4 border-gray-300" />
                      <p className="text-gray-600 text-[0.95rem] text-center font-bold leading-snug">
                        Bạn có chắc chắn xóa bài đăng này? Hãy kiểm tra kỹ trước
                        khi xác nhận.
                      </p>
                      <div className="flex justify-center mt-6 gap-4">
                        <button
                          className="flex items-center bg-red-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-600 transition"
                          onClick={() => setShowPopUpDelete(false)}
                        >
                          <FontAwesomeIcon icon={faX} className="mr-2" />
                          Đóng
                        </button>
                        <button
                          className="flex items-center bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                          onClick={() => handleAdminDelete(selectedPostIdD)}
                        >
                          <FontAwesomeIcon icon={faCheck} className="mr-2" />
                          OK
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-between bg-white">
        {/* Profile Info */}
        <ProfileInformation
          type="personal-page"
          name={post.user.username}
          user_id={post.user.user_id}
          date={post.created_at}
          post_id={post.post_id}
        />
        <div className="flex justify-end items-center">
          <div className=" pr-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6 text-gray-500"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
            </svg>
          </div>

          <span className="text-gray-500 mr-5">
            {Math.floor(post.view_count / 2)} lượt xem
          </span>
        </div>
      </div>
    </div>
  );
}

Post.propTypes = {
  post: PropTypes.shape({
    title: PropTypes.string.isRequired,
    post_id: PropTypes.string.isRequired,
    reactions_count: PropTypes.number.isRequired,
    save_count: PropTypes.number.isRequired,
  }).isRequired,
};

Post.defaultProps = {
  post: null,
};
export default Post;
