const express = require("express");
const cors = require("cors"); // เพิ่มการนำเข้า cors

const app = express();

require("dotenv").config();

app.use(express.json());

// เปิดการใช้งาน middleware cors
app.use(cors());

const commentRouter = require("./routes/comment.router");

app.use("/api", commentRouter);

app.listen(process.env.PORT, () => console.log("Server is running on port 5000"));
