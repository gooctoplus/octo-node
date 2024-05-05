import axios from 'axios';

/**
 * Posts a reply to a GitHub comment.
 * @param {string} commentUrl - The API URL to post the reply to.
 * @param {string} message - The reply message.
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function handleCommentReply(commentUrl, message) {
    try {
        const response = await axios.post(commentUrl, {
            body: message
        }, {
            headers: {
                'Authorization': `token ${process.env.GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (response.status === 201) {
            console.log('Successfully posted reply to GitHub comment:', commentUrl);
            return { success: true };
        } else {
            console.error('Failed to post reply to GitHub comment. GitHub API responded with status:', response.status);
            return { success: false, error: `GitHub API responded with status: ${response.status}` };
        }
    } catch (error) {
        console.error('Error posting reply to GitHub comment:', error, 'Comment URL:', commentUrl);
        return { success: false, error: error.message };
    }
}