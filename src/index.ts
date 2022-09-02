import express , { Request, Response, NextFunction, Application } from "express"
import { Server } from "http"
import dotenv from "dotenv"
const app: Application = express();

// default port to listen
const port = process.env.SERVER_PORT || "3000";

// set up dot env config
dotenv.config();

app.get("/", (req: Request, res: Response, next: NextFunction) => {
    res.send("Welcome on our chat app");
})

// start the Express server
const server: Server = app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
});
