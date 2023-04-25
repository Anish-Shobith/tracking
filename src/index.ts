import express from "express";
import bodyParser from "body-parser";
import trackRoute from "./routes/track";

const app = express();
app.use(bodyParser.json());

app.use("/api", trackRoute);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
