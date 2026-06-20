const ampqlib=require("amqplib")

let channel,connection

async function connect() {
    if(connection) return connection;

    try {
        connection=await ampqlib.connect(process.env.RABBIT_URL)
        console.log("Connected to RABBITMQ");
        channel=await connection.createChannel();
    } catch (error) {
        console.error("Error Connecting to RABBITMQ: ",error)
    }
}

async function publishToQueue(queueName,data={}) {
    if(!channel || !connection) await connect()

        await channel.assertQueue(queueName,{
            durable:true
        })

        channel.sendToQueue(queueName,Buffer.from(JSON.stringify(data)))
        console.log("Message send to Queue ",queueName,data);
        
}

async function subscribeToQueue(queueName,callback) {
    
    if(!channel || !connection) await connect()

        await channel.assertQueue(queueName,{
            durable:true
        })

        channel.consume(queueName,async(msg)=>{
            if(msg!==null){
                const data=JSON.parse(msg.content.toString())
                await callback(data)
                channel.ack(msg)
            }
        })
}

module.exports={
    connect,
    channel,
    connection,
    publishToQueue,
    subscribeToQueue
}