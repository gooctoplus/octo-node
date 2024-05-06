import axios from 'axios';
import dotenv from 'dotenv';
import { Octokit } from "@octokit/core"; // Added for GitHub API interactions

dotenv.config();

export async function commentOnTicket(projectUrl, jiraToken, jiraEmail, ticketId, comment, status, prUrl) {

    const JIRA_BASE_URL = projectUrl;
    const JIRA_AUTH = `Basic ${Buffer.from(`${jiraEmail}:${jiraToken}`).toString('base64')}`;

    const url = `${JIRA_BASE_URL}/rest/api/3/issue/${ticketId}/comment`;

    let data = {
        body: {
            version: 1,
            type: 'doc',
            content: [{
                type: 'paragraph',
                content: [{
                    text: comment,
                    type: 'text'
                }]
            }]
        }
    };

    try {
        if(status === "PR_CREATED"){
            data = {
                body: {
                    version: 1,
                    type: 'doc',
                    content: [
                        {
                            type: 'paragraph',
                            content: [
                                {
                                    text: comment,
                                    type: 'text'
                                },
                                {
                                    type: 'text',
                                    text: ' View PR',
                                    marks: [
                                        {
                                            type: 'link',
                                            attrs: {
                                                href: prUrl
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            };
            
        }
        await axios.post(url, data, {
            headers: {
                'Authorization': JIRA_AUTH,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        console.log('Commented on Jira ticket ', status);

        if(status === "CHANGE_TO_INPROGRESS") {
            const transitionsResponse = await axios.get(`${JIRA_BASE_URL}/rest/api/2/issue/${ticketId}/transitions`, {
                headers: {
                    'Authorization': JIRA_AUTH,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            console.log(transitionsResponse.data.transitions)
    
            const inProgressTransition = transitionsResponse.data.transitions.find(transition => transition.name.toLowerCase() === 'in progress');
    
            if (!inProgressTransition) {
                console.error('Transition to In Progress not found');
                return;
            }
    
            await axios.post(`${JIRA_BASE_URL}/rest/api/3/issue/${ticketId}/transitions`, {
                transition: { id: inProgressTransition.id }
            }, {
                headers: {
                    'Authorization': JIRA_AUTH,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            console.log('Jira ticket status changed to In Progress');
        }
    } catch (error) {
        console.error('Error posting comment:', error.response ? error.response.data : error.message);
    }
}

// GitHub integration for commenting on a specific pull request comment
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN }); // Added for GitHub API interactions

export async function postCommentReply(prNumber, commentId, replyText) {
    try {
        // Correctly using the GitHub API endpoint for creating a comment on a pull request's associated issue
        const response = await octokit.request('POST /repos/{owner}/{repo}/issues/{issue_number}/comments', {
            owner: process.env.GITHUB_ORG_OR_USERNAME,
            repo: process.env.GITHUB_REPO_NAME,
            issue_number: prNumber,
            body: replyText
        });
        console.log(`Reply posted successfully: ${response.data.html_url}`);
    } catch (error) {
        console.error('Failed to post comment reply:', error.response ? error.response.data.message : error.message);
        if (error.status === 403 && error.response && error.response.data.message.includes('API rate limit exceeded')) {
            console.error('GitHub API rate limit exceeded', error);
        } else if (error.status === 404) {
            console.error('Pull request or comment not found', error);
        } else {
            console.error('An unexpected error occurred', error);
        }
        throw error;
    }
}