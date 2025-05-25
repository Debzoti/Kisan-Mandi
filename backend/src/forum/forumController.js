import forumModel from "../models/forumModel.js";
import createHttpError from "http-errors";
import mongoose from "mongoose";

export const createQuestion = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    console.log(req.body);

    if (!title || !description) {
      console.log("Title and description are required");
      return next(createHttpError(400, "Title and description are required"));
    }

    const newQuestionData = {
      title,
      description,
      userId: req.userId,
    };

    const newQuestion = await forumModel.create(newQuestionData);

    res.status(201).json(newQuestion);
  } catch (error) {
    console.error("Error in createQuestion:", error);
    return next(createHttpError(500, "Error while creating question"));
  }
};

export const getQuestions = async (req, res, next) => {
  try {
    const questions = await forumModel
      .find({})
      .populate({ path: "userId", select: "name" });
    res.json(questions);
  } catch (error) {
    console.error("Error in getQuestions:", error);
    return next(createHttpError(500, "Error while getting questions"));
  }
};

export const postComment = async (req, res, next) => {
  try {
    const { comment } = req.body;
    const { id: questionId } = req.params;

    console.log(comment);
    if (!comment) {
      return next(createHttpError(400, "Comment is required"));
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return next(createHttpError(400, "Invalid question ID format"));
    }

    const question = await forumModel.findById(questionId);

    if (!question) {
      return next(createHttpError(404, "Question not found"));
    }

    question.comments.push({
      userId: req.userId,
      comment,
    });
    await question.save();
    res.status(201).json(question);
  } catch (error) {
    console.error("Error in postComment:", error);
    return next(createHttpError(500, "Error while posting comment"));
  }
};

export const getForumPostByid = async (req, res, next) => {
  try {
    console.log(req.params);
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(createHttpError(400, "Invalid forum post ID format"));
    }

    const forumPost = await forumModel.findById(id).populate("userId", "name");

    if (!forumPost) {
      return res.status(404).json({ message: "Forum post not found" });
    }

    res.status(200).json(forumPost);
  } catch (error) {
    console.error("Error in getForumPostById:", error);
    return next(createHttpError(500, "Error while getting forum post by ID"));
  }
};
