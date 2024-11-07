import express from "express"
import cors from "cors"
import {
  removeItemFromArrayOnce,
  uploadToS3,
  readJsonAndParse,
  writeFileToMockDb,
  getS3Object,
  sendEmail
} from "./utils.js"

const app = express()
app.use(cors())
app.use(express.json()) // helps to read req.body

app.post("/upload", uploadToS3, (req, res) => {
  const url = req.file.location

  const newsletters = readJsonAndParse(
    "./mockedDB/collections/newsletters.json",
  )
  newsletters.push({ name: url.match(/([^/]+)(?=[^/]*\/?$)/)[0], url: url })

  return writeFileToMockDb(
    "./mockedDB/collections/newsletters.json",
    newsletters,
    res,
    "Error writing file entry to mockDB Collection",
    "File uploaded successfully",
  )
})

app.post("/submit", (req, res) => {
  const emails = req.body.emails.filter(email =>
    email.match(/^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/),
  )

  if (!emails.length > 0) {
    return res
      .status(500)
      .send("Recipient list does not have a valid email address")
  }

  const staleEmails = readJsonAndParse("./mockedDB/collections/emails.json")
  const uniqueTotalEmails = new Set(staleEmails.concat(emails))
  const emailsArr = [...uniqueTotalEmails]

  return writeFileToMockDb(
    "./mockedDB/collections/emails.json",
    emailsArr,
    res,
    "Error saving recipient list",
    "Recipient list saved successfully",
  )
})

app.post("/send", async (req, res) => {
  const subsList = readJsonAndParse("./mockedDB/collections/emails.json")
  const staleNewsletters = readJsonAndParse(
    "./mockedDB/collections/newsletters.json",
  )

  if (subsList.length === 0 || staleNewsletters.length === 0) {
    return res.status(500).send("There are no subscribers or newsletters yet")
  }

  const s3Object = await getS3Object(
    staleNewsletters[staleNewsletters.length - 1].name,
  )

  if (!s3Object) {
    return res.status(500).send("Error while retrieving the latest newsletter")
  }

  const failures = sendEmail(subsList, s3Object)

  if (failures.failRejectCounter > 0 && failures.failRejectCounter !== subsList.length) {
    /* eslint-disable no-console */
    console.log("unreachableSubs: ", failures.unreachableSubs)
    return res.status(200).send("Some Newsletters sent successfully")
  } else if (failures.failRejectCounter === subsList.length) {
    res.status(500).send("Error sending Newsletters")
  } else if (failures.failRejectCounter === 0) {
    return res.status(200).send("All Newsletters sent successfully")
  }
})

app.get("/unsubscribe", async (req, res) => {
  const email = req.query.email

  if (!email) return res.status(400).send("Invalid request")

  const staleEmails = readJsonAndParse("./mockedDB/collections/emails.json")

  removeItemFromArrayOnce(staleEmails, email)

  writeFileToMockDb(
    "./mockedDB/collections/emails.json",
    staleEmails,
    res,
    "Error unsubscribing from newsletter",
    "Unsubscribed",
  )
})

app.listen(3000, () => {
  /* eslint-disable no-console */
  console.log("Server is up on http://localhost:3000")
})
