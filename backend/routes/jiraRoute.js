import express from "express";
import { commentOnTicket } from "../services/jira/index.js";
import { spawn } from "child_process";
import Org from "../models/orgModel";
import Project from "../models/projectModel";
import Issue from "../models/issueModel";

const router = express.Router();
router.post("/:orgId/webhook", async (req, res) => {
  try {
    const { issue } = req.body;
    const { orgId } = req.params;

    const org = await Org.findOne({ orgId });
    if (org) {
      const { pineconeAPIKey, openAIKey } = org;
      const projects = await Project.find({ orgId });
      const currentProject = projects.find((project) =>
        issue.self.includes(project.url)
      );

      const repoUrl = currentProject.repos[0].url;
      const repoTargetPath = currentProject.repos[0].repoTargetPath;
      const pineconeIndex = currentProject.repos[0].pineconeIndex;
      const defaultBranch = currentProject.repos[0].defaultBranch;
      const languages = currentProject.repos[0].languages;
      const suffixes = currentProject.repos[0].suffixes;
      const projectUrl = currentProject.url;

      // fetch project using currentProject
      if (
        req.body.webhookEvent === "comment_created" &&
        req.body.comment.author.displayName === "Octo"
      ) {
        console.log(
          "Update made by the bot or author is Octo, ignoring to prevent loop."
        );
        return res.status(200).send("Ignored sdbot update");
      }

      if (
        req.body.webhookEvent === "jira:issue_updated" &&
        req.body.issue_event_type_name === "issue_assigned" &&
        req.body.issue.fields.assignee.displayName === "Octo"
      ) {
        // Issue creation
        const {
          issuetype,
          priority,
          status,
          summary,
          created,
          updated,
          reporter,
          description,
        } = issue.fields;

        const issueData = {
          orgId: orgId,
          project: currentProject?._id,
          issueType: issuetype.name,
          priority: priority.name,
          status: status.name,
          summary: summary,
          reporter: reporter.displayName,
          description: description,
          createdAt: created,
          lastUpdatedAt: updated,
        };

        try {
          const updatedIssue = await Issue.findOneAndUpdate(
            { issueId: issue.id }, // query
            issueData, // update
            { new: true, upsert: true } // options
          );
          console.log("Issue updated or created in database", updatedIssue);
        } catch (error) {
          console.log("Error in updating or creating issue", error);
        }

        const ticketId = issue.key;
        const ticketDescription = issue.fields.description;

        // Log the assigned ticket
        console.log(`Assigned ticket: ${ticketId}`);

        const pythonProcess = spawn(
          "/app/octoplus/bin/python",
          [
            "/app/octoplus/octo/main.py",
            `--ticket=${ticketDescription}`,
            `--ticket-id=${ticketId}`,
            `--pineconeAPIKey=${pineconeAPIKey}`,
            `--openAIKey=${openAIKey}`,
            `--pineconeIndex=${pineconeIndex}`,
            `--repoUrl=${repoUrl}`,
            `--repoTargetPath=${repoTargetPath}`,
            `--defaultBranch=${defaultBranch}`,
            `--languages=${languages.join(",")}`,
            `--suffixes=${suffixes.join(",")}`,
            `--projectUrl=${projectUrl}`,
          ],
          {
            cwd: "/app/octoplus/octo/",
          }
        );
        pythonProcess.stdout.on("data", (data) => {
          console.log(`stdout: ${data}`);
        });

        pythonProcess.stderr.on("data", (data) => {
          console.error(`stderr: ${data}`);
        });

        pythonProcess.on("close", (code) => {
          console.log(`child process exited with code ${code}`);
          res.send("Python script executed");
        });
      }
    } else {
      console.log("org not found");
      res.status(404).send("Org not found");
    }
    res.status(200).send("Webhook received");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/comment", async (req, res) => {
  const { comment, ticketId, status, prUrl, projectUrl } = req.body;
  const project = await Project.findOne({ url: projectUrl });

  commentOnTicket(
    project.url,
    project.jiraToken,
    project.jiraEmail,
    ticketId,
    comment,
    status,
    prUrl
  );
  res.send("Comment received successfully");
});

export default router;
