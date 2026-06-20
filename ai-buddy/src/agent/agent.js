const {
    StateGraph,
    MessagesAnnotation,
    START,
    END
} = require("@langchain/langgraph");

const {
    ChatGoogleGenerativeAI
} = require("@langchain/google-genai");

const {
    ToolMessage,
    AIMessage
} = require("@langchain/core/messages");

const tools = require("./tool");
// Do not log API keys in production or shared logs

const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    apiKey: process.env.GOOGLE_API_KEY,
    temperature: 0.5
});

const graph = new StateGraph(MessagesAnnotation)

    .addNode("tools", async (state, config) => {
        const lastMessage =
            state.messages[state.messages.length - 1];

        const toolCalls = lastMessage.tool_calls || [];

        // Avoid logging full config or tokens (may contain sensitive data)
        const toolCallResults = await Promise.all(
            toolCalls.map(async (call) => {

                // Not logging tool call args to avoid leaking sensitive inputs

                const tool = tools[call.name];

                // Normalize call.args to an object and attach token from config
                const token = config?.metadata?.token;
                let args = call.args;
                if (typeof args === "string") {
                    args = { input: args };
                } else if (args == null) {
                    args = {};
                }

                if (!Object.prototype.hasOwnProperty.call(args, "token")) {
                    args.token = token;
                }

                const payload = args;

                const result = await tool.invoke(payload);

                return new ToolMessage({
                    content: String(result),
                    tool_call_id: call.id
                });
            })
        );

        state.messages.push(...toolCallResults);

        return state;
    })

    .addNode("chat", async (state) => {

    const systemPrompt = `
You are a shopping assistant.

Rules:
1. If user asks to find a product, call searchProduct.
2. If user asks to add a product to cart:
   - first call searchProduct
   - use returned productId
   - immediately call addProductToCart
3. Never ask for confirmation.
4. Always use the first matching product.
`;

    const response = await model.invoke(
        [
            {
                role: "system",
                content: systemPrompt
            },
            ...state.messages
        ],
        {
            tools: [
                tools.searchProduct,
                tools.addProductToCart
            ]
        }
    );

    console.dir(response, { depth: null });

    state.messages.push(
        new AIMessage({
            content: response.content,
            tool_calls: response.tool_calls
        })
    );

    return state;
})

    .addEdge(START, "chat")

    .addConditionalEdges("chat", async (state) => {
        const lastMessage =
            state.messages[state.messages.length - 1];

        if (lastMessage.tool_calls?.length > 0) {
            return "tools";
        }

        return END;
    })

    .addEdge("tools", "chat");

const agent = graph.compile();

module.exports = agent;