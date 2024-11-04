//! Better understand this section
<template>
  <div>
    <input
      type="file"
      @change="uploadFile"
    />
    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script setup>
import { ref } from "vue"
import axios from "axios"

const message = ref("")

//! Better understand this section
const uploadFile = async event => {
  const file = event.target.files[0]
  const formData = new FormData()
  formData.append("file", file)

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
  }
}
</script>
