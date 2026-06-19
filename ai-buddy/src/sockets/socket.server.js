const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const { HumanMessage } = require("@langchain/core/messages");
const agent = require("../agent/agent");

async function initSocketServer(httpServer) {
    const io = new Server(httpServer, {
        cors: {
            origin: "*",
            credentials: true,
        },
    });

    io.use((socket, next) => {
        const cookies = socket.handshake.headers.cookie;

        const { token } = cookies ? cookie.parse(cookies) : {};

        if (!token) {
            return next(new Error("Token not Provided"));
        }

        try {
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            );

            socket.user = decoded;
            socket.token = token;

            next();
        } catch (error) {
            next(new Error("Invalid Token"));
        }
    });

    io.on("connection", (socket) => {
        console.log("User:", socket.user);
        // Connection status log removed to reduce noisy debugging output

        socket.on("message", async (data) => {
    try {
        console.log("Message Received:", data);

        console.log("Before Agent");

        const agentResponse = await agent.invoke(
            {
                messages: [
                    {
                        role: "user",
                        content: data
                    }
                ]
            },
            {
                metadata: {
                    token: socket.token
                }
            }
        );

        console.log("After Agent");

        console.log(agentResponse);

    } catch (err) {
        console.error("Agent Error:", err);
    }
});

        socket.on("disconnect", () => {
            // Disconnection status log removed to reduce noisy debugging output
        });
    });

    return io;
}

module.exports = { initSocketServer };