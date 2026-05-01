import app from "./src/app.js";
import connectDB from "./src/configs/db.js";

connectDB();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
})

export default app;