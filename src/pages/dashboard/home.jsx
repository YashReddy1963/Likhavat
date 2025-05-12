import React, { useEffect, useState } from "react";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  IconButton,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Avatar,
  Tooltip,
  Progress,
  Button,
} from "@material-tailwind/react";
import {
  EllipsisVerticalIcon,
  ArrowUpIcon,
} from "@heroicons/react/24/outline";
import { StatisticsCard } from "@/widgets/cards";
import { StatisticsChart } from "@/widgets/charts";
import {
  statisticsCardsData,
  statisticsChartsData,
  projectsTableData,
  ordersOverviewData,
} from "@/data";
import projectsData from "@/data/projects-data";
import axios from "axios";
import { Link } from "react-router-dom";
import { faHandsClapping } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CheckCircleIcon, ClockIcon } from "@heroicons/react/24/solid";

export function Home() {
  const [blogs, setBlogs] = useState([])
  const [bookmarkedBlogs, setBookmarkedBlogs] = useState([])
  const [likedBlogs, setLikedBlogs] = useState([])

  const stripHTML = (html) =>{
    const div = document.createElement("div")
    div.innerHTML = html
    return div.textContent || div.innerHTML || ""
  }

  useEffect(()=>{
    //fetching the blogs list
    axios.get("http://localhost:8000/api/blogs/all/")
    .then((res)=>{
      setBlogs(res.data)
    })
    .catch((err)=>{
      console.log("Failed to fetch blogs: ", err)
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
    <div className="mt-12">
      <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4">
        {blogs.map(
          (blog) => (
            <Card key={blog.id} color="transparent" shadow={false}>
              <CardHeader
                floated={false}
                color="gray"
                className="mx-0 mt-0 mb-4 h-64 xl:h-40"
              >
                <img
                  src={blog.cover_image}
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
    </div>
  );
}

export default Home;
