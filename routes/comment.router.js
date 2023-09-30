const express = require("express")
const router = express.Router()

const commentController = require('../controllers/comment.controller')

router.get("/comment", commentController.getCommentAll)
router.get("/comment_history", commentController.getHistoryAll)
router.post("/comment", commentController.create)
router.delete("/:id", commentController.deleteById)

module.exports = router