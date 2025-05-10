import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import otp from "/img/otp.jpg"

export function OTP(){
    const [otpDigits, setOtpDigits] = useState(["","","","","",""])
    const navigate = useNavigate()
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const storedEmail = localStorage.getItem("otpEmail");
        if (!storedEmail) {
          alert("No email found. Please register first.");
          navigate("/auth/sign-up");
        }
        setEmail(storedEmail);
      }, []);

    const handleChange = (value, index) =>{
        if (/^\d?$/.test(value)) {
            const newDigits = [...otpDigits];
            newDigits[index] = value;
            setOtpDigits(newDigits);
          }
    }

    const handleSubmit = async (e)=>{
        e.preventDefault()
        setLoading(true)
        const fullOTP = otpDigits.join("")

        try{
            const response = await axios.post("http://localhost:8000/api/verify-otp/", {
                email,
                otp: fullOTP,
            })
            if(response.status === 200 || response.status === 201){
                alert("Account verified successfully!")
                localStorage.removeItem("otpEmail");
                navigate("/auth/sign-in")
            }
        }catch(err){
            console.error(err)
            alert(err.response?.data?.detail || "OTP verification failed!")
        }finally{
            setLoading(false)
        }
    }

    return(
        <>
        <section className="m-8 flex">
           <div class="max-w-md mx-auto text-center px-3 sm:px-8 mt-20">
            <header class="mb-8">
                <h1 class="text-4xl font-bold mb-1">Gmail Verification</h1>
                <p class="text-lg font-normal" color="blue-gray" className="text-blue-gray-900">Enter the 4-digit verification code that was sent to your gmail.</p>
            </header>

            {loading ? (
            <div className="flex justify-center">
              <div className="w-6 h-6 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
            </div>            
            ) : (
            <form id="otp-form" onSubmit={handleSubmit}>
                <div class="flex items-center justify-center gap-3">
                {otpDigits.map((digit, index) => (
                    <input
                        key={index}
                        type="text"
                        value={digit}
                        onChange={(e) => handleChange(e.target.value, index)}
                        className="w-14 h-14 text-center text-2xl font-extrabold text-slate-900 bg-slate-100 border border-gray-600 hover:border-slate-200 rounded p-4 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                        maxLength="1"
                    />
                ))}
                </div>
                <div class="max-w-[260px] mx-auto mt-4">
                    <button type="submit"
                        class="w-full inline-flex justify-center whitespace-nowrap rounded-lg bg-gray-900 px-3.5 py-2.5 text-xs font-bold text-white shadow-sm shadow-indigo-950/10 hover:bg-gray-800 focus:outline-none focus:ring focus:ring-light-blue-500 focus-visible:outline-none
                        focus-visible:bg-gray-800 
                        focus-visible:ring focus-visible:ring-light-blue-300 transition-colors duration-150">VERIFY
                        ACCOUNT</button>
                </div>
            </form>
            )}

    </div>
    <div className="w-2/5 h-full hidden lg:block">
        <img
          src={otp}
          className="h-full w-full object-cover rounded-3xl"
        />
    </div> 
        </section>
        
    </>
    )
}

export default OTP;