import PropTypes from "prop-types";
import { Link, NavLink, useParams } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  Avatar,
  Button,
  IconButton,
  Typography,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
} from "@material-tailwind/react";
import { faHandsClapping } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMaterialTailwindController, setOpenSidenav } from "@/context";
import { useEffect, useState } from "react";
import axios from "axios";

export function BlogSideNav({ brandName, authorId }) {
  const [controller, dispatch] = useMaterialTailwindController()
  const { sidenavColor, sidenavType, openSidenav } = controller
  const sidenavTypes = {
    dark: "bg-gradient-to-br from-gray-800 to-gray-900",
    white: "bg-white shadow-sm",
    transparent: "bg-transparent",
  }
  const [blogs, setBlogs] = useState([])
  const [bookmarkedBlogs, setBookmarkedBlogs] = useState([])
  const [likedBlogs, setLikedBlogs] = useState([])
  const BackendUrl = "http://localhost:8000"

  useEffect(()=>{
    //fetching the blogs list
    axios.get(`http://localhost:8000/api/blogs/${authorId}/blog-sug/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    })
    .then((res)=>{
      setBlogs(res.data)
    })
    .catch((err)=>{
      console.log("Failed to fetch blogs: ", err.data)
    })

    //fetching the bookmarked blogs arraylist
    axios.get("http://localhost:8000/api/bookmarks/", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    }).then(res =>{
      const bookmarkedIds = res.data.map(bookmark => bookmark.blog)
      setBookmarkedBlogs(bookmarkedIds)
    })

    //fetching the liked blogs arrylist
    axios.get("http://localhost:8000/api/likes/", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    }).then(res=>{
      const likedIds = res.data.map(like => like.blog)
      setLikedBlogs(likedIds)
    })

  }, [])

  //toggle function to keep the bookmarked icon set or delete a bookmark
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

  return (
    <aside
      className={`${sidenavTypes[sidenavType]} ${
        openSidenav ? "translate-x-0" : "-translate-x-80"
      } fixed inset-0 z-50 my-4 ml-4 h-[calc(100vh-32px)] w-80 rounded-xl transition-transform duration-300 xl:translate-x-0 border border-blue-gray-100 overflow-y-auto scrollbar-track-blue-gray-700 scrollbar-thumb-blue-gray-200 `}
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

      <div className="mb-12 p-4 flex flex-col gap-y-5 md:grid-cols-2 xl:grid-cols-4">
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
              </CardBody>
              <CardFooter className=" flex items-center justify-between py-0 px-1">
                <Link to={`/dashboard/blog/${blog.id}`}>
                  <Button variant="outlined" size="sm">
                    Read more
                  </Button>
                </Link>
                <div>

                <FontAwesomeIcon icon={faHandsClapping} className={`mr-4 text-2xl hover:text-blue-gray-700 hover:cursor-pointer ${likedBlogs.includes(blog.id)? "text-blue-gray-700" : "text-blue-gray-200"}`} onClick={()=>toggleLike(blog.id)}/>
                
                <i className={`fas fa-bookmark mr-2 text-xl hover:cursor-pointer hover:text-blue-gray-700 ${
                  bookmarkedBlogs.includes(blog.id)? "text-blue-gray-700" : "text-blue-gray-200"
                }`} onClick={()=>toggleBookmark(blog.id)}></i>
                </div>
              </CardFooter>
            </Card>
          )
        )}
      </div>
    </aside>
  );
}

BlogSideNav.defaultProps = {
  brandImg: "/img/logo-ct.png",
  brandName: "Related Posts",
};

BlogSideNav.propTypes = {
  brandImg: PropTypes.string,
  brandName: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

BlogSideNav.displayName = "/src/widgets/layout/sidnave.jsx";

export default BlogSideNav;
