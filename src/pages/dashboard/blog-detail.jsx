import { Routes, Route, Outlet, useNavigate, useParams } from "react-router-dom";
import { Cog6ToothIcon } from "@heroicons/react/24/solid";
import { IconButton, Typography } from "@material-tailwind/react";
import {
  BlogSideNav,
  DashboardNavbar,
  Configurator,
  Footer,
} from "@/widgets/layout";
import routes from "@/routes";
import { Link } from "react-router-dom";
import CommentSection from "@/widgets/layout/comment-section";
import { useMaterialTailwindController, setOpenConfigurator } from "@/context";
import { useState, useEffect } from "react";
import axios from "axios";

export function BlogDetail() {
  const [controller, dispatch] = useMaterialTailwindController()
  const { sidenavType } = controller
  const {blogId} = useParams()
  const [blog, setBlog] = useState(null)  
  const BackendUrl = "http://localhost:8000"

  useEffect(() => {
    
    axios.get(`http://localhost:8000/api/blogs/${blogId}/`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
    })
    .then((res)=> {
        setBlog(res.data)
    })
    .catch((err)=> console.log(err))
  }, [blogId])

  if(!blog) return <div>This blog doesn't exist!</div>

  return (
    <div className="min-h-screen bg-blue-gray-50/50">
      <BlogSideNav
        authorId = {blog.author}
      />
      <div className="p-7 xl:ml-80">
        <DashboardNavbar/>
        <Routes>
          {routes.map(
            ({ layout, pages }) =>
              layout === "dashboard" &&
              pages.map(({ path, element }) => (
                <Route exact path={path} element={element} />
              ))
          )}
        </Routes>
      </div>
        
      <div className="p-4 max-w-3xl mx-auto">
        <Typography variant="h1" color="blue-gray" className="mb-4">
            {blog.title}
        </Typography>
        <Typography className="flex">
            <img
                src={`${BackendUrl}${blog.author_image}`}
                alt={blog.author_name}
                className="w-10 object-cover mb-6 rounded-lg"
              />
              <Typography  variant="h6" color="blue-gray" className="m-2" >
                <Link>{blog.author_name}</Link> · {new Date(blog.created_at).toLocaleDateString('en-US',{
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                })}
              </Typography>
                
        </Typography>
          <img
            src={`${BackendUrl}${blog.cover_image}`}
            alt={blog.title}
            className="w-full h-auto object-cover mb-6 rounded-lg"
          />
          <Typography variant="paragraph" className="text-lg leading-relaxed">
            <div dangerouslySetInnerHTML={{ __html: blog.content }} />
          </Typography>
          <Typography color="gray" className="mb-2">
          {(blog.tags).map((tag, index) => (
                    <span key={index} className="text-xm">#{tag} </span>
                  ))}
          </Typography>
          <CommentSection blogId={blogId} />
      </div>
    </div>
  );
}


export default BlogDetail;
