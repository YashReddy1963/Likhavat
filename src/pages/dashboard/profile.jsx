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
import { faHandsClapping } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState, useEffect } from "react";
import axios from "axios";
import api from "@/configs/api";

export function Profile() {
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const BackendUrl = "http://localhost:8000"
  const [userId, setUserId] = useState()

  const [blogs, setBlogs] = useState([])
  const [bookmarkedBlogs, setBookmarkedBlogs] = useState([])
  const [savedBlogs, setSavedBlogs] = useState([])
  const [likedBlogs, setLikedBlogs] = useState([])

  const [showModal, setShowModal] = useState(false)
  const [modalTitle, setModalTitle] = useState("")
  const [userList, setUserList] = useState([])
  const [followers, setFollowers] = useState()
  const [following, setFollowing] = useState()

  const [activeTab, setActiveTab] = useState("yourBlogs")
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
        })
        setUserId(response.data.id)
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

      //fetching blogs created by user
      axios.get("http://localhost:8000/api/userblog/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })
      .then((res) => {
        setBlogs(res.data)
      })
      .catch((err) => {
        console.log("Failed to fetch blogs: ", err);
      });

      //fetching blogs saved by the user
      axios.get("http://localhost:8000/api/bookmarks/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })
      .then((res) => {
        const saved = res.data.map((bookmark) => bookmark.blog_data)
        setSavedBlogs(saved)
        const bookmarkedIds = res.data.map(bookmark => bookmark.blog)
        setBookmarkedBlogs(bookmarkedIds)
      })
      .catch((err) => {
        console.log("Failed to fetch saved blogs: ", err)
      });
    }

    //fetching the liked blogs arrylist
    axios.get("http://localhost:8000/api/likes/", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    }).then(res=>{
      const likedIds = res.data.map(like => like.blog)
      setLikedBlogs(likedIds)
    })

    fetchProfile();
  }, []);

  useEffect(()=>{

    //get followers-following count of current user
    axios.get(`http://localhost:8000/api/follow-count/${userId}/`)
    .then(res => {
      setFollowers(res.data.followers)
      setFollowing(res.data.following)
    })

  }, [userId])

  //toogle function to keep the bookmarked icon set or delete a bookmark
  const toggleBookmark = (blogId)=>{
    const isBookmarked = bookmarkedBlogs.includes(blogId)

    if(isBookmarked){
      axios.delete(`http://localhost:8000/api/bookmarks/${blogId}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }).then(()=>{
        setBookmarkedBlogs(prev => prev.filter(id => id!==blogId))
      })
    } else {
      axios.post(`http://localhost:8000/api/bookmarks/`, {
        blog: blogId,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }).then(() => {
        setBookmarkedBlogs(prev => [...prev, blogId])
      })
    }
  }

    //toggle function to keep the liked(clap) icon set or unlike a blog
    const toggleLike = (blogId) =>{
      const isLiked = likedBlogs.includes(blogId)
      if(isLiked){
        axios.delete(`http://localhost:8000/api/likes/${blogId}/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }).then(()=>{
          setLikedBlogs(prev => prev.filter(id => id!==blogId))
        })
      } else {
        axios.post(`http://localhost:8000/api/likes/`, {
          blog: blogId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }).then(() => {
          setLikedBlogs(prev => [...prev, blogId])
          console.log(likedBlogs)
        })
      }
    }

  //Logout function
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

    //Function to fetch the following and followers list
    const handleOpenModal = (type) =>{
      const endpoint = type == "followers" ?
      `http://localhost:8000/api/followers-list/${userId}/` : 
      `http://localhost:8000/api/following-list/${userId}/`
  
      axios.get(endpoint, {
        headers:{
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }).then(res =>{
        setUserList(res.data)
        setModalTitle(type === "followers" ? "Followers" : "Following")
        setShowModal(true)
      })
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
                  {profileData.firstName}{profileData.id}
                </Typography>
              </div>
              <Typography color="blue-gray" className="mt-2 flex flex-row cursor-pointer">
                <div className="flex flex-col mr-6 hover:text-blue-gray-400" onClick={() => handleOpenModal("followers")}>
                  <Typography variant="h6" className="mr-1 flex justify-center items-center">{followers}</Typography>
                  <Typography variant="h6">Followers</Typography>
                </div>
                <div className="flex flex-col hover:text-blue-gray-400" onClick={() => handleOpenModal("following")}>
                  <Typography variant="h6" className="mr-1 flex justify-center items-center">{following}</Typography>
                  <Typography variant="h6">Following</Typography>
                </div>
              </Typography>
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
            <Typography variant="small" color="blue-gray" className="mb-2">
              <ul className="flex gap-3 font-bold border-b border-blue-gray-100">
                <li
                  className={`cursor-pointer pb-2 ${activeTab === "yourBlogs" ? "border-b-2 border-blue-gray-700 text-blue-gray-700" : "text-blue-gray-500"}`}
                  onClick={() => setActiveTab("yourBlogs")}
                >
                  Your Blogs
                </li>
                <li
                  className={`cursor-pointer pb-2 ${activeTab === "savedBlogs" ? "border-b-2 border-blue-gray-700 text-blue-gray-700" : "text-blue-gray-500"}`}
                  onClick={() => setActiveTab("savedBlogs")}
                >
                  Saved Blogs
                </li>
              </ul>
            </Typography>
            <div className="mt-6 grid grid-cols-1 gap-12 md:grid-cols-2 xl:grid-cols-4">
            {(activeTab == "yourBlogs"? blogs : savedBlogs).map(
              (blog) => (
                <Card key={blog.id} color="transparent" shadow={false}>
                  <CardHeader
                    floated={false}
                    color="gray"
                    className="mx-0 mt-0 mb-4 h-64 xl:h-40"
                  >
                    <img
                      src={blog.cover_image.startsWith("http") ? blog.cover_image : `${BackendUrl}${blog.cover_image}`}
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
                    <div>
                      <Tooltip content="Like">
                        <FontAwesomeIcon icon={faHandsClapping} className={`mr-4 text-2xl hover:text-blue-gray-700 hover:cursor-pointer ${likedBlogs.includes(blog.id)? "text-blue-gray-700" : "text-blue-gray-200"}`} onClick={()=>toggleLike(blog.id)}/>
                      </Tooltip>
                      <Tooltip content="Save">
                        <i className={`fas fa-bookmark mr-2 text-xl hover:cursor-pointer hover:text-blue-gray-700 ${
                        bookmarkedBlogs.includes(blog.id)? "text-blue-gray-700" : "text-blue-gray-200"
                        }`} onClick={()=>toggleBookmark(blog.id)}></i>
                      </Tooltip>
                    </div>
                  </CardFooter>
                </Card>
              )
            )}
            </div>
          </div>
        </CardBody>
      </Card>
      
      {/* Pop container to dispaly followers-following list*/}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">{modalTitle}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-black text-lg">&times;</button>
            </div>
            {userList.length === 0 ? (
              <p className="text-center text-gray-500">No users found.</p>
            ) : (
              <ul className="divide-y">
                {userList.map(user => (
                  <li key={user.id} className="flex items-center py-3">
                    <img
                      src={`${BackendUrl}${user.profile_image}`}
                      alt={user.username}
                      className="w-10 h-10 rounded-full mr-4"
                    />
                    <div>
                      <Typography variant="h6" color="blue-gray">{user.name}</Typography>
                      <Typography variant="small" color="blue-gray">{user.email}</Typography>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Profile;
