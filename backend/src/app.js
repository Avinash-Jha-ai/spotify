import express from "express"
import authRouter from "./routes/auth.route.js"
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cors from "cors";
import songRouter from "./routes/song.route.js"
import likeRouter from "./routes/liked.route.js"
import playlistRouter from "./routes/playlist.route.js"
const app =express();

app.use(cors({
    origin: ["https://spotify-home-ten.vercel.app", "https://spotify-rho-mauve.vercel.app"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (req, res) => {
    res.send('Hello World!');
});


app.use("/api/auth",authRouter);
app.use("/api/song",songRouter);
app.use("/api/",likeRouter)
app.use("/api/playlist", playlistRouter);

export default app;