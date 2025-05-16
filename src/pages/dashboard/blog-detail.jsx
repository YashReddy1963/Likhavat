import { useParams } from "react-router-dom";
import {  Button, Typography } from "@material-tailwind/react";
import {
  BlogSideNav,
  DashboardNavbar,
} from "@/widgets/layout";
import { Link } from "react-router-dom";
import CommentSection from "@/widgets/layout/comment-section";
import { useState, useEffect } from "react";
import axios from "axios";

export function BlogDetail() {
  const [isFollowing, setIsFollowing] = useState(false)
  const {blogId} = useParams()
  const [userId, setUserId] = useState()
  const [blog, setBlog] = useState(null)  
  const BackendUrl = "http://localhost:8000"

  const [isAudioLoading, setIsAudioLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalTitle, setModalTitle] = useState("")
  const [isPlaying, setIsPlaying] = useState(false)
  const [userList, setUserList] = useState([])
  const [followers, setFollowers] = useState()
  const [following, setFollowing] = useState()

  //Use to fetch blog data
  useEffect(() => {
    axios.get(`http://localhost:8000/api/blogs/${blogId}/`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
    })
    .then((res)=> {
        setBlog(res.data)
        setUserId(res.data.author)
    })
    .catch((err)=> console.log(err))
  }, [blogId])

  
  useEffect(() =>{
    if (!userId) return
    
    //use to check relation of current user and blogger 
    axios.get(`http://localhost:8000/api/is-following/${userId}/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    }).then(res =>{
      setIsFollowing(res.data.is_following)
    }).catch(err => console.log(err))

    //use to fetch follower-following count of blogger
    axios.get(`http://localhost:8000/api/follow-count/${userId}/`)
    .then((res)=>{
      setFollowers(res.data.followers)
      setFollowing(res.data.following)
    })
  }, [userId])

  //Use to toggle follower-following
  const handleFollowToggle=()=>{
    console.log("Before toggle: ", isFollowing)
    axios.post(`http://localhost:8000/api/follow/${userId}/`, {},{
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    }).then(res => {
      if(res.data.message === "Followed"){
        setFollowers(prev => prev + 1)
        setIsFollowing(true)
      } else {
        setFollowers(prev => prev - 1)
        setIsFollowing(false)
      }
      console.log("After toggle: ", isFollowing)
    }).catch(err => console.log(err))

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

  //used to toggle play of blog audio
  const togglePlay = () => {
    const audio = document.getElementById(`blog-audio-${blogId}`);
    if (!audio) return;
  
    setIsAudioLoading(true);
  
    const handlePlay = () => {
      setIsPlaying(true);
      setIsAudioLoading(false);
    }
    const handlePause = () => {
      setIsPlaying(false);
      setIsAudioLoading(false);
    }
  
    audio.removeEventListener("playing", handlePlay)
    audio.removeEventListener("pause", handlePause)
  
    audio.addEventListener("playing", handlePlay)
    audio.addEventListener("pause", handlePause)
  
    if (audio.paused) {
      audio.play().catch((e) => {
        console.error("Audio play error", e)
        setIsAudioLoading(false);
      })
    } else {
      audio.pause()
    }
  };
  

  if(!blog) return <div>The blog is being loaded!!</div>

  return (
    <div className="flex min-h-screen bg-blue-gray-50/50">
      
      <div className="fixed top-0 left-0 h-full z-30">
        <BlogSideNav authorId={blog.author} />
      </div>

      <div className="flex-1 ml-[20rem] mr-[20rem] p-7">
        <DashboardNavbar />
        <div className="p-4 max-w-3xl mx-auto">
          <Typography variant="h1" color="blue-gray" className="mb-4">
            {blog.title}
          </Typography>
          <Typography className="flex">

            <img
              src={blog.author_image}
              alt={blog.author_name}
              className="w-10 object-cover mb-6 rounded-lg"
            />
            <Typography variant="h6" color="blue-gray" className="m-2 flex gap-2">
              <Link>{blog.author_name}</Link> ·{" "}
              {new Date(blog.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            
            <div className="flex items-center gap-2">
              <audio
                id={`blog-audio-${blogId}`}
                src={`http://localhost:8000/api/blogs/${blogId}/tts/`}
              />

              <Button
                variant="h6"
                color="blue-gray"
                onClick={togglePlay}
                className="cursor-pointer bg-blue-gray-900"
                disabled={isAudioLoading}
              >
                {isAudioLoading ? (
                  <svg className="animate-spin h-4 w-4 text-blue-600" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                ) : isPlaying ? "Pause 🔈" : "Play 🔊"}
              </Button>
            </div>

            </Typography>
          </Typography>
            
          <img
            src={blog.cover_image}
            alt={blog.title}
            className="w-full h-auto object-cover mb-6 rounded-lg"
          />

          <Typography variant="paragraph" className="text-lg leading-relaxed">
            <div dangerouslySetInnerHTML={{ __html: blog.content }} />
          </Typography>
            
          <Typography color="gray" className="mb-2">
            {blog.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="text-sm">
                #{tag}{" "}
              </span>
            ))}
          </Typography>
          
          <CommentSection blogId={blogId} />
        </div>
      </div>
          
      
      <div className="fixed top-0 right-0 h-[calc(100vh-32px)] w-[18rem] rounded-xl my-4 mr-4 z-30 bg-white border border-blue-gray-100 shadow-md">
        <div className="overflow-hidden">
        <img
            src={blog.author_banner}
            alt={blog.author_name}
            className="object-cover rounded-t-lg"
          />
        </div>
        <div className="mx-auto w-32 h-32 relative -mt-16 border-4 border-white rounded-full overflow-hidden">
          <img
            src={blog.author_image}
            alt={blog.author_name}
            className="object-cover mb-6 rounded-full object-center"
            />
        </div>
        <div className="flex flex-col justify-center items-center">

          <Typography variant="h4" color="blue-gray" >{blog.author_name}</Typography>

          <Typography variant="h6" color="blue-gray" className="font-normal px-6">{blog.author_email}</Typography>

          <Typography color="blue-gray" className="mt-2 flex flex-row cursor-pointer">
            <div className="flex mr-6 hover:text-blue-gray-400" onClick={() => handleOpenModal("followers")}>
              <Typography variant="h6" className="mr-1">{followers}</Typography>
              <Typography variant="h6">Followers</Typography>
            </div>
            <div className="flex hover:text-blue-gray-400" onClick={() => handleOpenModal("following")}>
              <Typography variant="h6" className="mr-1">{following}</Typography>
              <Typography variant="h6">Following</Typography>
            </div>
          </Typography>
        </div>
        <Typography variant="h6" color="blue-gray" className="font-normal text-center text-gray-700 text-base mt-4">{blog.author_about}</Typography>

        <div class="w-full flex justify-center pt-5 pb-5">
          <a href={`${blog.author_socials.github}`} target="_blank" class={`mx-3 ${blog.author_socials.github.includes("http") ? "visible" : "hidden" }`}>
            <div aria-label="Github">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                    fill="none" stroke="#718096" stroke-width="1.5" stroke-linecap="round"
                    stroke-linejoin="round" class="feather feather-github">
                    <path
                        d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22">
                    </path>
                </svg>
            </div>
          </a>
          <a href={`${blog.author_socials.twitter}`} class={`mx-3 ${blog.author_socials.twitter.includes("http") ? "visible" : "hidden" }`}>
              <div aria-label="Twitter">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                      fill="none" stroke="#718096" stroke-width="1.5" stroke-linecap="round"
                      stroke-linejoin="round" class="feather feather-twitter">
                      <path
                          d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z">
                      </path>
                  </svg>
              </div>
          </a>
          <a href={`${blog.author_socials.linkedin}`} class={`mx-3 ${blog.author_socials.linkedin.includes("http") ? "visible" : "hidden" }`}>
            <div aria-label="LinkedIn">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                  fill="none" stroke="#718096" stroke-width="1.5" stroke-linecap="round"
                  stroke-linejoin="round" class="feather feather-linkedin">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </div>
          </a>
        </div>
        <div className="flex flex-col justify-center items-center">
          <button type="button" onClick={handleFollowToggle} className={`text-white w-24 ${isFollowing ? "bg-red-600" : "bg-black"} hover:bg-gray-900 font-medium rounded-lg text-sm px-4 py-2 text-center text-bold mt-2`}>
            {isFollowing ? "Unfollow" : "Follow"}
          
          </button>
        </div>
      </div>

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
    </div>
  );
}


export default BlogDetail;
