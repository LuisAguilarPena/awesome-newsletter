<template>
  <div>
    <h2>Submit List of Recipients</h2>
    <textarea
      v-model="emailList"
      placeholder="
  Submit a single email or a list of recipients for the newsletter, for example: 
  abc@domain.com,zxy@domain.com,cba@domain.com,lorem@domain.com,...
  "
      cols="100"
      rows="5"
      style="text-align: center"
    ></textarea>
    <button
      id="submit-btn"
      style="display: block; margin: 1rem auto"
      @click="submitEmails"
    >
      Submit
    </button>
    <p
    v-if="message"
      id="submit-msg"
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
      emailList: "",
      message: "",
    }
  },
  methods: {
    async submitEmails() {
      if (!this.emailList.length > 0) {
        return (this.message = "Empty recipient list")
      }
      try {
        const response = await axios.post("http://localhost:3000/submit", {
          emails: this.emailList.replaceAll(" ", "").split(","), //TODO add better validation, and headers?
        })
        this.message = response.data || "Recipient Submitted!" //TODO message from response.data not showing
      } catch (err) {
        this.message = err.response.data
      }
    },
  },
}
</script>
