import { POST_COMMENT_REPLY_REQUEST, POST_COMMENT_REPLY_SUCCESS, POST_COMMENT_REPLY_FAILURE } from './actionTypes';

// Action to signify the start of a comment reply post
export const postCommentReplyRequest = () => ({
  type: POST_COMMENT_REPLY_REQUEST,
});

// Action for the successful posting of a comment reply
export const postCommentReplySuccess = (reply) => ({
  type: POST_COMMENT_REPLY_SUCCESS,
  payload: reply,
});

// Action for handling errors when posting a comment reply
export const postCommentReplyFailure = (error) => ({
  type: POST_COMMENT_REPLY_FAILURE,
  payload: error,
});