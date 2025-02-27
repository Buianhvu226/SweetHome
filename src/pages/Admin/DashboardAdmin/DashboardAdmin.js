/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAppContext } from "../../../AppProvider";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import {
  faComment,
  faEye,
  faHeart,
  faNewspaper,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const DashboardAdmin = () => {
  const { sessionToken } = useAppContext();

  // State quản lý
  const [isAnimated, setIsAnimated] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [numReact, setNumReact] = useState(0);
  const [numComment, setNumComment] = useState(0);
  const [numView, setNumView] = useState(0);
  const [newPostsData, setNewPostsData] = useState([]);
  const [postsSummary, setPostsSummary] = useState(null);
  const [newPostInDay, setNewPostInDay] = useState(0);

  // Fetch số liệu từ API
  useEffect(() => {
    const fetchInteractions = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_SWEETHOME_API_ENDPOINT}/api/statistics?category=interactions_summary`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sessionToken}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setNumReact(data.total_reacts);
          setNumComment(data.total_comments);
          setNumView(data.total_views);
        } else {
          toast.error("Không thể tải số liệu tương tác.");
        }
      } catch (error) {
        toast.error("Lỗi kết nối khi tải số liệu tương tác.");
      }
    };

    const fetchNewPostsStatistics = async (period) => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_SWEETHOME_API_ENDPOINT}/api/statistics?category=new_posts_statistics&period=${period}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sessionToken}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setNewPostsData(data.new_posts);
        } else {
          toast.error("Không thể tải số liệu bài đăng mới.");
        }
      } catch (error) {
        toast.error("Lỗi kết nối khi tải số liệu bài đăng mới.");
      }
    };

    const fetchNewPostInDay = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_SWEETHOME_API_ENDPOINT}/api/statistics?category=new_posts_statistics&period=day`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sessionToken}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setNewPostInDay(data.new_posts[0].count);
          console.log("==========> bài mới", data.new_posts[0].count);
        } else {
          toast.error("Không thể tải số liệu bài đăng mới.");
        }
      } catch (error) {
        toast.error("Lỗi kết nối khi tải số liệu bài đăng mới.");
      }
    };

    const fetchPostsSummary = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_SWEETHOME_API_ENDPOINT}/api/statistics?category=posts_summary`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sessionToken}`,
            },
          }
        );
        const data = await response.json();
        setPostsSummary(data);
      } catch (error) {
        console.error("Error fetching posts summary data:", error);
      }
    };

    fetchPostsSummary();

    fetchInteractions();
    fetchNewPostsStatistics(selectedPeriod);
    fetchNewPostInDay();
    setIsAnimated(true);
  }, [sessionToken, selectedPeriod]);

  // Tính chiều cao tối đa của cột biểu đồ
  const getMaxHeight = () => {
    switch (selectedPeriod) {
      case "week":
        return 7;
      case "month":
        return new Date(
          new Date().getFullYear(),
          new Date().getMonth() + 1,
          0
        ).getDate(); // Số ngày trong tháng
      case "year":
        return 12; // 12 tháng
      default:
        return 1;
    }
  };

  const maxUnits = getMaxHeight();

  return (
    <div className="w-full h-full p-4">
      {/* Khu vực thống kê chính */}
      <div className="flex gap-6">
        {/* Card số người đăng ký */}
        <div className="w-1/3 bg-white p-6 rounded-lg shadow-md">
          <strong className="text-lg font-bold text-center">
            Số bài đăng mới trong ngày
          </strong>
          <div className="flex mt-4 justify-center items-center gap-5">
            <div className="">
              <p className="text-2xl font-bold text-blue-600">
                +{newPostInDay} bài đăng
              </p>
            </div>
            <FontAwesomeIcon
              icon={faNewspaper}
              className="w-16 h-16 text-blue-500"
            />
          </div>
        </div>

        {/* Card bảng thống kê */}
        <div className="w-2/3 bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center">
            <div>
              <strong className="text-lg font-bold">Bảng thống kê</strong>
              <p className="text-sm text-gray-500">
                Cập nhật gần nhất <i>{new Date().toLocaleDateString()}</i>
              </p>
            </div>
          </div>
          <div className="flex justify-between mt-8">
            {/* Số lượt thích */}
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-500 rounded-md flex justify-center items-center">
                <FontAwesomeIcon
                  icon={faHeart}
                  className="w-6 h-6 text-white"
                />
              </div>
              <div className="ml-4 font-semibold">
                <strong>Số lượt thích</strong>
                <p className="text-red-500">{numReact} +</p>
              </div>
            </div>
            {/* Số lượt bình luận */}
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-500 rounded-md flex justify-center items-center">
                <FontAwesomeIcon
                  icon={faComment}
                  className="w-6 h-6 text-white"
                />
              </div>
              <div className="ml-4 font-semibold">
                <strong>Số lượt bình luận</strong>
                <p className="text-blue-500">{numComment} +</p>
              </div>
            </div>
            {/* Số lượt xem */}
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-500 rounded-md flex justify-center items-center">
                <FontAwesomeIcon icon={faEye} className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4 font-semibold">
                <strong>Số lượt xem</strong>
                <p className="text-yellow-500">{numView} +</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Biểu đồ số lượng bài đăng */}
      <div className="flex justify-between">
        <div className="bg-white w-[55%] p-6 mt-6 rounded-lg shadow-md overflow-auto relative">
          {/* Chú thích ở góc phải bên trên */}
          <div className="absolute top-5 right-2 bg-gray-100 text-xs text-gray-700 p-2 rounded-md shadow">
            <span>Biểu đồ số lượng bài đăng theo thời gian</span>
          </div>

          <strong className="text-lg font-bold">Số lượng bài đăng</strong>
          <div className="flex justify-between mt-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border p-2 rounded-md"
            >
              <option value="week">Tuần</option>
              <option value="month">Tháng</option>
              <option value="year">Năm</option>
            </select>
          </div>
          <div className="flex justify-between items-end h-[16.5rem] mt-6">
            {Array.from({ length: maxUnits }).map((_, index) => {
              const unitData = newPostsData.find((post) => {
                const date = new Date(post.period);
                switch (selectedPeriod) {
                  case "week":
                    return date.getDay() === index;
                  case "month":
                    return date.getDate() === index + 1;
                  case "year":
                    return date.getMonth() === index;
                  default:
                    return false;
                }
              });

              const count = unitData ? unitData.count : 0;
              const height =
                (count / Math.max(...newPostsData.map((p) => p.count), 1)) *
                200; // Tính chiều cao

              return (
                <div
                  key={index}
                  className="flex flex-col items-center relative group"
                >
                  {/* Hiển thị số lượng trên đầu cột */}
                  <span className="absolute -top-6 text-sm text-gray-700 font-medium">
                    {count}
                  </span>

                  <div
                    className={`w-8 bg-blue-400 transition-all duration-1000 ease-out transform ${
                      isAnimated ? "scale-y-100" : "scale-y-0"
                    } group-hover:bg-blue-600`}
                    style={{ height: `${height}px` }}
                    title={`Lượt: ${count}`} // Tooltip hiển thị số liệu
                  ></div>

                  {/* Nhãn trục X */}
                  <span className="mt-2 text-sm">
                    {selectedPeriod === "day"
                      ? `${index}:00`
                      : selectedPeriod === "week"
                      ? ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][index]
                      : selectedPeriod === "month"
                      ? index + 1
                      : [
                          "Th1",
                          "Th2",
                          "Th3",
                          "Th4",
                          "Th5",
                          "Th6",
                          "Th7",
                          "Th8",
                          "Th9",
                          "Th10",
                          "Th11",
                          "Th12",
                        ][index]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tròn */}
        <div className="bg-white w-[42.5%] p-6 mt-6 rounded-lg shadow-md overflow-auto relative">
          {postsSummary && (
            <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6">
              {/* Biểu đồ tròn loại bài đăng */}
              <motion.div
                className="w-full md:w-1/2"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
              >
                <h3 className="text-md font-semibold mb-2">
                  Phân loại bài đăng
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Bán nhà", value: postsSummary.house_posts },
                        { name: "Bán đất", value: postsSummary.land_posts },
                      ]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      fill="#8884d8"
                      label
                      isAnimationActive={isAnimated}
                      animationDuration={2000}
                      animationEasing="ease-out"
                    >
                      {[
                        { name: "Nhà", value: postsSummary.house_posts },
                        { name: "Đất", value: postsSummary.land_posts },
                      ].map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Biểu đồ tròn trạng thái bài đăng */}
              <motion.div
                className="w-full md:w-1/2"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                <h3 className="text-md font-semibold mb-2">
                  Trạng thái bài đăng
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        {
                          name: "Đã duyệt",
                          value:
                            postsSummary.total_posts -
                            postsSummary.rejected_posts,
                        },
                        {
                          name: "Bị từ chối",
                          value: postsSummary.rejected_posts,
                        },
                      ]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      fill="#82ca9d"
                      label
                      isAnimationActive={isAnimated}
                      animationDuration={2000}
                      animationEasing="ease-out"
                    >
                      {[
                        {
                          name: "Đã duyệt",
                          value:
                            postsSummary.total_posts -
                            postsSummary.rejected_posts,
                        },
                        {
                          name: "Bị từ chối",
                          value: postsSummary.rejected_posts,
                        },
                      ].map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[(index + 2) % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;
