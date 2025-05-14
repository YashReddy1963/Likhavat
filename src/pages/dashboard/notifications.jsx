import React, { useEffect, useState } from "react";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  Chip,
} from "@material-tailwind/react";
import axios from "axios";
import { Link } from "react-router-dom";

export function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [recommendedBlogs, setRecommendedBlogs] = useState([]);
  const BackendUrl = "http://localhost:8000";

  useEffect(() => {
    const fetchNotificationsAndRecommendations = async () => {
      try {

        const recommendRes = await axios.get(`${BackendUrl}/api/blogs/recommendations/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        setRecommendedBlogs(recommendRes.data);

        
        const notifRes = await axios.get(`${BackendUrl}/api/blogs/notifications/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        setNotifications(notifRes.data);

        await axios.post(`${BackendUrl}/api/blogs/notifications/mark-seen/`, {}, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
      } catch (err) {
        console.error("Failed to fetch notifications or recommendations: ", err);
      }
    };

    fetchNotificationsAndRecommendations();
  }, []);

  return (
    <div className="mx-auto my-20 flex max-w-screen-lg flex-col gap-8">
      
      <Card>
        <CardHeader
          color="transparent"
          floated={false}
          shadow={false}
          className="m-0 p-4"
        >
          <Typography variant="h5" color="blue-gray">
            Alerts
          </Typography>
        </CardHeader>
        <CardBody className={`flex flex-col gap-4 ${
          notifications.length > 5 ? "max-h-[400px] overflow-y-auto pr-2" : ""
        }`}>
        {notifications
          .filter(notification =>
            notification.type === "NEW_FOLLOWER" || notification.type === "NEW_BLOG"
          )
          .map((notification) => (
            <div
              key={notification.id}
              className="border p-4 rounded-md shadow-sm flex justify-between items-center"
            >
              <div>
                {notification.type === "NEW_FOLLOWER" ? (
                  <div className="flex gap-3">
                    <img
                      src={`${BackendUrl}${notification.initiator_profile_image}`}
                      alt={notification.initiator_profile_image}
                      className="w-24 object-cover mb-6 rounded-lg"
                    />
                    <div>
                      <Typography variant="h6" color="blue-gray">
                      {notification.initiator_name} started following you
                      </Typography>
                      <Typography variant="small" color="gray">
                      New follower
                    </Typography>
                    </div>  
                  </div>
                ) : (
                  <div className="flex gap-3">
                     <img
                        src={`${BackendUrl}${notification.blog_cover_image}`}
                        alt={notification.blog_cover_image}
                        className="w-24 object-cover mb-6 rounded-lg"
                      />
                      <div>
                        <Link to={`/dashboard/blog/${notification.blog_id}`}>
                        <Typography variant="h6" color="blue-gray" className="hover:text-blue-gray-600">
                          {notification.blog_title}
                        </Typography>
                        </Link>
                        <Typography variant="small" color="blue-gray">
                          New blog from someone you follow
                        </Typography>
                      </div>
                    
                  </div>
                )}
              </div>
              <Chip
                value={
                  notification.type === "NEW_BLOG"
                    ? "New blog"
                    : "New follower"
                }
                color={
                  notification.type === "NEW_BLOG"
                    ? "blue"
                    : "green"
                }
                className="text-xs font-semibold"
              />
            </div>
        ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          color="transparent"
          floated={false}
          shadow={false}
          className="m-0 p-4"
        >
          <Typography variant="h5" color="blue-gray">
            Blogs that Interests You!!
          </Typography>
        </CardHeader>
        <CardBody className={`flex flex-col gap-4 ${
          recommendedBlogs.length > 5 ? "max-h-[400px] overflow-y-auto pr-2" : ""
        }`}>
        {recommendedBlogs.map((blog) => (
            <div
              key={blog.id}
              className="border p-4 rounded-md shadow-sm flex justify-between items-center"
            >
              <div className="flex gap-3">
                <img
                  src={`${BackendUrl}${blog.cover_image}`}
                  alt={blog.cover_image}
                  className="w-24 object-cover mb-6 rounded-lg"
                />
                <div>
                  <Link to={`/dashboard/blog/${blog.id}`}>
                    <Typography variant="h6" color="blue-gray" className="hover:text-blue-gray-600">
                        {blog.title}
                    </Typography>
                  </Link>
                  <Typography variant="small" color="blue-gray">
                      By - {blog.author_name}
                  </Typography>
                </div>
              </div>
              <Chip
                value="Recommendation"
                color="orange"
                className="text-xs font-semibold"
              />
            </div>
        ))}
        </CardBody>
      </Card>

    </div>
  );
}

export default Notifications;
