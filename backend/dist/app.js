import express from "express";
const port = 4000;
const app = express();
app.listen(port, () => {
    console.log(`server is running on http://localhost:${port}`);
});
