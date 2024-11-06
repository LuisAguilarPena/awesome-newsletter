import express from "express"
import dotenv from "dotenv"
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"
import multer from "multer"
import multerS3 from "multer-s3"
import cors from "cors"
import { writeFileSync, readFileSync, writeFile } from "node:fs"
import nodemailer from "nodemailer"

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
  newsletters.push({ name: url.match(/([^/]+)(?=[^/]*\/?$)/)[0], url: url })
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
      return res.status(204).send("Email list saved successfully")
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

app.post("/send", async (req, res) => {
  const subsListJSON = readFileSync("./mockedDB/collections/emails.json")
  const subsList = JSON.parse(subsListJSON)

  const staleNewslettersJSON = readFileSync(
    "./mockedDB/collections/newsletters.json",
  )
  const staleNewsletters = JSON.parse(staleNewslettersJSON)

  async function getS3Object() {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: staleNewsletters[staleNewsletters.length - 1].name, // filename
    }

    const command = new GetObjectCommand(params)

    try {
      const data = await s3.send(command)
      console.log("Retrieved the latest newsletter")
      return data.Body
    } catch (err) {
      console.log("Error while retrieving the latest newsletter", err)
    }
  }

  const s3Object = await getS3Object()
  const date = new Date()
  const subjectDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  const attachmentDate = date.toLocaleDateString("en-US").replaceAll("/", "-")

  subsList.forEach(subscriber => {
    transporter.sendMail(
      {
        //TODO change to object with email, names, etc. for customization, could also apply to newletter.json
        to: subscriber,
        subject: `Awesome Newsletter for ${subjectDate}`,
        //TODO this can be improve creating a dynamic template flow for HTML bodies
        html: "<div style='text-align: center'><h2>This are the news that matter to you!</h2><p>Find the full newsletter in this email's attachments.</p></div>",
        attachments: [
          {
            filename: `${attachmentDate}-Awesome-Newsletter.pdf`,
            content: s3Object,
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
