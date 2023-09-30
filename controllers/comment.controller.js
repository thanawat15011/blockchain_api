const postgre = require("../database")
const commentController = {
  getCommentAll: async (req, res) => {
    try {
      const { rows } = await postgre.query("SELECT * FROM comment")
      res.json({ msg: "OK", data: rows })
    } catch (error) {
      res.json({ msg: error.msg })
    }
  },
  getHistoryAll: async (req, res) => {
    try {
      const { rows } = await postgre.query("SELECT * FROM comment_history")
      res.json({ msg: "OK", data: rows })
    } catch (error) {
      res.json({ msg: error.msg })
    }
  },
  create: async (req, res) => {
    console.log("req.body :>> ", req)
    try {
      const { index, previousHash, timestamp, data, ipAddress, hash } = req.body

      // สร้าง comment ในตาราง comment
      const commentSql = `
            INSERT INTO comment (comment_index, previousHash, timestamp, data, ipAddress, hash, isDeleted)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
          `

      const commentValues = [
        index,
        previousHash,
        timestamp,
        JSON.stringify(data),
        ipAddress,
        hash,
        "active",
      ]

      const commentResult = await postgre.query(commentSql, commentValues)

      // สร้าง comment-history ในตาราง comment-history
      const historySql = `
            INSERT INTO comment_history (comment_index, previousHash, timestamp, data, ipAddress, hash, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
          `

      const historyValues = [
        index,
        previousHash,
        timestamp,
        JSON.stringify(data),
        ipAddress,
        hash,
        1,
      ]

      const historyResult = await postgre.query(historySql, historyValues)

      res
        .status(201)
        .json({
          message: "เพิ่ม comment และ comment-history สำเร็จ",
          data: {
            comment: commentResult.rows[0],
            history: historyResult.rows[0],
          },
        })
    } catch (error) {
      res
        .status(500)
        .json({ error: "ไม่สามารถเพิ่ม comment และ comment-history ได้" })
    }
  },
  deleteById: async (req, res) => {
    try {
      const commentId = req.params.id

      // ดึงข้อมูลความคิดเห็นที่จะลบ
      const selectSql = "SELECT * FROM comment WHERE id = $1"
      const selectValues = [commentId]

      const selectResult = await postgre.query(selectSql, selectValues)

      if (selectResult.rows.length === 0) {
        res.status(404).json({ error: "ไม่พบความคิดเห็นที่ต้องการลบ" })
        return
      }

      const commentData = selectResult.rows[0]

      // เพิ่มข้อมูลความคิดเห็นที่จะลบลงใน comment_history
      const insertHistorySql = `
            INSERT INTO comment_history (comment_index, previousHash, timestamp, data, ipAddress, hash)
            VALUES ($1, $2, $3, $4, $5, $6)
          `

      const insertHistoryValues = [
        commentData.comment_index,
        commentData.previousHash,
        commentData.timestamp,
        commentData.data,
        commentData.ipAddress,
        commentData.hash,
      ]

      await postgre.query(insertHistorySql, insertHistoryValues)

      // ลบความคิดเห็นจาก comment หลังจากเก็บข้อมูลใน comment_history เรียบร้อยแล้ว
      const deleteSql =
        "UPDATE comment SET isDeleted = $1, deleteTime = NOW() WHERE id = $2"
      const deleteValues = ["deleted", commentId]

      await postgre.query(deleteSql, deleteValues)

      res.status(200).json({ message: "ลบความคิดเห็นสำเร็จ" })
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการลบความคิดเห็น: ", error)
      res.status(500).json({ error: "ไม่สามารถลบความคิดเห็นได้" })
    }
  },
}

module.exports = commentController
