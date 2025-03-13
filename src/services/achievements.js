import axios from 'axios'
import { getAuthHeader } from './config'

export const baseURL = `${process.env.REACT_APP_API_URL}/achievements`

const getAllAchievements = async () => {
  const response = await axios.get(`${baseURL}`, getAuthHeader())
  return response.data
}

const achievementsService = {
  getAllAchievements
}
export default achievementsService
