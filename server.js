import express from "express"
import dotenv from "dotenv"
import { S3Client } from "@aws-sdk/client-s3"
import multer from "multer"
import multerS3 from "multer-s3"
import cors from "cors"
import { writeFileSync, readFileSync, writeFile } from "node:fs"
import nodemailer from "nodemailer"
import path from "node:path"
import { Buffer } from "node:buffer"

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
  const staleNewslettersJSON = readFileSync(
    "./mockedDB/collections/newsletters.json",
  )
  const staleNewsletters = JSON.parse(staleNewslettersJSON)
  const newsletters = staleNewsletters
  newsletters.push({ name: url.match(/([^/]+)(?=[^/]*\/?$)/), url: url })
  writeFileSync(
    "./mockedDB/collections/newsletters.json",
    JSON.stringify(newsletters),
  )
})

app.use(express.json())

app.post("/submit", (req, res) => {
  //TODO check for better ways to validate email address
  const emails = req.body.emails.filter(email =>
    email.match(/^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/),
  )

  if (!emails.length > 0) {
    return res.status(500).send("Error writing file")
  }

  const staleEmailsJSON = readFileSync("./mockedDB/collections/emails.json")
  const staleEmails = JSON.parse(staleEmailsJSON)
  const uniqueTotalEmails = new Set(staleEmails.concat(emails))
  const emailsJSON = JSON.stringify([...uniqueTotalEmails])

  //TODO mock writing to DB
  writeFile("./mockedDB/collections/emails.json", emailsJSON, err => {
    if (err) {
      return res.status(500).send("Error writing file")
    } else {
      // 204 No Content if it does not return the updated resource
      return res.send("Email list saved successfully")
    }
  })
})

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true, // to use TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

app.post("/send", (req, res) => {
  const subsListJSON = readFileSync("./mockedDB/collections/emails.json")
  const subsList = JSON.parse(subsListJSON)

  // async function getS3Object(bucket, key) {
  //   const params = {
  //     Bucket: bucket,
  //     Key: key
  //   };
  
  //   const data = await s3.getObject(params).promise();
  //   return data.Body;
  // }

  const pdf = readFileSync("1.pdf")

  console.log("__>", pdf);

  subsList.forEach(subscriber => {
    transporter.sendMail(
      {
        to: subscriber, //TODO change to object with email, names, etc. for customization, could also apply to newletter.json
        //TODO this can be improve creating a dynamic template flow
        subject: "Newsletter for Monday, November 04 2024",
        html: "<div style='text-align: center'><h2>This are the news that matter to you!</h2><p>Find the full newsletter in this email's attachments.</p></div>",
        attachments: [
          {
            filename: "TestAttachement",
            content: Buffer.from(pdf),
            // path: path.join(
            //   __dirname,
            //   "/1730834376484-Fullstack_Engineer.pdf",
            // ),
            // href: "https://newletters-assets.s3.us-east-1.amazonaws.com/1730834376484-Fullstack_Engineer.pdf",
            contentType: "application/pdf",
          },
        ],
      },
      (err, info) => {
        if (err) {
          /* eslint-disable no-console */
          console.log(
            "Server Error while sending Newsletter to: ",
            subscriber,
            " ",
            err,
          ) //TODO for security purposes might be useful to not log emails
          res.status(500).send("Error sending Newsletter")
        } else {
          /* eslint-disable no-console */
          // console.log("Newsletter sent to: ", subscriber, " ", info.response)
          res.status(200).send("Newsletter sent successfully")
        }
      },
    )
  })
})

app.listen(3000, () => {
  /* eslint-disable no-console */
  console.log("Server is up on http://localhost:3000")
})
