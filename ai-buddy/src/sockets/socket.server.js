const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const { HumanMessage } = require("@langchain/core/messages");
const agent = require("../agent/agent");
const tools = require("../agent/tool");

function getSocketAuthToken(socket) {
    const getTokenFromString = (value) =>
        typeof value === "string" && value.trim() ? value.trim() : null;

    const handshakeToken = getTokenFromString(socket.handshake?.auth?.token);
    if (handshakeToken) {
        return handshakeToken;
    }

    const queryToken = getTokenFromString(socket.handshake?.query?.token);
    if (queryToken) {
        return queryToken;
    }

    const authHeader = socket.handshake?.headers?.authorization || socket.handshake?.headers?.Authorization;
    if (typeof authHeader === "string") {
        const match = authHeader.match(/Bearer\s+(.+)/i);
        if (match) {
            return getTokenFromString(match[1]);
        }
    }

    const cookies = socket.handshake?.headers?.cookie;
    const { token } = cookies ? cookie.parse(cookies) : {};

    return getTokenFromString(token);
}

function buildSocketResponsePayload(agentResponse) {
    const normalizedMessages = Array.isArray(agentResponse?.messages)
        ? agentResponse.messages
            .map((message) => {
                if (!message || typeof message !== "object") {
                    return null;
                }

                const rawRole = message.role || message._getType?.() || "assistant";
                const content = typeof message.content === "string"
                    ? message.content
                    : Array.isArray(message.content)
                        ? message.content
                            .map((part) => typeof part === "string" ? part : part?.text || "")
                            .join(" ")
                        : "";

                const normalizedRole = rawRole === "human" || rawRole === "user"
                    ? "user"
                    : rawRole === "tool"
                        ? "tool"
                        : "assistant";

                const normalizedContent = content || "";
                if (normalizedRole === "tool" || normalizedContent.trim() === "") {
                    return null;
                }

                return {
                    role: normalizedRole,
                    content: normalizedContent
                };
            })
            .filter(Boolean)
        : [];

    const hasAssistantMessage = normalizedMessages.some((message) => message.role === "assistant");

    if (normalizedMessages.length === 0 || !hasAssistantMessage) {
        return {
            messages: [
                ...normalizedMessages,
                {
                    role: "assistant",
                    content: "Sorry, I could not process your request right now."
                }
            ]
        };
    }

    return { messages: normalizedMessages };
}

async function initSocketServer(httpServer) {
    const corsOrigins = process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean)
        : [];

    const io = new Server(httpServer, {
        path: "/api/socket/socket.io",
        cors: {
            origin: (origin, callback) => {
                if (!origin) {
                    return callback(null, true);
                }
                if (corsOrigins.length === 0 || corsOrigins.includes(origin)) {
                    return callback(null, true);
                }
                return callback(new Error('Origin not allowed by CORS'));
            },
            methods: ["GET", "POST"],
            credentials: true,
        },
    });

    io.use((socket, next) => {
        const token = getSocketAuthToken(socket);

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
                console.log("Agent response messages:", JSON.stringify(agentResponse?.messages || [], null, 2));

                const payload = buildSocketResponsePayload(agentResponse);
                console.log("Built socket payload:", JSON.stringify(payload, null, 2));

                if (payload.messages.length === 1 && payload.messages[0].role === 'user') {
                    console.log("No assistant reply generated, using fallback search path");
                    const searchResult = await tools.searchProduct.invoke({ input: data, token: socket.token });
                    const parsed = JSON.parse(searchResult);
                    if (parsed.found) {
                        socket.emit("message", {
                            messages: [
                                { role: 'user', content: String(data) },
                                { role: 'assistant', content: `I found ${parsed.title} for ₹${parsed.price}. Would you like me to add it to your cart?` }
                            ]
                        });
                    } else {
                        const userMessage = { role: 'user', content: String(data) };
                        const assistantContent = parsed.error
                            ? `I could not query products right now. ${parsed.error}`
                            : 'I could not find a matching product right now. Please try another search.';

                        socket.emit("message", {
                            messages: [
                                userMessage,
                                { role: 'assistant', content: assistantContent }
                            ]
                        });
                    }
                } else {
                    socket.emit("message", payload);
                }
            } catch (err) {
                console.error("Agent Error:", err);
                socket.emit("message", buildSocketResponsePayload(null));
            }
        });

        socket.on("disconnect", () => {
            // Disconnection status log removed to reduce noisy debugging output
        });
    });

    return io;
}

module.exports = { initSocketServer, buildSocketResponsePayload, getSocketAuthToken };