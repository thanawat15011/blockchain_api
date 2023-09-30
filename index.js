const express = require("express")
const app = express()

require('dotenv').config()

app.use(express.json())


const commentRouter = require('./routes/comment.router')

app.use("/api", commentRouter)

app.listen(process.env.PORT, () => console.log("Server is running on port 5000"))