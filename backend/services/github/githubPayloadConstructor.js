/**
 * Constructs the payload for a GitHub comment API request.
 * Supports both markdown and plain text comments.
 * @param {string} commentText - The text of the comment.
 * @param {boolean} isMarkdown - Flag indicating if the text is in Markdown format.
 * @returns {Object} The payload object for the GitHub API request.
 */
function constructCommentPayload(commentText, isMarkdown = false) {
  try {
    console.log('Constructing payload for GitHub comment API request.');

    // If the comment should be treated as markdown, wrap it in triple backticks for code block formatting
    const formattedText = isMarkdown ? `\`\`\`${commentText}\`\`\`` : commentText;

    // Construct the payload object
    const payload = {
      body: formattedText,
    };

    console.log('Payload construction successful.');
    return payload;
  } catch (error) {
    console.error('Error constructing payload for GitHub comment API request:', error);
    throw error; // Rethrow after logging for further handling by calling functions
  }
}

module.exports = {
  constructCommentPayload,
};