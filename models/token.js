const mongoose = require("mongoose");
require("dotenv").config();

main()
.then(()=>{
    console.log("Connected to MongoDB✅")
}).catch((err)=>{
    console.log("failed to connect with mongodb");
});

async function main() {
    await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
}

const tokenSchema = new mongoose.Schema({
  outletName: String,
  tokenNumber: Number,
  date: String,
  customer: {
    name: String,
    phone: String,
    email: String
  },
  issuedAt: String
});

const Token = mongoose.model("Token", tokenSchema);
module.exports = Token;