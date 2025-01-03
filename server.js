const app = require("./app");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const PORT = process.env.PORT;

// Database Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error("Database connection error:", err));
