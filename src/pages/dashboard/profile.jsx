import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Avatar,
  Typography,
  Tabs,
  TabsHeader,
  Tab,
  Switch,
  Tooltip,
  Button,
} from "@material-tailwind/react";
import {
  HomeIcon,
  ChatBubbleLeftEllipsisIcon,
  Cog6ToothIcon,
  PencilIcon,
} from "@heroicons/react/24/solid";
import { Link, useNavigate } from "react-router-dom";
import { ProfileInfoCard, MessageCard } from "@/widgets/cards";
import { EditProfileForm } from "@/widgets/forms";
import { platformSettingsData, conversationsData, projectsData } from "@/data";
import { useState, useEffect } from "react";
import axios from "axios";
import api from "@/configs/api";

export function Profile() {
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const BackendUrl = "http://localhost:8000"
  const [blogs, setBlogs] = useState([])
  const [profileData, setProfileData] = useState({
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
  
  const stripHTML = (html) =>{
    const div = document.createElement("div")
    div.innerHTML = html
    return div.textContent || div.innerHTML || ""
  }

  useEffect(() => {
    const fetchProfile = async () => {
      //fetching user profile detials
      try {
        const response = await api.get("profile/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });

        const data = response.data;
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

      //fetching blogs created by user
      axios.get("http://localhost:8000/api/userblog/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })
      .then((res) => {
        setBlogs(res.data);
      })
      .catch((err) => {
        console.log("Failed to fetch blogs: ", err);
      });
    }

    fetchProfile();
  }, []);

  const handleLogout = async (e)=>{
    e.preventDefault()

    const refreshToken = localStorage.getItem("refreshToken")

    try{
      await axios.post("http://localhost:8000/api/logout/",{
        refresh: refreshToken,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }
    )
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    navigate("/auth/sign-in")
    } catch (error){
      console.log("Lougout failed: ", error.response?.data || error.message)
    }
  }

  return (
    <>
      <div className="relative mt-8 h-72 w-full overflow-hidden rounded-xl bg-cover	bg-center" alt="bannerImg" style={{
        backgroundImage: `url(${BackendUrl}${profileData.bannerImage})`
      }}>
        <div className="absolute inset-0 h-full w-full bg-gray-900/75" />
      </div>
      <Card className="mx-3 -mt-16 mb-6 lg:mx-4 border border-blue-gray-100">
        <CardBody className="p-4">
          <div className="mb-10 flex items-center justify-between flex-wrap gap-6">
            <div className="flex items-center gap-6">
              <Avatar
                src= {`${BackendUrl}${profileData.profileImage}`}
                alt="userImg"
                size="xl"
                variant="rounded"
                className="rounded-lg shadow-lg shadow-blue-gray-500/40"
              />
              <div>
                <Typography variant="h5" color="blue-gray" className="mb-1">
                  {profileData.firstName}
                </Typography>
              </div>
            </div>
            <div className="">
            <button type="button" class="text-white bg-black hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2 text-center text-bold dark:bg-blue-600 dark:hover:bg-white dark:focus:ring-white" onClick={handleLogout}>
            Logout</button>
            </div>
          </div>
          <div className="gird-cols-1 mb-12 grid gap-12 px-4 lg:grid-cols-2 xl:grid-cols-3">
            <div>
              <Typography variant="h6" color="blue-gray" className="mb-3">
                Platform Settings
              </Typography>
              <div className="flex flex-col gap-12">
                {platformSettingsData.map(({ title, options }) => (
                  <div key={title}>
                    <Typography className="mb-4 block text-xs font-semibold uppercase text-blue-gray-500">
                      {title}
                    </Typography>
                    <div className="flex flex-col gap-6">
                      {options.map(({ checked, label }) => (
                        <Switch
                          key={label}
                          id={label}
                          label={label}
                          defaultChecked={checked}
                          labelProps={{
                            className: "text-sm font-normal text-blue-gray-500",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {
              isEditing ? (
                <EditProfileForm
                  profileData={profileData}
                  setProfileData={setProfileData}
                  onSave={() => setIsEditing(false)}
                  onCancel={() => setIsEditing(false)}
                />
              ) : (
                <ProfileInfoCard
                  title="About"
                  description={profileData.bio}
                  details={{
                    "name": profileData.firstName,
                    email: profileData.email,
                    social: (
                      <div className="flex items-center gap-4">
                        {profileData.social.twitter && <a href={profileData.social.twitter} target="_blank">Twitter</a>}
                        {profileData.social.linkedin && <a href={profileData.social.linkedin} target="_blank">LinkedIn</a>}
                        {profileData.social.github && <a href={profileData.social.github} target="_blank">GitHub</a>}
                      </div>
                    ),
                  }}
                  action={
                    <Tooltip content="Edit Profile">
                      <PencilIcon
                        onClick={() => setIsEditing(true)}
                        className="h-4 w-4 cursor-pointer text-blue-gray-500"
                      />
                    </Tooltip>
                  }
                />
              )
            }
          </div>
          <div className="px-4 pb-4">
            <Typography variant="h6" color="blue-gray" className="mb-2">
              Your Blogs
            </Typography>
            <div className="mt-6 grid grid-cols-1 gap-12 md:grid-cols-2 xl:grid-cols-4">
            {blogs.map(
              (blog) => (
                <Card key={blog.id} color="transparent" shadow={false}>
                  <CardHeader
                    floated={false}
                    color="gray"
                    className="mx-0 mt-0 mb-4 h-64 xl:h-40"
                  >
                    <img
                      src={`${BackendUrl}${blog.cover_image}`}
                      alt={blog.title}
                      className="h-full w-full object-cover"
                    />
                  </CardHeader>
                  <CardBody className="py-0 px-1">
                    <Typography
                      variant="h5"
                      color="blue-gray"
                      className="mt-1 mb-2"
                    >
                      {blog.title}
                    </Typography>
                    <Typography
                      variant="small"
                      className="font-normal text-blue-gray-500"
                    >
                      {stripHTML(blog.content).slice(0,100)}...
                    </Typography>
                    <Typography
                      variant="small"
                      className="font-normal text-blue-gray-500 mt-2"
                    >
                      {(blog.tags.slice(0,3)).map((tag, index) => (
                        <span key={index} className="text-xm">#{tag} </span>
                      ))}
                    </Typography>
                    <Typography
                      color="blue-gray"
                      className="mt-1 mb-2 text-sm"
                    >
                      By - {blog.author_name}
                    </Typography>
                  </CardBody>
                  <CardFooter className="mt-3 flex items-center justify-between py-0 px-1">
                    <Link to={`/dashboard/blog/${blog.id}`}>
                      <Button variant="outlined" size="sm">
                        Read more
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              )
            )}
            </div>
          </div>
        </CardBody>
      </Card>
    </>
  );
}

export default Profile;
