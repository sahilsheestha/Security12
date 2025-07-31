import { createContext, useEffect, useState } from "react";
import { toast } from 'react-toastify'
import axios from 'axios'

export const AppContext = createContext();

const AppContextProvider = (props) => {

  const currencySymbol = '$'
  const backendUrl = import.meta.env.VITE_BACKEND_URL

  const [doctors, setDoctors] = useState([])
  const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : false)
  const [sessionId, setSessionId] = useState(localStorage.getItem('sessionId') ? localStorage.getItem('sessionId') : false)
  const [userData, setUserData] = useState(false)

  // Configure axios defaults for security
  useEffect(() => {
    axios.defaults.withCredentials = true // Enable cookies for all requests
  }, [])

  const getDoctorsData = async () => {

    try {

      const { data } = await axios.get(backendUrl + '/api/doctor/list')
      if (data.success) {
        setDoctors(data.doctors)
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }

  }

  const loadUserProfileData = async () => {

    try {

      const { data } = await axios.get(backendUrl + '/api/user/get-profile', { 
        headers: { token },
        withCredentials: true
      })

      if (data.success) {
        setUserData(data.userData)
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }

  }

  const logout = async () => {
    try {
      if (token && sessionId) {
        await axios.post(backendUrl + '/api/user/logout', {
          userId: userData?._id,
          sessionId
        }, {
          headers: { token },
          withCredentials: true
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear all auth data
      localStorage.removeItem('token')
      localStorage.removeItem('sessionId')
      setToken(false)
      setSessionId(false)
      setUserData(false)
      toast.success('Logged out successfully')
    }
  }

  const value = {
    doctors, getDoctorsData,
    currencySymbol,
    token, setToken,
    sessionId, setSessionId,
    backendUrl,
    userData, setUserData,
    loadUserProfileData,
    logout
  }

  useEffect(() => {
    getDoctorsData()
  }, [])

  useEffect(() => {
    if (token) {
      loadUserProfileData()
    } else {
      setUserData(false)
    }
  }, [token])

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  )

}

export default AppContextProvider