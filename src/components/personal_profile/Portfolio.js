import { useParams } from "react-router-dom";
import { useAppContext } from "../../AppProvider";
import Post from "../../components/item_post/Post";
import Pagination from "../../components/pagination/pagination";
import Panel from "../../components/panel/Panel";
import { useEffect, useState } from "react";

export default function Portfolio() {
  const { sessionToken, id } = useAppContext();
  const { userId } = useParams();

  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState(
    localStorage.getItem("filterStatus") || "Đã duyệt"
  );
  const itemsPerPage = 10;

  const totalPages = Math.ceil(posts.length / itemsPerPage);

  const currentPosts = posts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    localStorage.setItem("filterStatus", status);
    setCurrentPage(1);
    window.location.reload();
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        let author = userId;
        if (userId === undefined) {
          author = id;
        }

        let url;
        if (filterStatus === "Đã duyệt") {
          url = `${process.env.REACT_APP_SWEETHOME_API_ENDPOINT}/api/posts/${author}/`;
        }
        if (filterStatus === "Đang chờ duyệt" && id === author) {
          url = `${process.env.REACT_APP_SWEETHOME_API_ENDPOINT}/api/pending-posts/${id}/`;
        }
        if (filterStatus === "Đã lưu") {
          if (author !== "") {
            url = `${process.env.REACT_APP_SWEETHOME_API_ENDPOINT}/api/saved-posts/${author}/`;
          } else {
            url = `${process.env.REACT_APP_SWEETHOME_API_ENDPOINT}/api/saved-posts/${id}/`;
          }
        }
        if (filterStatus === "Đang thương lượng") {
          url = `${process.env.REACT_APP_SWEETHOME_API_ENDPOINT}/api/user-negotiations/?type=author`;
        }
        if (filterStatus === "Đang tham gia thương lượng") {
          url = `${process.env.REACT_APP_SWEETHOME_API_ENDPOINT}/api/user-negotiations/?type=negotiator`;
        }

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${sessionToken}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        console.log("Post data:", data);

        setPosts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
      }
    };

    fetchPosts();
  }, [sessionToken, id, filterStatus, userId]);

  return (
    <div className=" p-1 mt-3 rounded-lg">
      <div className="flex flex-row justify-center gap-5 border-b-[2px] border-solid border-gray-400 overflow-x-auto">
        <h2 className="text-md font-bold mb-4">
          <button
            className={`text-black text-sm ${
              filterStatus === "Đã duyệt" ? "underline text-blue-500" : ""
            }`}
            onClick={() => handleFilterChange("Đã duyệt")}
          >
            Bài đăng đã duyệt
          </button>
        </h2>
        <h2 className="text-md font-bold mb-4">
          <button
            className={`text-black text-sm ${
              filterStatus === "Đã lưu" ? "underline text-blue-500" : ""
            }`}
            onClick={() => handleFilterChange("Đã lưu")}
          >
            Bài đăng đã lưu
          </button>
        </h2>
        {!userId && (
          <div className="flex flex-row gap-5">
            <h2 className="text-md font-bold mb-4">
              <button
                className={`text-black text-sm ${
                  filterStatus === "Đang chờ duyệt"
                    ? "underline text-blue-500"
                    : ""
                }`}
                onClick={() => handleFilterChange("Đang chờ duyệt")}
              >
                Bài đăng chờ duyệt
              </button>
            </h2>

            <h2 className="text-md font-bold mb-4">
              <button
                className={`text-black text-sm ${
                  filterStatus === "Đang thương lượng"
                    ? "underline text-blue-500"
                    : ""
                }`}
                onClick={() => handleFilterChange("Đang thương lượng")}
              >
                Bài đăng đang thương lượng
              </button>
            </h2>

            <h2 className="text-md font-bold mb-4">
              <button
                className={`text-black text-sm ${
                  filterStatus === "Đang tham gia thương lượng"
                    ? "underline text-blue-500"
                    : ""
                }`}
                onClick={() => handleFilterChange("Đang tham gia thương lượng")}
              >
                Bài đăng đang tham gia thương lượng
              </button>
            </h2>
          </div>
        )}
      </div>

      <Panel className="flex flex-col max-h-full" type="personal-page">
        <div className=" h-full overflow-y-auto grid grid-cols-1 gap-4">
          {currentPosts.map((post, index) => (
            <div key={index} className="">
              <Post post={post} type="personal-page" />
            </div>
          ))}
        </div>

        {posts.length > 0 ? (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        ) : (
          <div className="text-center text-gray-600 font-bold">
            Không có bài đăng nào
          </div>
        )}
      </Panel>
    </div>
  );
}
