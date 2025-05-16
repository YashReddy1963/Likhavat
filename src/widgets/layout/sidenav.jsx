import PropTypes from "prop-types";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  Avatar,
  Button,
  IconButton,
  Typography,
} from "@material-tailwind/react";
import { useMaterialTailwindController, setOpenSidenav } from "@/context";
import { useEffect, useState } from "react";
import axios from "axios";
import isProfileComplete from "../../configs/profile-details-check"
import api from "@/configs/api";
import { UpdateProfileModal } from "../cards";

export function Sidenav({ brandImg, brandName, routes }) {

  //for checking all profile fields are present or not
  const [profileData, setProfileData] = useState({
    id:"",
    firstName: "",
    email: "",
    bio: "",
    social: {
      twitter: "",
      linkedin: "",
      github: "",
    },
    profileImage: null,
    bannerImage: null,
  })

  const[showModal, setShowModal] = useState(false)
  const navigate = useNavigate()
  const [unseenCount, setUnseenCount] = useState("")
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavColor, sidenavType, openSidenav } = controller;
  const sidenavTypes = {
    dark: "bg-gradient-to-br from-gray-800 to-gray-900",
    white: "bg-white shadow-sm",
    transparent: "bg-transparent",
  }

  useEffect(() => {
    const fetchProfile = async () => {
      //fetching user profile detials
      try {
        const response = await api.get("profile/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        })
        const data = response.data
        setProfileData({
          firstName: data.name || "",
          email: data.email || "",
          bio: data.bio || "",
          social: data.social_links || {
            twitter: "",
            linkedin: "",
            github: "",
          },
          profileImage: data.profile_image || null,
          bannerImage: data.banner_image || null,
        })
      } catch (err) {
        console.error("Failed to fetch profile data:", err);
      }
    }

    fetchProfile();
  }, [])

  useEffect(() => {
    const fetchUnseenCount = async() => {
      try {
        const response = await axios.get("http://localhost:8000/api/blogs/notifications/unseen-count/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        setUnseenCount(response.data.count);
      } catch (err) {
        console.error("Failed to fetch unseen count: ", err);
      }
    }

    fetchUnseenCount()
  }, [])

  return (
    <aside
      className={`${sidenavTypes[sidenavType]} ${
        openSidenav ? "translate-x-0" : "-translate-x-80"
      } fixed inset-0 z-50 my-4 ml-4 h-[calc(100vh-32px)] w-72 rounded-xl transition-transform duration-300 xl:translate-x-0 border border-blue-gray-100`}
    >
      <div
        className={`relative`}
      >
        <Link to="/" className="py-6 px-8 text-center">
          <Typography
            variant="h6"
            color={sidenavType === "dark" ? "white" : "blue-gray"}
          >
            {brandName}
          </Typography>
        </Link>
        <IconButton
          variant="text"
          color="white"
          size="sm"
          ripple={false}
          className="absolute right-0 top-0 grid rounded-br-none rounded-tl-none xl:hidden"
          onClick={() => setOpenSidenav(dispatch, false)}
        >
          <XMarkIcon strokeWidth={2.5} className="h-5 w-5 text-white" />
        </IconButton>
      </div>
      <div className="m-4">
        {routes.map(({ layout, title, pages }, key) => (
          <ul key={key} className="mb-4 flex flex-col gap-1">
            {title && (
              <li className="mx-3.5 mt-4 mb-2">
                <Typography
                  variant="small"
                  color={sidenavType === "dark" ? "white" : "blue-gray"}
                  className="font-black uppercase opacity-75"
                >
                  {title}
                </Typography>
              </li>
            )}
            {pages.map(({ icon, name, path }) => {
              const isNotifications = name === "notifications";
              const isActive = location.pathname.includes(path);
            
              return (
                <li key={name} className="relative">
                    <Button
                      onClick={(e) => {
                        e.preventDefault()
                        if (isProfileComplete(profileData)){
                          navigate(`/${layout}${path}`)
                        } else {
                          setShowModal(true)
                        }
                      }}
                      variant={isActive ? "gradient" : "text"}
                      color={
                        isActive
                          ? sidenavColor
                          : sidenavType === "dark"
                          ? "white"
                          : "blue-gray"
                      }
                      className="flex items-center gap-4 px-4 capitalize"
                      fullWidth
                    >
                      {icon}
                      <Typography
                        color="inherit"
                        className="font-medium capitalize"
                      >
                        {name}
                      </Typography>
                      {isNotifications && unseenCount > 0 && (
                        <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                          {unseenCount}
                        </span>
                      )}
                    </Button>
                </li>
              );
            })}
          </ul>
        ))}
      </div>
      <UpdateProfileModal isOpen={showModal} onClose={() => setShowModal(false)}/>
    </aside>
  );
}

Sidenav.defaultProps = {
  brandImg: "/img/logo-ct.png",
  brandName: "Likhavat",
};

Sidenav.propTypes = {
  brandImg: PropTypes.string,
  brandName: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

Sidenav.displayName = "/src/widgets/layout/sidnave.jsx";

export default Sidenav;
