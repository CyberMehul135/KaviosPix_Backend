const dotenv = require("dotenv");
const app = require("./app");
const { initializedDatabase } = require("./config/db.connect");

dotenv.config({ quiet: true });

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await initializedDatabase();

    app.listen(PORT, () => {
      console.log(`Server runing on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server failed to start", error);
    process.exit(1);
  }
};

startServer();
