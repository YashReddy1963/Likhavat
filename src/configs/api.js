import axios from "axios"

const api = axios.create({
    baseURL: "http://localhost:8000/api/"
})

api.interceptors.response.use(
    (response) => response,
    async (error) =>{
        const originalRequest = error.config

        if(error.response?.status === 401 && !originalRequest._retry){
            originalRequest._retry = true

            const refreshToken = localStorage.getItem("refreshToken")
            try{
                const response = await axios.post("http://localhost:8000/api/token/refresh/", {
                    refresh: refreshToken,
                })

                const newAccessToken = response.data.access
                localStorage.setItem("accessToken", newAccessToken)

                originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`
                return api(originalRequest)

            } catch (refreshError){
                localStorage.removeItem("accessToken")
                localStorage.removeItem("refreshToken")
                window.location.href = "/auth/sign-in"
                return Promise.reject(refreshError)
            }
        }
        return Promise.reject(error)
    }
)

export default api