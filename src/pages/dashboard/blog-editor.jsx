import React, { useState, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Typography } from "@material-tailwind/react";
import axios from "axios";
import Confetti from "react-confetti";
import { useWindowSize } from '@react-hook/window-size';
import { useNavigate } from "react-router-dom";

export function BlogEditor() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [coverImage, setCoverImage] = useState(null)
  const [tags, setTags] = useState("")
  const [currentBlogId, setCurrentBlogId] = useState("")
  const [currentBlogTitle, setCurrentBlogTitle] = useState("")
  const [showModal, setShowModal] = useState(false)
  const quillRef = useRef(null)
  const [assistantResults, setAssistantResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [width, height] = useWindowSize()
  const navigate = useNavigate()
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const stripHTML = (html) =>{
    const div = document.createElement("div")
    div.innerHTML = html
    return div.textContent || div.innerHTML || ""
  }

  // function for writing assistant
  const handleWritingAssistant = async () =>{
    setIsLoading(true)
    try{
      const res = await axios.post("http://localhost:8000/api/blogs/assistant/", {
        content: content,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })
      setAssistantResults(res.data)

    } catch (err){
      console.error("Writing Assistant failed", err);
      alert("Something went wrong with Writing Assistant.");
    } finally {
      setIsLoading(false)
    }
  }

  //saving blog content without publishing it
  const handleNext = async (e) => {
    e.preventDefault();

    const formData = new FormData()
    formData.append("title", title)
    formData.append("content", content)
    formData.append("is_published", false)

    try {
      const response = await fetch("http://localhost:8000/api/blogs/create/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: formData,
      })

      const data = await response.json()
      if (response.ok) {
        setCurrentBlogId(data.id)
        setCurrentBlogTitle(data.title)
        setShowModal(true)
      } else {
        console.log("Failed to create blog: ", data)
        alert("Failed to create blog: "+ JSON.stringify(data))
      }
    } catch (err) {
      console.error("Error submitting blog:", err)
    }
  }

  //publishing the blog
  const handleSubmit = async () =>{
    const formData = new FormData()
    formData.append("is_published", true)
    if(coverImage) formData.append("cover_image", coverImage)
    if(tags) {
      tags.split(",").forEach(tag => formData.append("tags", tag.trim()))
    }

    try{
      const response = await fetch(`http://localhost:8000/api/blogs/update/${currentBlogId}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: formData,
      })
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")){
        const data = await response.json();
        if (response.ok) {
          setShowModal(false)  
          setShowSuccessModal(true)
        } else {
          console.error("Failed to publish blog: ", data);
        }
      } else {
        const text = await response.text();  
        console.error("Unexpected response format:", text);
      }


    } catch(error){
      console.error("Publishing error: ", error)
    }
  }

//  const imageHandler = () => {
//    const input = document.createElement("input")
//    input.setAttribute("type", "file")
//    input.setAttribute("accept", "image/*")
//    input.click()
//  
//    input.onchange = async () => {
//      const file = input.files[0]
//      const formData = new FormData()
//      formData.append("image", file)
//  
//      const res = await fetch("http://localhost:8000/api/blogs/upload-image/", {
//        method: "POST",
//        headers: {
//          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
//        },
//        body: formData,
//      })
//  
//      const data = await res.json()
//  
//      const editor = quillRef.current.getEditor()
//      const range = editor.getSelection(true)
//      editor.insertEmbed(range.index, "image", data.url)
//      editor.setSelection(range.index + 1);
//    }
//  }

  const modules = {
    toolbar: [
        [{ header: [1, 2, false] }],
        ["bold", "italic", "underline", "strike"],
        [{script: "sub"}, {script: "super"}],
        [{list: "ordered"}, {list: "bullet"}],
        [{indent: "-1"}, {indent: "+1"}],
        [{ list: "ordered" }, { list: "bullet" }],
        [{align: [] }],
        ["link", "image"],
        ["clean"],
      ]
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <Typography className="text-2xl mb-4 font-bold" color="blue-gray" variant="text">Write a New Blog</Typography>
      <input
        type="text"
        className="w-full border p-2 mb-4 border-gray-500 focus:outline-none focus:border-gray-800"
        placeholder="Enter blog title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <ReactQuill
        ref={quillRef}
        value={content}
        onChange={setContent}
        modules={modules}
        theme="snow"
        placeholder="Write your blog content here..."
        className="h-[600px] focus:outline-none focus:border-gray-800"
      />

      <button
        type="button"
        className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 mr-4"
        onClick={handleWritingAssistant}
        disabled={isLoading}
      >
        {isLoading ? (
          <svg className="animate-spin h-4 w-4 mr-2 text-white" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        ) : null}
        {isLoading ? "Analyzing..." : "Writing Assistant"}
      </button>

      <button type="button" class="text-white bg-black hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2 text-center text-bold dark:bg-blue-600 dark:hover:bg-white dark:focus:ring-white mt-16 w-20" onClick={handleNext}>
      Next</button>

      {/* Suggestions Output */}
      {assistantResults && (
        <div className="mt-1 p-4 border rounded-lg bg-gray-50">
          <Typography variant="h6" className="font-semibold mb-2">
            Writing Assistant Suggestions
          </Typography>
      
          <div className="mb-2">
            <strong>Sentiment:</strong> Polarity: {assistantResults.sentiment.polarity.toFixed(2)}, Subjectivity:{" "}
            {assistantResults.sentiment.subjectivity.toFixed(2)}
          </div>
      
          <div className="mb-2">
            <strong>Grammar Issues:</strong>
            <ul className="list-disc ml-6">
              {assistantResults.grammar.map((issue, index) => (
                <li key={index}>
                  <span className="font-medium">{issue.message}</span> (at position {issue.offset})
                </li>
              ))}
            </ul>
          </div>
            
          <div className="mb-2">
          <strong>Keywords:</strong> {stripHTML(assistantResults.keywords.join(", "))}
          </div>
            
          <div className="mb-2">
            <strong>Synonyms:</strong>
            <ul className="list-disc ml-6">
              {Object.entries(assistantResults.synonyms).map(([word, syns], index) => (
                <li key={index}>
                  <span className="font-semibold">{word}:</span> {syns.join(", ")}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Displaying the model for cover image and tags */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-black text-xl"
              onClick={() => setShowModal(false)}
            >
              &times;
            </button>

            <Typography className="text-xl mb-4 font-bold" color="blue-gray" variant="text">
              Blog Title: {currentBlogTitle}
            </Typography>

            <label className="block mb-2 text-sm text-gray-600" htmlFor="file_input">
              Upload Cover Image
            </label>
            <input
              type="file"
              onChange={(e) => setCoverImage(e.target.files[0])}
              className="block w-full p-1 text-sm text-gray-900 border border-gray-500 mb-4"
              id="file_input"
            />


            <label className="block mb-2 text-sm text-gray-600" htmlFor="text_input">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              className="w-full border p-2 mb-4 border-gray-500 focus:outline-none focus:border-gray-800"
              placeholder="Comma-separated tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />

            <button
              type="button"
              className="text-white bg-black hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2 w-full"
              onClick={handleSubmit}
            >
              Publish Blog
            </button>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center">
          <Confetti width={width} height={height} />
          <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
            <h2 className="text-2xl font-bold text-green-600 mb-4">🎉 Blog Published Successfully!</h2>
            <p className="mb-6 text-gray-700">Your blog is now live and visible to everyone.</p>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={() => {
                setShowSuccessModal(false);
                navigate("/dashboard/home");
              }}
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BlogEditor;