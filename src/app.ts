import cors from "cors";
import express from "express";

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  preflightContinue: false,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

export default app;

export const server = app.listen(8080, () => {
  console.log("Server up at 8080");
});
