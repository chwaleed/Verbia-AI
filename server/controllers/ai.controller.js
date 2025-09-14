import "dotenv/config";
import OpenAI from "openai";
import { clerkClient } from "@clerk/express";
import sql from "../config/db.js";
import axios from "axios";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import pdf from "pdf-parse/lib/pdf-parse.js";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDNARY_CLOUD_NAME,
  api_key: process.env.CLOUDNARY_API_KEY,
  api_secret: process.env.CLOUDNARY_API_SECRET,
});

const AI = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

export const generateArticle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt, length } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        message: "Limit Reached. Upgrade to premium to continue.",
      });
    }

    console.log("called Gemini API with prompt:", prompt);

    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: length,
    });

    const content = response.choices[0].message.content;

    await sql` INSERT INTO creations (user_id,prompt, content,type)
    VALUES (${userId}, ${prompt} , ${content} , 'article') `;

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }
    res.json({ success: true, content });
  } catch (error) {
    console.log("Error in generateArticle controllers: ", error.message);
    res.json({ success: false, message: error.message });
  }
};

export const generateBlogTitle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    console.log("User plan:", plan, "Free usage:", free_usage);

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        message: "Limit Reached. Upgrade to premium to continue.",
      });
    }

    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 100,
    });
    console.log(response);

    const content = response.choices[0].message.content;

    await sql` INSERT INTO creations (user_id,prompt, content,type)
    VALUES (${userId}, ${prompt} , ${content} , 'Blog Article') `;

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }
    res.json({ success: true, content });
  } catch (error) {
    console.log("Error in generateBlogTitle Controller: ", error.message);
    res.json({ success: false, message: error.message });
  }
};

export const generateImage = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt, publish } = req.body;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This Feature is only available for premium subscriptions",
      });
    }

    const formData = new FormData();
    formData.append("prompt", prompt);
    const { data } = await axios.post(
      "https://clipdrop-api.co/text-to-image/v1",
      formData,
      {
        headers: { "x-api-key": process.env.CLIPDROP_API_KEY },
        responseType: "arraybuffer",
      }
    );

    const base64Image = `data:image/png;base64,${Buffer.from(
      data,
      "binary"
    ).toString("base64")}`;

    const { secure_url } = await cloudinary.uploader.upload(base64Image);

    console.log("Image uploaded to Cloudinary:", secure_url);

    await sql` INSERT INTO creations (user_id,prompt, content,type,publish)
    VALUES (${userId}, ${prompt} , ${secure_url} , 'Image' ,${
      publish ?? false
    }) `;

    res.json({ success: true, content: secure_url });
  } catch (error) {
    console.log("Error in generateImage Controller: ", error.message);
    res.json({ success: false, message: error.message });
  }
};

export const removeImageBackground = async (req, res) => {
  try {
    const { userId } = req.auth();
    const image = req.file;
    const plan = req.plan;

    // Check if file was uploaded
    if (!image) {
      console.log("No file uploaded");
      return res.json({
        success: false,
        message: "No image file uploaded. Please select an image file.",
      });
    }

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This Feature is only available for premium subscriptions",
      });
    }

    console.log("Uploading to Cloudinary:", image.path);
    const { secure_url } = await cloudinary.uploader.upload(image.path, {
      transformation: [
        {
          effect: "background_removal",
          background_removal: "remove_the_background",
        },
      ],
    });

    console.log("Image uploaded to Cloudinary:", secure_url);

    await sql` INSERT INTO creations (user_id,prompt, content,type)
    VALUES (${userId}, 'remove backround from image' , ${secure_url} , 'image' ) `;

    res.json({ success: true, content: secure_url });
  } catch (error) {
    console.log("Error in removeImageBackground Controller: ", error.message);
    res.json({ success: false, message: error.message });
  }
};

export const removeImageObject = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { object } = req.body;
    const image = req.file;
    const plan = req.plan;

    // Check if file was uploaded
    if (!image) {
      console.log("No file uploaded");
      return res.json({
        success: false,
        message: "No image file uploaded. Please select an image file.",
      });
    }

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This Feature is only available for premium subscriptions",
      });
    }

    console.log("Uploading to Cloudinary:", image.path);

    // Upload with object removal transformation
    const { secure_url } = await cloudinary.uploader.upload(image.path, {
      transformation: [
        {
          effect: `gen_remove:${object}`,
        },
      ],
    });

    console.log("Image uploaded to Cloudinary:", secure_url);

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${`Removed ${object} from image`}, ${secure_url}, 'image')
    `;

    res.json({ success: true, content: secure_url });
  } catch (error) {
    console.log("Error in removeImageObject Controller:", error.message);
    res.json({ success: false, message: error.message });
  }
};

export const resumeReview = async (req, res) => {
  try {
    const { userId } = req.auth();
    const resume = req.file;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions",
      });
    }

    if (!resume) {
      console.log("No file uploaded");
      return res.json({
        success: false,
        message: "No resume file uploaded. Please select a PDF file.",
      });
    }

    if (resume.size > 5 * 1024 * 1024) {
      return res.json({
        success: false,
        message: "Resume file size exceeds allowed size (5MB)",
      });
    }

    // Use resume.buffer if Multer is in memory mode, otherwise resume.path
    const dataBuffer = resume.buffer
      ? resume.buffer
      : fs.readFileSync(resume.path);

    const pdfData = await pdf(dataBuffer);

    const prompt = `Review the following resume and provide constructive feedback on its strengths, weaknesses, and areas for improvement:\n\n${pdfData.text}`;

    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content =
      response.choices?.[0]?.message?.content?.[0]?.text ||
      response.choices?.[0]?.message?.content ||
      "No response generated.";

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, 'Review the uploaded resume', ${content}, 'resume-review')
    `;

    res.json({ success: true, content });
  } catch (error) {
    console.error("Error in resumeReview Controller:", error);
    res.json({ success: false, message: error.message });
  }
};
