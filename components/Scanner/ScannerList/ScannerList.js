import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Container } from "reactstrap";
import { useSelector } from "react-redux";
import { ChevronRight, Eye, Plus } from "lucide-react";
import axios from "axios";

const ScannerList = ({ alerts }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { category, scanners: fallbackScanners, type } = location.state || {};
  const [scanners, setScanners] = useState([]);
  const [displayedScanners, setDisplayedScanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const totalItems = displayedScanners.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const [subUrl, setSubUrl] = useState("");
  const globalState = useSelector((store) => store.Layout);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640); // <640px = Tailwind "sm"
    };

    handleResize(); // check on mount
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (globalState?.appType) setSubUrl(globalState.appType);
  }, [globalState]);

  useEffect(() => {
    const fetchScanners = async () => {
      setLoading(true);
      setDisplayedScanners([]);
      setCurrentPage(1);

      try {
        const response = await axios.get(
          `/${subUrl}/scanner/getAdminScannersByCategory`,
          { params: { category, limit: 1000, page: 1 } },
        );

        const all =
          Array.isArray(response.data) && response.data.length
            ? response.data
            : fallbackScanners || [];

        setScanners(all);

        // progressive render
        let idx = 0;
        const CHUNK = 5;
        const timer = setInterval(() => {
          setDisplayedScanners((prev) => [
            ...prev,
            ...all.slice(idx, idx + CHUNK),
          ]);
          idx += CHUNK;
          if (idx >= all.length) {
            clearInterval(timer);
            setLoading(false);
          }
        }, 100);
      } catch {
        setScanners(fallbackScanners || []);
        setDisplayedScanners(fallbackScanners || []);
        setLoading(false);
      }
    };

    if (category) {
      fetchScanners();
    } else {
      setScanners(fallbackScanners || []);
      setDisplayedScanners(fallbackScanners || []);
      setLoading(false);
    }
  }, [category, subUrl]);

  const getInitials = (name) =>
    name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("");

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return pages;
  };

  const ScannerSkeleton = () => (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
      <div className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-white dark:bg-gray-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
          <div className="flex flex-col gap-2">
            <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-content rounded-lg m-0 pt-24 px-2 sm:px-8 md:px-16 lg:px-6">
      <Container fluid>
        <div className="flex flex-col justify-between sm:flex-row">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 max-sm:pb-2 gap-4">
            <div className="mb-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {category || "Scanners"}
              </h1>
              <p className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                Pages <ChevronRight className="w-4 h-4 mx-1" /> Scanners
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 mb-4">
            <button
              className="flex border font-semibold rounded-md px-3 py-2 border-gray-300 dark:border-gray-500"
              onClick={() =>
                navigate(
                  !alerts
                    ? `/${subUrl}/scanner-home`
                    : `/${subUrl}/alerts-home`,
                )
              }
            >
              <Eye className="w-4 mr-2" />
              View saved
            </button>
            <button
              className="flex px-3 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() =>
                navigate(!alerts ? `/${subUrl}/scanner` : `/${subUrl}/alerts`)
              }
            >
              <Plus className="w-4 mr-2" />
              Create new
            </button>
          </div>
        </div>

        {loading && displayedScanners.length === 0 ? (
          <div className="flex border rounded-lg bg-white p-4 dark:bg-gray-800 flex-col gap-3">
            {[...Array(5)].map((_, i) => (
              <ScannerSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            <div className="flex border rounded-lg bg-white p-4 dark:bg-gray-800 flex-col gap-3">
              {displayedScanners
                .slice(
                  (currentPage - 1) * itemsPerPage,
                  currentPage * itemsPerPage,
                )
                .map((scanner) => (
                  <div
                    key={scanner._id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          type === "technical"
                            ? `/${subUrl}/scanner`
                            : `/${subUrl}/scanner-funda`,
                          { state: scanner },
                        )
                      }
                      className="w-full text-left flex items-center justify-between px-4 py-3 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 shrink-0 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold text-lg">
                          {getInitials(scanner.name)}
                        </div>

                        <div className="flex flex-col">
                          <span className="text-base font-semibold text-gray-900 dark:text-white">
                            {scanner.name}
                          </span>

                          <span className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 sm:line-clamp-2 md:line-clamp-3">
                            {scanner.description}
                          </span>
                        </div>
                      </div>
                    </button>
                  </div>
                ))}
            </div>

            {totalPages > 1 && (
              <div className="flex flex-col md:flex-row items-center justify-between mt-4 pt-2 pb-3 text-sm gap-3">
                <div className="text-gray-500 dark:text-gray-300">
                  Showing{" "}
                  <span className="font-semibold ml-1">
                    {Math.min(currentPage * itemsPerPage, totalItems)}
                  </span>{" "}
                  of <span className="font-semibold">{totalItems}</span> Results
                </div>

                <ul className="flex items-center gap-1 flex-wrap overflow-x-auto max-w-full px-1">
                  <li>
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-2 py-1 text-sm rounded-md border whitespace-nowrap ${
                        currentPage === 1
                          ? "bg-gray-200 text-gray-400 dark:bg-gray-900 dark:text-white cursor-not-allowed"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      Previous
                    </button>
                  </li>

                  {(() => {
                    const pages = [];
                    const showMaxButtons = 4; // tweak for 360px safety

                    const startEllipsis = (
                      <li key="start-ellipsis">
                        <span className="px-1 text-gray-400">...</span>
                      </li>
                    );
                    const endEllipsis = (
                      <li key="end-ellipsis">
                        <span className="px-1 text-gray-400">...</span>
                      </li>
                    );

                    if (totalPages <= showMaxButtons) {
                      for (let i = 1; i <= totalPages; i++) pages.push(i);
                    } else {
                      if (currentPage <= 2) {
                        pages.push(1, 2, "end-ellipsis", totalPages);
                      } else if (currentPage >= totalPages - 1) {
                        pages.push(
                          1,
                          "start-ellipsis",
                          totalPages - 1,
                          totalPages,
                        );
                      } else {
                        pages.push(
                          1,
                          "start-ellipsis",
                          currentPage,
                          "end-ellipsis",
                          totalPages,
                        );
                      }
                    }

                    return pages.map((page) => {
                      if (page === "start-ellipsis") return startEllipsis;
                      if (page === "end-ellipsis") return endEllipsis;

                      return (
                        <li key={page}>
                          <button
                            onClick={() => goToPage(page)}
                            className={`px-2 py-1 text-sm rounded-md border whitespace-nowrap ${
                              currentPage === page
                                ? "bg-blue-500 text-white"
                                : "hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                          >
                            {page}
                          </button>
                        </li>
                      );
                    });
                  })()}

                  <li>
                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-2 py-1 text-sm rounded-md border whitespace-nowrap ${
                        currentPage === totalPages
                          ? "bg-gray-200 text-gray-400 dark:bg-gray-900 dark:text-white cursor-not-allowed"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </>
        )}
      </Container>
    </div>
  );
};

export default ScannerList;
