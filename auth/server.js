const app = require("./src/app")
const connectToDb = require("./src/db/db")

const { connect } = require("./src/broker/broker")

const port = process.env.PORT || 3000

connect()
connectToDb().then(() => {
    app.listen(port, () => {
        console.log(`Server Running at Port ${port}`)
    })
}).catch(err => {
    console.error('Failed to start server:', err)
})