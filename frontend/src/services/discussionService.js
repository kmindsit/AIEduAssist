import axiosInstance from '../utils/axios';

const discussionService = {
  getCourseDiscussions: (courseId, params = {}) =>
    axiosInstance.get(`/discussions/courses/${courseId}`, { params }),

  getDiscussionDetail: (courseId, discussionId) =>
    axiosInstance.get(`/discussions/${courseId}/discussions/${discussionId}`),

  createDiscussion: (courseId, discussionData) =>
    axiosInstance.post(`/discussions/courses/${courseId}`, discussionData),

  replyToDiscussion: (courseId, discussionId, replyData) =>
    axiosInstance.post(
      `/discussions/${courseId}/discussions/${discussionId}/reply`,
      replyData
    ),

  upvoteDiscussion: (courseId, discussionId) =>
    axiosInstance.post(
      `/discussions/${courseId}/discussions/${discussionId}/upvote`
    ),

  pinDiscussion: (courseId, discussionId) =>
    axiosInstance.put(
      `/discussions/${courseId}/discussions/${discussionId}/pin`
    ),

  lockDiscussion: (courseId, discussionId) =>
    axiosInstance.put(
      `/discussions/${courseId}/discussions/${discussionId}/lock`
    ),

  deleteDiscussion: (courseId, discussionId) =>
    axiosInstance.delete(
      `/discussions/${courseId}/discussions/${discussionId}`
    ),

  searchDiscussions: (courseId, query) =>
    axiosInstance.get(`/discussions/courses/${courseId}`, {
      params: { search: query },
    }),
};

export default discussionService;
