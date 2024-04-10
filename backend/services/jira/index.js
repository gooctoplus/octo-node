import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const JIRA_BASE_URL = process.env.JIRA_BASE_URL;
const JIRA_AUTH = process.env.JIRA_AUTH;

export async function commentOnTicket(ticketId, comment, status, prUrl) {
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
                                    text: 'View',
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