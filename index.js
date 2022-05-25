const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;


app.use(express.json())
app.use(cors())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.vue0r.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
console.log(uri);
async function run() {
    try {
        await client.connect();
        const partsCollection = client.db('manufacturer-website').collection('parts');
        const orderCollection = client.db('manufacturer-website').collection('orders');

        //    get all parts 
        app.get('/part', async (req, res) => {
            const result = await partsCollection.find().toArray()
            res.send(result)
        })

        // get parts by id 
        app.get('/part/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const cursor = partsCollection.find(query);
            const result = await cursor.toArray();
            res.send(result)
        })
        app.post('/part', async (req, res) => {
            const part = req.body;
            const result = await orderCollection.insertOne(part);
            res.send(result)
        })
        app.get('/parts/:email', async (req, res) => {
            const result = await orderCollection.find({ email: req.params.email }).toArray();
            res.send(result)
        })
    }
    finally {
    }
}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('hello world ')
});

app.listen(port, () => {
    console.log('example app listening port  ', port);
})