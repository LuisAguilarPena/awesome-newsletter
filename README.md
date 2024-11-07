# Awesome Newsletter

This project is a newsletter sending app. WIP, for showcase purposes, not intended for production.

## Key Features

1. Admin user can upload a pdf or png image (the newsletter)

- Check the `/upload` route in the `server.js` file
- Using `multer`, `multerS3`, and the `S3Client` from `@aws-sdk/client-s3`to do the actual storing
- Writing newsletter info in a mocked DB collection called `newsletters.json`

2. Admin user can submit an email list of recipients of the newsletter

- Check the `/submit` route in the `server.js` file
- Validating that we have only correctly formatted emails
- Making sure that we don't store repeats
- Writing the list of recipients in a mocked DB collection called `email.json`

3. Admin user can add a single email to the recipient list

- Check the `/submit` route in the `server.js` file
- Text area input allows for a single or many recipients

4. Admin user can click a button to trigger the newsletter submission

- Check the `/send` route in the `server.js` file
- Make sure that we have recipients for our newletter
- Get newsletter from storage, based on the last item on our mock DB
- Send newsletter and collect a list of failures or rejections, a rejection is considered a success by Nodemailer

5. PDF document should be attached to the email

- Check the `/send` route in the `server.js` file
- Sending only PDF files for now, other types could be enabled by changing `content-type` field from email message based on file extension

6. Recipient users can click a "unsubscribe" link contained in the email, the user should not receive
   any more emails.

- Check the `/unsubscribe` route in the `server.js` file
- Added an anchor in the custom HTML Template for the message body to hit endpoint with the appropriate email query params
- Delete recipient's email from our mocked DB email collection

## Bonus Features

1. Email is personalized and using html format

- Small degree of personalization in place inside the `sendMail` method of the `transporter` object. Inside the email message object we can pass an `html` key with a value of an **HTML tamplate string**
- We could enhance our subscription process and personalize content more effectively by implementing a new, customizable form that collects more detailed information from subscribers. This form could include fields such as:
  - Full name
  - Areas of interest (e.g., technology, finance, health)
  - Specific newsletters they'd like to receive,
  - Preferred frequency of communication, implement with CRON jobs
