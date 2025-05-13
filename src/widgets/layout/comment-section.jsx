import { useState, useEffect } from "react";
import axios from "axios";
import { Typography } from "@material-tailwind/react";

export default function CommentSection({ blogId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const fetchComments = () => {
    axios.get(`http://localhost:8000/api/blogs/${blogId}/comments/`)
      .then(res => {
        setComments(res.data)
      })
      .catch(err => console.log(err));
  };

  useEffect(() => {
    console.log(comments)
    fetchComments();
  }, [blogId]);

  const postComment = (content, parentId = null) => {
    axios.post(`http://localhost:8000/api/blogs/${blogId}/comments/`, {
      content,
      parent: parentId,
      blog: blogId,
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`
      }
    }).then(() => {
      setNewComment("");
      fetchComments();
      console.log(newComment)
    })
  }

  const renderComments = (comments) => {
    return comments.map(comment => (
      <div key={comment.id} className="ml-4 mt-2 border-l pl-4 mb-9">
        <p><Typography variant="h6" color="blue-gray">{comment.user_name}</Typography> <Typography color="blue-gray">{comment.content}</Typography></p>
        <Typography variant="small" color="blue-gray">
        {new Date(comment.created_at).toLocaleDateString('en-US',{
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                })}
        </Typography>
        <button
          className="text-sm text-blue-500"
          onClick={() => {
            const reply = prompt("Your reply:");
            if (reply) postComment(reply, comment.id);
          }}
        >
          Reply
        </button>
        {comment.replies && comment.replies.length > 0 && (
          <div>{renderComments(comment.replies)}</div>
        )}
      </div>
    ));
  };

  return (
    <div className="mt-8">
      <Typography variant="h3" color="blue-gray" >Comments</Typography>
      <textarea
        value={newComment}
        onChange={e => setNewComment(e.target.value)}
        placeholder="Add a comment..."
        className="w-full border p-2 rounded mb-2 text-blue-gray-800 border-gray-500 focus:outline-none focus:border-gray-800"
      />
      <button
        onClick={() => postComment(newComment)}
        type="button" class="text-white w-24 mt-2 bg-black hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2 text-center text-bold dark:bg-blue-600 dark:hover:bg-white dark:focus:ring-white"
      >
        Post
      </button>
      <div className="mt-4">{renderComments(comments)}</div>
    </div>
  );
}
