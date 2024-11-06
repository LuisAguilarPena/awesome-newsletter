import { readJsonAndParse, sendEmail, getS3Object } from "./utils.js"
import cron from "node-cron"

// Running every minute, to change cadence check https://nodecron.com/docs/#cron-syntax
cron.schedule("* * * * *", async () => {
  const staleNewsletters = readJsonAndParse(
    "./mockedDB/collections/newsletters.json",
  )

  const s3Object = await getS3Object(
    staleNewsletters[staleNewsletters.length - 1].name,
  )

  sendEmail(readJsonAndParse("./mockedDB/collections/emails.json"), s3Object)
  /* eslint-disable no-console */
  console.log("Newsletters sent at:", new Date().toLocaleString())
})
