import axios from 'axios';

export async function fetchMessageFromUrl() {
    try {
        const response = await axios.get('https://xyz.com/ntdd/my_message');
        return response.data;
    } catch (error) {
        console.error('Error fetching message from URL:', error.message);
        return null;
    }
}

/**
 * Posts a reply to a GitHub comment.
 * @param {string} commentUrl - The API URL to post the reply to.
 * @param {string} message - The reply message.
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function handleCommentReply(commentUrl, message) {
    try {
        const fetchedMessage = await fetchMessageFromUrl();
        if (fetchedMessage === null) {
            console.error('Failed to fetch new message. Aborting reply to GitHub comment.');
            return { success: false, error: 'Failed to fetch new message.' };
        }

        const response = await axios.post(commentUrl, {
            body: fetchedMessage
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
        console.error('Error posting reply to GitHub comment:', error.message, 'Comment URL:', commentUrl);
        return { success: false, error: error.message };
    }
}