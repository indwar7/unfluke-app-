import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import io from "socket.io-client";
import { useSelector } from "react-redux";
import {
  getNotifications,
  postReadNotifications,
} from "../../../Unfluke_helpers/backend_helper";
import moment from "moment";
import parse from "html-react-parser";
import { createSelector } from "reselect";

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [displayedNotifications, setDisplayedNotifications] = useState([]);
  const [badge, setBadge] = useState(false);
  const [page, setPage] = useState(1);
  const bellRef = useRef(null);
  const dropdownRef = useRef(null);

  const auth = createSelector(
    (state) => state.Login,
    (data) => data.user,
  );
  const user = useSelector(auth);

  // Close dropdown on outside click
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        bellRef.current &&
        !bellRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Load notifications and socket
  useEffect(() => {
    if (user._id !== undefined) {
      loadNotifications();

      const socket = io(process.env.REACT_APP_BACKEND_URL, {
        transports: ["websocket"],
        query: { userID: user._id },
      });

      socket.emit("setSocketId", user._id);

      socket.on("new-notification", (data) => {
        if (data && data.notification.userID === user._id) {
          const tmp = [data.notification, ...notifications];
          setNotifications(tmp);
          setDisplayedNotifications(tmp.slice(0, 10));
          setBadge(true);
        }
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [user]);

  const loadNotifications = () => {
    getNotifications({ userID: user._id }).then((data) => {
      if (data) {
        setNotifications(data);
        const initial = data.filter((n) => !n.is_read).slice(0, 10);
        setDisplayedNotifications(initial.length ? initial : data.slice(0, 10));
        if (data.some((n) => !n.is_read)) {
          setBadge(true);
        }
      }
    });
  };

  const readNotifications = () => {
    postReadNotifications({ userID: user._id }).then((data) => {
      if (data) {
        setBadge(false);
      }
    });
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    readNotifications();
  };

  const loadMore = () => {
    const nextPage = page + 1;
    const newData = notifications.slice(0, nextPage * 10);
    setDisplayedNotifications(newData);
    setPage(nextPage);
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="relative rounded-full px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <i
          ref={bellRef}
          className="bx bx-bell text-xl text-gray-500 dark:text-gray-500"
        ></i>
        {badge && (
          <span className="absolute -top-1 -right-1 h-4 w-4 text-xs font-semibold flex items-center justify-center bg-blue-600 text-white rounded-full">
            {notifications.filter((n) => !n.is_read).length}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute transition-all duration-300 ease-in-out right-0 z-50 mt-2 w-80 bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-white">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Notifications</h3>
              {badge && (
                <span className="text-xs bg-white text-black px-2 py-1 rounded-full">
                  {notifications.filter((n) => !n.is_read).length} New
                </span>
              )}
            </div>
          </div>

          <div className="custom-scrollbar max-h-72 overflow-y-auto p-4 space-y-3">
            {displayedNotifications.map((notification, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg ${
                  notification.content.includes("Alert")
                    ? "bg-blue-50 dark:bg-blue-900"
                    : "bg-gray-50 dark:bg-gray-800"
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${
                      notification.content.includes("Alert")
                        ? "bg-blue-500"
                        : "bg-gray-400"
                    }`}
                  ></div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {notification.content.includes("Alert")
                        ? "Alert"
                        : "Message"}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      {parse(notification.content)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {moment(notification.createdAt).fromNow()}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {notifications.length > displayedNotifications.length && (
              <div className="text-center">
                <button
                  onClick={loadMore}
                  className="text-sm text-blue-600 hover:underline mt-2"
                >
                  View More →
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
