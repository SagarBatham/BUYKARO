const app = require('./src/app')

const port = process.env.PORT || 3002

app.listen(port, () => {
    console.log(`Cart Server running on port ${port}`)
})