- We could build email templates with Vue components using a library such as [Vue Email](https://vuemail.net/) or review the viability to create an HTML template using [Handlebars](https://handlebarsjs.com/guide/#what-is-handlebars)

2. Recipient user can opt for only unsubscribe from specific newsletters

- Due to time constraints I was not able to tackle this feature. At a high level, to implement this feature we would have to:
  - define the different types of newsletters available
  - modify our existing newsletter upload mechanism to take into consideration the type of newsletter and store it in the appropriate folder/bucket/collection, dependant on the storage service being used
  - modify the subscription mechanism to allow for the selection of newsletters, and store that alongside the rest of the required data
  - modify the sending mechanism to check for a `newsletterType` inside the emails collection, and send emails per type to every single recipient that is a subscriber
  - lastly, modify the `unsubscribe` mechanism to acount for `newsletterType`

3. A statistics dashboard is provided (number of sent mails, number of recipients, etc.)

- Due to time constraints I was not able to tackle this feature. At a high level, to implement this feature I would do the following:
  - Define the different types of stats to track, like:
    - Number of sent emails: count total sent messages each time we trigger the send mechanism
    - Number of recipients: read the number of entries in the email collection
    - Subscription/Unsubscription rates over time: add a timestamp field in the email collection, to know when did somebody subscribed and viceversa
    - Geographic distribution of subscribers: use Geolocation API and send it on request
    - Device and email client usage: use the `userAgent` property from the `window` object and send it on request
  - Leverage the `D3`library to produce dynamic, interactive data visualizations in web browsers.

4. Newsletter sending can be scheduled

- Review `cronJobs.js`, using the `node-cron` library

## Development Setup

Project is expected to be run locally in order to have everything working as expected. There is no plan to deploy it to a production environment.

For this project, **Vite** was used to set up our project, as it is one of the most popular and liked build tools according to [The State of JS 2022](https://2022.stateofjs.com/). Vite also makes it easy to set up a modern fullstack project, while still making it possible to extend the configuration later, if needed.

Multer is a body parsing middleware that handles content type multipart/form-data. That means it parses the raw http request data which are primarily used for file upload, and makes it more accessible (storing on disk / in memory /...) for further processing. Without multer, you would have to parse the raw data yourself if you want to access the file.

### Stack:

- [Vite](https://vite.dev/)
- [Vue](https://vuejs.org/)
- [NodeJS](https://nodejs.org/en)
- [Express](https://expressjs.com/)
- [CORS](https://expressjs.com/en/resources/middleware/cors.html)
- [Nodemon](https://nodemon.io/)
- [Nodemailer](https://nodemailer.com/)
- [Node-Cron](https://nodecron.com/)
- [Axios](https://axios-http.com/docs/intro)
- [Dotenv](https://www.dotenv.org/)
- [Multer](https://www.npmjs.com/package/multer)
- [Multer-S3](https://www.npmjs.com/package/multer-s3)
- [AWS S3](https://aws.amazon.com/s3/)
- [Prettier](https://prettier.io/)
- [ESLint](https://eslint.org/)
- [ESLint Plugin for Vue](https://eslint.vuejs.org/)

### Clone This Repo

Switch to your project directory and clone the project to your computer

```bash
$ git clone https://github.com/8x8-web/8x8-site-redesign.git
```

### Move into the Project Directory

```bash
$ cd 8x8-site-redesign
```

### Install the Required Node Modules

```bash
$ npm install
```

### Configuration & Environment Variables

This projects expects a few thing from the user in order to get it running:

1. An AWS account to use the S3 data storage services through the `@aws-sdk/client-s3` library.
2. A freshly created S3 bucket to store and retrieve our newsletters.
3. An SMTP server provider, for testing purposes I used gmail, since it is free. In case you need to swap checkout these more robust options https://www.emailtooltester.com/en/blog/free-smtp-servers/.

### How to set up AWS S3

Choose one of the following ways to grant public read access to objects in your S3 bucket:

- Update the object's access control list (ACL) from the Amazon S3 console
- Update the object's ACL from the AWS Command Line Interface (AWS CLI)
- Use a bucket policy that grants public read access to a specific object tag
- Use a bucket policy that grants public read access to a specific prefix

Important: You can't grant public access through bucket and object ACLs when your buckets have S3 Object Ownership set to Bucket Owner Enforced. In most cases, ACLs aren't required to grant permissions to objects and buckets. Instead, use AWS Identity Access and Management (IAM) policies and S3 bucket policies to grant permissions to objects and buckets.

New buckets, access points, and objects don't allow public access by default. If block public access is activated for all buckets within the AWS account, then you see the message "Bucket and objects not public".

For more informaiton visit https://repost.aws/knowledge-center/read-access-objects-s3-bucket

Alternativeñy, in the Bucket Permissions tab, you could also turn off `Block all public access`, and set the following bucket policy to open up your bucket to the public:

```JSON
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        }
    ]
}
```

This is not recomended since it will leave your resources open for anyone, so please make sure to revert this settings ASAP once you are done.

### How to setup the SMTP server provider with GMAIL

Login into your Gmail account and navigate to https://myaccount.google.com/apppasswords. Once there create a new app and copy the 16 digit code, that is your specially created App password. Lastly delete App once you are done.

### ENV Variables

```
AWS_ACCESS_KEY_ID="Your AWS access key ID"
AWS_SECRET_ACCESS_KEY="Your AWS secret access key"
AWS_REGION="The geographic area where your services are"
AWS_S3_BUCKET="Your bucket name"
EMAIL_HOST="For Gmail is smtp.gmail.com"
EMAIL_PORT="For SSL, enter 465. For TLS, enter 587. Depends on provider"
EMAIL_USER="Your Gmail account address"
EMAIL_PASS="Your specially created App password"
```

### Database Considerations

Due to time constraints I decided to not implement MongoDB as the default DB for the project. Instead, it is expected to mock the DB with json objects that are eaily managed with NodeJS.

Create the following folders and JSON files in the root of the project:

```
./mockedDB/collections/newsletters.json
./mockedDB/collections/emails.json
```

MongoDB is a document-based database, which means that each entry in the database is stored as a
document. In MongoDB, these documents are basically JSON objects (internally, they are stored as
BSON – a binary JSON format to save space and improve performance, among other advantages).
Instead, SQL databases store data as rows in tables. As such, MongoDB provides a lot more flexibility.
Fields can be freely added or left out in documents. The downside of such a structure is that we do
not have a consistent schema for documents. However, this can be solved by using libraries, such as
`Mongoose`.

In order to migrate to MongoDB, decide wheter to use a MongoDB Atlas Cluster or a self hosted MongoDB instance. Add the necessary credentials as env variables, install Mongoose and create a schema. The `readJsonAndParse` and `writeFileToMockDb`methods can be easily replaced by MongoDB operations.

### How to Run the Application's Development Server

How you start the development server will depend on what you are working on.

If working in the UI, you can simply start the development server with:

```bash
$ npm run dev
```

Vite will do an initial development build and spawn the
local development server, with hot reloading. The output will be available at http://localhost:5173.

If working on the backend, use nodemon to run `server.js` and start the local server at http://localhost:3000.

```bash
$ nodemon server.js
```

Nodemon is a command-line tool that helps with the speedy development of Node. js applications. It monitors your project directory and automatically restarts your node application when it detects any changes. This means that you do not have to stop and restart your applications in order for your changes to take effect.

## 🧐 What's inside?

A quick look at the top-level files and directories you'll see in the project.

    .
    ├── dist
    ├── mockedDB/collections
    ├── node_modules
    ├── public
    ├── src
    ├── .env
    ├── .eslintignore
    ├── .eslintrc.cjs
    ├── .gitignore
    ├── .prettierignore
    ├── .prettierrc.json
    ├── cronJobs.js
    ├── index.html
    ├── package-lock.json
    ├── package.json
    ├── README.md
    ├── server.js
    ├── utils.js
    └── vite.config.js

- `dist/`: Contains the compiled and minified files for production deployment, build after running `npm run build` to preview `npm run preview`. This is ignored by Git.
- `mockedDB/collections/`: Stores mock database collections, useful for development and testing without a live database. This is ignored by Git.
- `/node_modules`: This directory contains all of the modules of code that your project depends on (npm packages) are automatically installed. This is ignored by Git.
- `public/`: Houses static assets that are served directly to the client.
- `src/`: This directory contains all of the code related to what you will see on the front-end of your site (what you see in the browser) such as the the main entry point to the Vue app, `App.vue`and the related template components that hit our backend. `src` is a convention for “source code”.
- `.env`: Stores environment variables for configuration. This is ignored by git.
- `.gitignore`: This file tells git which files it should not track / not maintain a version history for.
- `.eslintignore` and `.eslintrc.cjs`: Configure ESLint for code linting.
- `.prettierignore` and `.prettierrc.json`: Configure Prettier for code formatting and consistency.
- `cronJobs.js`: Defines scheduled tasks or periodic jobs.
- `index.html`: The main HTML file that serves as the entry point for the client-side application.
- `package.json` and `package-lock.json`: Define project dependencies and lock their versions, respectively. The former is a manifest file for Node.js projects, which includes things like metadata (the project’s name, author, etc). This manifest is how npm knows which packages to install for your project.
- `README.md`: A text file containing useful reference information about the project.
- `server.js`: The main server file that sets up and runs the backend.
- `utils.js`: Contains utility functions used throughout the project.
- `vite.config.js`: Configuration file for Vite, the build tool and development server.

## Other To do's

- Error messages from validation of inputs should be in red
- Testing
- Attachements fail sometimes, maybe because of the fact that im using a normal gmail account for delivery, SMTP, implementation, or lib issues, will probably be useful to provide a link to a presigned url that points to the newsletter for a limited amount if time
- Mechanism to save error logs for the server
- Since I'm fairly new to working with Vue, I will read up and create a more robust UI
- Migrate to MongoDB
- Dockerize app
