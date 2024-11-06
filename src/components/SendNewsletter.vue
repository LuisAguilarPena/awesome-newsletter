<template>
  <div>
    <h2>Send Newsletter to All Subscribers</h2>
    <button @click="sendNewsletter">Send</button>
    <p
      v-if="message"
      id="upload-msg"
    >
      {{ message }}
    </p>
  </div>
</template>

<script>
import axios from "axios"

export default {
  data() {
    return {
      message: "",
    }
  },
  methods: {
    async sendNewsletter() {
      try {
        const response = await axios.post("http://localhost:3000/send", {
        })
        this.message = response.data
      } catch (err) {
        this.message = err.response.data
      }
    },
  },
}
</script>
