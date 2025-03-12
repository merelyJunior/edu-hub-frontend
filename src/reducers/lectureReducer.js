import lectureService from '../services/lectures'
import { GET_ALL_LECTURES, LOAD_LECTURES } from '../actions/lecture'

import { notification } from 'antd'

const iso8601Duration = (duration) => {
  const durationRegex =
    /(-)?P(?:([.,\d]+)Y)?(?:([.,\d]+)M)?(?:([.,\d]+)W)?(?:([.,\d]+)D)?T(?:([.,\d]+)H)?(?:([.,\d]+)M)?(?:([.,\d]+)S)?/

  const matches = duration.match(durationRegex)

  // seconds
  if (!matches[7]) return `${matches[8]}`
  // min:seconds
  if (!matches[6]) return `${matches[7]}:${matches[8]}`
  // hours:mins:seconds
  if (!matches[5]) return `${matches[6]}:${matches[7]}:${matches[8]}`
}

const lectureReducer = (state = { data: [], loading: false }, action) => {
  switch (action.type) {
    case GET_ALL_LECTURES:
      return { data: action.data, loading: false }
    case LOAD_LECTURES:
      return { data: [], loading: true }
    default:
      return state
  }
}

export const getAllLectures = (courseId) => {
  return async (dispatch) => {
    try {
      dispatch({ type: LOAD_LECTURES })
      console.log(`Fetching lectures for course ID: ${courseId}`); // Лог запроса

      const response = await lectureService.getAllLectures(courseId);
      console.log('Lectures fetched: ', response); // Лог полученных лекций

      const videoIds = response.reduce((accumulator, item, index) => {
        const videoId = `${item.videoId}`;
        if (index === 0) {
          return accumulator.concat(videoId);
        }
        return accumulator.concat(`,${videoId}`);
      }, '');

      console.log('Video IDs concatenated: ', videoIds); // Лог ID видео

      if (videoIds) {
        const data = await lectureService.getLecturesData(videoIds);
        console.log('Video data fetched: ', data); // Лог данных с YouTube API

        for (let i = 0; i < data.items.length; i++) {
          response[i].thumbnail = data.items[i].snippet.thumbnails.medium;
          response[i].youtubeDescription = data.items[i].snippet.description;
          response[i].youtubeTitle = data.items[i].snippet.title;
          response[i].publishedAt = data.items[i].snippet.publishedAt
            .slice(0, 10)
            .replaceAll('-', '/');
          response[i].duration = iso8601Duration(data.items[i].contentDetails.duration);
        }
      }

      console.log('Processed lectures with additional data: ', response); // Лог после обработки

      dispatch({ type: GET_ALL_LECTURES, data: response });
    } catch (error) {
      console.error('Error fetching lectures: ', error); // Лог ошибки
      notification.error({
        message: "Couldn't load Lectures, check your connection"
      });
    }
  }
}


export default lectureReducer
