const app = require("./src/app")
const connectToDb = require("./src/db/db")

const{connect}=require("./src/broker/broker")

connect()
connectToDb().then(() => {
    app.listen(3000, () => {
        console.log("Server Running at Port 3000");
    })
}).catch(err => {
    console.error('Failed to start server:', err)
})