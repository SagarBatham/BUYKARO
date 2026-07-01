# AI Buddy Service

The AI Buddy service provides a conversational shopping assistant powered by Google Gemini LLM, using LangGraph for agentic workflows and Socket.IO for real-time communication.

## Features
- Natural language product search powered by Gemini 2.5 Flash LLM
- Intelligent add-to-cart functionality triggered by assistant actions
- Agentic workflow using LangGraph state machine and tool calling
- Real-time bidirectional communication via Socket.IO
- JWT token-based authentication
- Integration with Product Service for search
- Integration with Cart Service for adding items
- Automatic tool invocation for product search and cart updates

## How it is coded
- server.js creates HTTP server and initializes Socket.IO on port 3005
- src/app.js defines the main Express application and routes
- src/agent/agent.js builds the LangGraph workflow with state management:
  - Uses Gemini 2.5 Flash model for intelligent responses
  - Routes between "chat" node (LLM interaction) and "tools" node (tool execution)
  - Implements state graph with MessagesAnnotation for conversation history
- src/agent/tool.js defines two main tools:
  - `searchProduct` - Searches product service and returns best matching product
  - `addProductToCart` - Adds selected product to user's cart
- src/sockets/socket.server.js handles real-time communication:
  - JWT token validation on connection
  - Receives user messages and passes to agent for processing
  - Executes tools and returns responses

## Service Port
- **Port:** 3005
- **Access:** http://localhost:3005
- **Socket.IO Path:** /api/socket/socket.io/

## Environment variables
```bash
# Google Gemini API (required for LLM functionality)
GOOGLE_API_KEY=your-google-ai-api-key

# JWT Secret for token validation
JWT_SECRET=your-jwt-secret-key

# RabbitMQ URL (optional, for event publishing)
RABBIT_URL=amqp://username:password@rabbitmq-host:5672
```

## Socket.IO Communication

### Authentication
Connect to Socket.IO with JWT token in cookies:
```javascript
const socket = io('http://localhost:3005', {
  path: '/api/socket/socket.io/',
  withCredentials: true
});
```

Cookie format:
```
Cookie: token=<jwt-token>
```

### Events

#### Client → Server: Send Message
**Event:** `message`
```javascript
socket.emit('message', 'Find me a laptop under 50000 rupees');
```

#### Server → Client: Response
**Event:** (Custom response with agent result)
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Find me a laptop under 50000 rupees"
    },
    {
      "role": "assistant",
      "content": "I found a great laptop for you! Let me add it to your cart."
    }
  ]
}
```

#### Client → Server: Disconnect
**Event:** `disconnect`
```javascript
socket.disconnect();
```

## Agent Workflow

The AI Buddy agent uses the following flow:

1. **User sends message** via Socket.IO
2. **LangGraph evaluates message** and determines if tools are needed:
   - If product search is needed → calls `searchProduct` tool
   - If add-to-cart is needed → calls `addProductToCart` tool
3. **Tools execute** with user's JWT token for authentication
4. **Agent generates response** based on tool results
5. **Response sent back** to client via Socket.IO

### Tool: searchProduct
```javascript
{
  name: "searchProduct",
  input: "laptop under 50000",
  token: "jwt-token"
}
```

**Returns:**
```json
{
  "found": true,
  "productId": "507f1f77bcf86cd799439011",
  "title": "Dell Inspiron 15",
  "price": 45999
}
```

### Tool: addProductToCart
```javascript
{
  name: "addProductToCart",
  productId: "507f1f77bcf86cd799439011",
  qty: 1,
  token: "jwt-token"
}
```

**Returns:**
```json
{
  "success": true,
  "message": "Product added to cart",
  "cartTotal": 45999
}
```

## Example Client Integration

```html
<script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
<script>
  // Connect to Socket.IO
  const socket = io('http://localhost:3005', {
    path: '/api/socket/socket.io/',
    withCredentials: true
  });

  socket.on('connect', () => {
    console.log('Connected to AI Buddy');
    socket.emit('message', 'Find me a phone');
  });

  socket.on('message', (data) => {
    console.log('Response:', data);
  });

  socket.on('disconnect', () => {
    console.log('Disconnected');
  });
</script>
```

## LLM Model
- **Model:** Google Gemini 2.5 Flash
- **Temperature:** 0.5 (balanced between deterministic and creative responses)
- **Context:** System prompt instructs agent on when to use tools

## Run locally
```bash
cd ai-buddy
npm install
npm run dev
```

Service will start on port 3005 with Socket.IO listening on /api/socket/socket.io/
