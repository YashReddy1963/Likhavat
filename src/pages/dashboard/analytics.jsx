import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  CardFooter,
  Button,
} from "@material-tailwind/react";
import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { faHandsClapping } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const shortenTitle = (title) => {
  const words = title.split(" ");
  return words.slice(0, 2).join(" ") + (words.length > 2 ? "..." : "");
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-gray-300 rounded shadow">
        <p className="text-sm font-medium text-gray-700">{payload[0].payload.title}</p>
        <p className="text-xs text-gray-600">Likes: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export function Analytics() {
  const[months, setMonths] = useState([])
  const[selectedMonth, setSelectedMonth] = useState("")
  const[analyticsData, setAnalyticsData] = useState(null)
  const [blogs, setBlogs] = useState([])
  const [bookmarkedBlogs, setBookmarkedBlogs] = useState([])
  const [likedBlogsIds, setLikedBlogsIds] = useState([])
  const [likedBlogs, setLikedBlogs] = useState([])

  const stripHTML = (html) =>{
    const div = document.createElement("div")
    div.innerHTML = html
    return div.textContent || div.innerHTML || ""
  }

  //fetching the list of month
  useEffect(() => {
    const fetchMonths = async () =>{
        try {
        const response = await fetch('http://localhost:8000/api/analytics/blog-months/', {
          headers:{
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        })
        const data = await response.json();
        setMonths(data);
      } catch (error) {
        console.error('Failed to fetch months:', error);
      }
    }
    fetchMonths()
  }, []);

  //fetching analytics data of selected month
  useEffect(() => {
    if (selectedMonth) {
      fetch(`http://localhost:8000/api/analytics/blog-analytics/?month=${selectedMonth}`, {
        headers:{
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })
        .then((res) => res.json())
        .then(setAnalyticsData)
    }
  }, [selectedMonth]);

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
      setLikedBlogsIds(likedIds)
      const liked = res.data.map((like)=>like.blog_data)
      setLikedBlogs(liked)
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
    const isLiked = likedBlogsIds.includes(blogId)
    if(isLiked){
      axios.delete(`http://localhost:8000/api/likes/${blogId}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }).then(()=>{
        setLikedBlogsIds(prev => prev.filter(id => id!==blogId))
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
        setLikedBlogsIds(prev => [...prev, blogId])
        console.log(likedBlogsIds)
      })
    }
  }

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            Blog Analytics
          </Typography>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">

        {/* Fetching the analytics */}
          <div className="max-w-7xl mx-auto p-6">

            <div className="mb-8">
              <Typography variant="h6" color="blue-gray" className="block mb-2 font-normal">Select Month</Typography>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full md:w-64 border border-gray-400 p-2 rounded focus:outline-none focus:border-gray-900"
              >
                <option value="">-- Choose a Month --</option>
                {Array.isArray(months) && months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
              
            {/* Charts */}
            {analyticsData && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Line Chart - Views Over Time */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                  <Typography variant="h4" color="blue-gray" className="mb-4" >Views Over Time</Typography>
                  <LineChart width={400} height={250} data={analyticsData.views_over_time}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="views" stroke="#4f46e5" />
                  </LineChart>
                </div>
            
                {/* Bar Chart - Likes per Blog */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                  <Typography variant="h4" color="blue-gray" className=" mb-4 ">Likes per Blog</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analyticsData.likes_per_blog}>
                      <XAxis 
                        dataKey={(entry) => shortenTitle(entry.title)} 
                        interval={0}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="like_count" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Pie char */}
                {analyticsData.top_blog && (
                <div className="bg-white p-6 rounded-xl shadow-lg col-span-1 md:col-span-2">
                  <Typography variant="h4" color="blue-gray" className="mb-4">Top Performing Recent Blog</Typography>
                  <Typography variant="h6" color="blue-gray" className="mb-4 font-normal">{analyticsData.top_blog.title}</Typography>
                  <div className="flex justify-center">
                    <PieChart width={300} height={300}>
                      <Pie
                        data={analyticsData.top_blog.data}
                        dataKey="value"
                        nameKey="label"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {analyticsData.top_blog.data.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </div>
                </div>
              )}
            </div>
            )}
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            Liked Blogs
          </Typography>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
        <div className="mb-12 p-6 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4">
        {likedBlogs.map(
            (like) => (
              <Card key={like.id} color="transparent" shadow={false}>
                <CardHeader
                  floated={false}
                  color="gray"
                  className="mx-0 mt-0 mb-4 h-64 xl:h-40"
                >
                  <img
                    src={like.cover_image}
                    alt={like.title}
                    className="h-full w-full object-cover"
                  />
                </CardHeader>
                <CardBody className="py-0 px-1">

                  <Typography
                    variant="h5"
                    color="blue-gray"
                    className="mt-1 mb-2"
                  >
                    {like.title}
                  </Typography>
                  <Typography
                    variant="small"
                    className="font-normal text-blue-gray-500"
                  >
                    {stripHTML(like.content).slice(0,100)}...
                  </Typography>
                  <Typography
                    color="blue-gray"
                    className="mt-1 mb-2 text-sm"
                  >
                    By - {like.author_name}
                  </Typography>
                </CardBody>
                <CardFooter className="mt-3 flex items-center justify-between py-0 px-1">
                  <Link to={`/dashboard/blog/${like.id}`}>
                    <Button variant="outlined" size="sm">
                      Read more
                    </Button>
                  </Link>
                  <div>
                      <FontAwesomeIcon icon={faHandsClapping} className={`mr-4 text-2xl hover:text-blue-gray-700 hover:cursor-pointer ${likedBlogsIds.includes(like.id)? "text-blue-gray-700" : "text-blue-gray-200"}`} onClick={()=>toggleLike(like.id)}/>
                      <i className={`fas fa-bookmark mr-2 text-xl hover:cursor-pointer hover:text-blue-gray-700 ${
                        bookmarkedBlogs.includes(like.id)? "text-blue-gray-700" : "text-blue-gray-200"
                        }`} onClick={()=>toggleBookmark(like.id)}></i>
                  </div>
                </CardFooter>
              </Card>
            )
          )}
        </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default Analytics;
