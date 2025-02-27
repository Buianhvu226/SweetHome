import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAppContext } from "../../AppProvider";
import { LazyLoadImage } from "react-lazy-load-image-component";

const ImageCard = ({ postId, type, auth }) => {
  const [images, setImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const { sessionToken } = useAppContext();

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_SWEETHOME_API_ENDPOINT}/api/posts/${postId}/images/`
        );

        if (Array.isArray(response.data)) {
          setImages(response.data);
        } else {
          console.error("Dữ liệu không phải là một mảng:", response.data);
          setImages([]);
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu ảnh:", error);
      }
    };

    fetchImages();
  }, [postId]);

  useEffect(() => {
    if (type === "detail" && images.length > 1) {
      const id = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 5000);
      setIntervalId(id);

      return () => clearInterval(id);
    }
  }, [images.length, type]);

  const handlePrevClick = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const handleNextClick = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handleThumbnailClick = (index) => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setCurrentImageIndex(index);
  };

  const handleDeleteAllImages = async () => {
    setShowPopup(false);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SWEETHOME_API_ENDPOINT}/api/posts/${postId}/images/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${sessionToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        alert("Xóa ảnh thành công !");
        window.location.reload();
      } else {
        console.error("Failed to delete the post");
        alert("Xóa ảnh thất bại !");
        window.location.reload();
      }
    } catch (error) {
      console.error("Lỗi khi xóa ảnh:", error);
    }
  };

  return (
    <>
      {type === "detail" && images.length > 1 ? (
        /* Mã cho chế độ chi tiết */
        <div
          className="relative border-[1px] border-double border-gray-400 rounded-lg p-4 my-4 max-h-full font-extrabold shadow-md overflow-hidden"
          style={{
            backgroundImage: `url(${process.env.REACT_APP_SWEETHOME_API_ENDPOINT}${images[currentImageIndex].image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Lớp phủ mờ */}
          <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <div className="flex justify-between">
              <h4 className="text-white text-sm mb-2">
                Hình ảnh mô tả ({images.length})
              </h4>
              {auth === "owner" && (
                <>
                  <button
                    className="text-sm mb-2 text-white bg-gradient-to-r from-red-500 to-red-400 font-semibold w-[6rem] px-1 py-1 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-300"
                    onClick={() => setShowPopup(true)}
                  >
                    Xóa ảnh
                  </button>
                  {showPopup && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                        <h2 className="text-xl font-bold mb-4">Xác nhận xóa</h2>
                        <p className="mb-4">
                          Bạn có chắc chắn muốn xóa toàn bộ ảnh?
                        </p>
                        <div className="flex justify-center space-x-4">
                          <button
                            className="bg-red-500 text-white px-4 py-2 rounded-lg"
                            onClick={handleDeleteAllImages}
                          >
                            Xóa
                          </button>
                          <button
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
                            onClick={() => setShowPopup(false)}
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="flex justify-center items-center">
              {images.map((image, index) => (
                <div
                  key={image.image_id}
                  className={`${
                    index === currentImageIndex ? "block" : "hidden"
                  }`}
                >
                  <LazyLoadImage
                    src={`${process.env.REACT_APP_SWEETHOME_API_ENDPOINT}${image.image}`}
                    alt={`Ảnh của bài đăng: ${image.post_id}`}
                    className="rounded-lg w-[50rem] h-[30rem] object-contain shadow-2xl bg-black"
                  />
                </div>
              ))}
              <button
                className="absolute left-0 bg-gray-500 opacity-50 hover:opacity-100 text-white px-2.5 py-2 rounded-full focus:outline-none z-20"
                onClick={handlePrevClick}
              >
                &#9664;
              </button>
              <button
                className="absolute right-0 bg-gray-500 opacity-50 hover:opacity-100 text-white px-2.5 py-2 rounded-full focus:outline-none z-20"
                onClick={handleNextClick}
              >
                &#9654;
              </button>
            </div>
            {/* Thumbnails */}
            <div className="flex justify-center mt-4 space-x-2">
              {images.map((image, index) => (
                <div
                  key={image.image_id}
                  className="cursor-pointer"
                  onClick={() => handleThumbnailClick(index)}
                >
                  <LazyLoadImage
                    src={`${process.env.REACT_APP_SWEETHOME_API_ENDPOINT}${image.image}`}
                    alt={`Ảnh của bài đăng: ${image.post_id}`}
                    className={`rounded-lg w-[5rem] h-[3rem] object-contain shadow-2xl bg-black ${
                      index === currentImageIndex
                        ? "border-2 border-blue-500"
                        : ""
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Mã cho chế độ thông thường */
        <div
          className="relative rounded-lg p-4 my-4 max-h-[35rem] font-extrabold shadow-md overflow-hidden"
          style={{
            backgroundImage:
              images.length > 0
                ? `url(${process.env.REACT_APP_SWEETHOME_API_ENDPOINT}${images[currentImageIndex].image})`
                : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Lớp phủ mờ */}
          {images.length > 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>
          )}
          <div className="relative z-5">
            <div className="flex justify-between">
              <h4 className="text-white text-sm mb-2">
                Hình ảnh mô tả ({images.length})
              </h4>
              {auth === "owner" && images.length > 0 && (
                <>
                  <button
                    className="text-sm mb-2 text-white bg-gradient-to-r from-red-500 to-red-400 font-semibold w-[6rem] px-1 py-1 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-300"
                    onClick={() => setShowPopup(true)}
                  >
                    Xóa ảnh
                  </button>
                  {showPopup && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                        <h2 className="text-xl font-bold mb-4">Xác nhận xóa</h2>
                        <p className="mb-4">
                          Bạn có chắc chắn muốn xóa toàn bộ ảnh?
                        </p>
                        <div className="flex justify-center space-x-4">
                          <button
                            className="bg-red-500 text-white px-4 py-2 rounded-lg"
                            onClick={handleDeleteAllImages}
                          >
                            Xóa
                          </button>
                          <button
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
                            onClick={() => setShowPopup(false)}
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="flex justify-center">
              {images.length > 0 ? (
                <div className="flex flex-col items-center">
                  <div
                    key={images[currentImageIndex].image_id}
                    className="flex justify-center mb-4"
                  >
                    <LazyLoadImage
                      src={`${process.env.REACT_APP_SWEETHOME_API_ENDPOINT}${images[currentImageIndex].image}`}
                      alt={`Ảnh của bài đăng: ${images[currentImageIndex].post_id}`}
                      className="rounded-lg w-auto h-[20rem] object-contain shadow-2xl bg-black"
                    />
                  </div>
                  {images.length > 1 && (
                    <div className="flex justify-center space-x-2">
                      {images.slice(0, 5).map((image, index) => (
                        <div
                          key={image.image_id}
                          className="flex justify-center cursor-pointer"
                          onClick={() => handleThumbnailClick(index)}
                        >
                          <LazyLoadImage
                            src={`${process.env.REACT_APP_SWEETHOME_API_ENDPOINT}${image.image}`}
                            alt={`Ảnh của bài đăng: ${image.post_id}`}
                            className={`rounded-lg w-[5rem] h-[3rem] object-contain shadow-2xl bg-black ${
                              index === currentImageIndex
                                ? "border-2 border-blue-500"
                                : ""
                            }`}
                          />
                        </div>
                      ))}
                      {images.length > 5 && (
                        <div className="flex items-center justify-center w-[7rem] h-[5rem] bg-gray-300 rounded-lg">
                          <span className="text-gray-700 font-bold">
                            +{images.length - 5}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <h2>Không có ảnh nào ...</h2>
                  <LazyLoadImage
                    src="https://th.bing.com/th/id/OIP.lrbE4OifoZsRx2TmPb0wvwAAAA?rs=1&pid=ImgDetMain"
                    alt="Không có ảnh nào ..."
                    className="rounded-lg w-[30rem] h-[15rem] object-contain"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageCard;
