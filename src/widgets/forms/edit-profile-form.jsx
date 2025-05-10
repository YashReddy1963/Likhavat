import axios from "axios"

export function EditProfileForm({ profileData, setProfileData, onSave, onCancel}){

    const handleChange = (e) =>{
        const{ name, value } = e.target
        setProfileData({ ...profileData, [name]: value})
    }

    const handleSocialChange = (e) =>{
        const { name, value } = e.target
        setProfileData({
            ...profileData,
            social: { ...profileData.social, [name]: value},
        })
    }

    const handleImageChange = (e) => {
        const { name, files } = e.target
        setProfileData((prev) => ({
          ...prev,
          [name === "profileImage" ? "profileImage" : "bannerImage"]: files[0],
        }))
      }

    const handleSubmit = async (e) =>{
        e.preventDefault()

        const token = localStorage.getItem("accessToken")

        const formData = new FormData()
        formData.append("name", profileData.firstName)
        formData.append("email", profileData.email)
        formData.append("bio", profileData.bio)
        formData.append("social_links", JSON.stringify(profileData.social))
        
        if(profileData.profileImage instanceof File){
            formData.append("profile_image", profileData.profileImage)
        }

        if(profileData.bannerImage instanceof File){
            formData.append("banner_image", profileData.bannerImage)
        }

        try{
            const res = await axios.put("http://localhost:8000/api/update-profile/",
                formData,{
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "multipart/form-data"
                    }
                }
            )
            console.log("Profile updated!!", res.data)
        } catch(err){
            console.error("Unable to udpate, please try again later!", err.response?.data || err.message)
        }

        onSave()
    }

    return(
        <>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-3 border border-black rounded-lg">
          <input className="p-2 border-b-2 border-gray-500 outline-none focus:outline-none" name="firstName" value={profileData.firstName} onChange={handleChange} placeholder="Full Name" />
          <input className="p-2 border-b-2 border-gray-500 outline-none focus:outline-none" name="email" value={profileData.email} onChange={handleChange} placeholder="Email" />
          <textarea name="bio" className="p-2 border-b-2 border-gray-500 outline-none focus:outline-none" value={profileData.bio} onChange={handleChange} placeholder="Bio" />
          <input className="p-2 border-b-2 border-gray-500 outline-none focus:outline-none" name="twitter" value={profileData.social.twitter} onChange={handleSocialChange} placeholder="Twitter Link" />
          <input className="p-2 border-b-2 border-gray-500 outline-none focus:outline-none" name="linkedin" value={profileData.social.linkedin} onChange={handleSocialChange} placeholder="LinkedIn Link" />
          <input className="p-2 border-b-2 border-gray-500 outline-none focus:outline-none" name="github" value={profileData.social.github} onChange={handleSocialChange} placeholder="GitHub Link" />
          
          <label className="font-bold">Upload profile image</label>
          <input className="p-2 border-b-2 border-gray-500 outline-none focus:outline-none" type="file" name="profileImage" onChange={handleImageChange} />
          
          <label className="font-bold">Upload banner image</label>
          <input className="p-2 border-b-2 border-gray-500 outline-none focus:outline-none" type="file" name="bannerImage" onChange={handleImageChange} />
          <button type="submit" className="w-full inline-flex justify-center whitespace-nowrap rounded-lg bg-black px-3.5 py-2.5 font-bold text-white shadow-sm shadow-indigo-950/10 hover:bg-gray-900 focus:outline-none focus:ring">Save</button>
          <button type="button" onClick={onCancel} className="bg-gray-300 font-bold text-gray-800 px-4 py-2 rounded hover:bg-gray-400">
            Cancel
          </button>
        </form>
        </>
    )
}