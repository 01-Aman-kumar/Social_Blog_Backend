import express from "express";
import { searchSuggestions } from "../controllers/searchController.js";

const router = express.Router();

router.get("/suggest", searchSuggestions);

export default router;
