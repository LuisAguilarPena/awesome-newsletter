import express from "express"
import dotenv from "dotenv"
import { S3Client } from "@aws-sdk/client-s3"
import multer from "multer"
import multerS3 from "multer-s3"
import cors from "cors"
import { writeFileSync, readFileSync } from 'node:fs'

dotenv.config()
const app = express()

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})

//! Better understand this section
let upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET,
    key: function (req, file, cb) {
      cb(null, Date.now() + "-" + file.originalname)
    },
  }),
}).single("file")

app.use(cors())

app.post("/upload", upload, (req, res) => {
  const url = req.file.location
  res.send(`File uploaded successfully. ${url}`)

  //TODO mock writing to DB
  const staleNewslettersJSON = readFileSync("./mockedDB/collections/newsletters.json")
  const staleNewsletters = JSON.parse(staleNewslettersJSON)
  const newsletters = staleNewsletters
  newsletters.push({name: url.match(/([^\/]+)(?=[^\/]*\/?$)/), url: url})
  writeFileSync("./mockedDB/collections/newsletters.json", JSON.stringify(newsletters))
})

app.listen(3000, () => {
  console.log("Server is up on http://localhost:3000")
})
