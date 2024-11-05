//! Better understand this section //TODO properly center input
<template>
  <div>
    <h2>Upload Latest Newsletter</h2>
    <label
      for="newsletter-upload"
      class="custom-file-upload"
    >
      Select Newsletter File
    </label>
    <input
      id="newsletter-upload"
      type="file"
      style="display: none"
      @change="uploadFile"
    />
    <p
      v-if="message"
      id="upload-msg"
    >
      {{ message }}
    </p>
  </div>
</template>

<script setup>
import { ref } from "vue"
import axios from "axios"

const message = ref("")

//! Better understand this section
const uploadFile = async event => {
  const newsletterUpload = document.getElementById("newsletter-upload")
  const file = event.target.files[0]
  const formData = new FormData() // {}
  formData.append("file", file) // TODO file type validation

  try {
    const response = await axios.post(
      "http://localhost:3000/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    )
    message.value = response.data
  } catch (error) {
    message.value = "File upload failed."
  } finally {
    newsletterUpload.value = "" // clear input to be ready for next possible upload
  }
}
</script>

//TODO improve styles if time allows
<style scoped>
.custom-file-upload {
  border: 1px solid #ccc;
  display: inline-block;
  padding: 6px 12px;
  cursor: pointer;
}
</style>
