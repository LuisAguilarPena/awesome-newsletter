import dotenv from "dotenv"
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"
import multer from "multer"
import multerS3 from "multer-s3"
import { readFileSync, writeFile } from "node:fs"
import nodemailer from "nodemailer"

dotenv.config()

export function removeItemFromArrayOnce(arr, value) {
  var index = arr.indexOf(value)
  if (index > -1) {
    arr.splice(index, 1)
  }
  return arr
}

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})

export const uploadToS3 = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET,
    key: function (req, file, cb) {
      cb(null, Date.now() + "-" + file.originalname)
    },
  }),
}).single("file")

export async function getS3Object(key) {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key, // filename or object name
  }

  const command = new GetObjectCommand(params)

  try {
    const data = await s3.send(command)
    return data.Body
  } catch (err) {
    return null
  }
}

export function readJsonAndParse(path) {
  return JSON.parse(readFileSync(path))
}

export function writeFileToMockDb(path, arr, res, errorMsg, successMsg) {
  return writeFile(
    path,
    JSON.stringify(arr),
    err => {
      if (err) {
        return res.send(errorMsg)
      } else {
        return res.send(successMsg)
      }
    },
  )
}

export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true, // to use TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})