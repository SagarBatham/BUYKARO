const app = require("./src/app")
const connectToDb = require("./src/db/db")

connectToDb().then(() => {
    app.listen(3000, () => {
        console.log("Server Running at Port 3000");
    })
}).catch(err => {
    console.error('Failed to start server:', err)
})