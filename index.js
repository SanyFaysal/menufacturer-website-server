const express = require('express');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;


app.use(express.json())
app.use(cors())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.vue0r.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        await client.connect();

        const partsCollection = client.db('manufacturer-website').collection('parts');
        const orderCollection = client.db('manufacturer-website').collection('orders');
        const reviewCollection = client.db('manufacturer-website').collection('reviews');
        const userInfoCollection = client.db('manufacturer-website').collection('userInfo');
        const userCollection = client.db('manufacturer-website').collection('users');
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
        app.get('/orders', async (req, res) => {
            const result = await orderCollection.find().toArray();
            res.send(result)
        })
        app.get('/parts/:email', async (req, res) => {
            const result = await orderCollection.find({ email: req.params.email }).toArray();
            res.send(result)
        });

        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user
            }
            const result = await userCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
            res.send({ result, token })
        })
        app.get('/user', async (req, res) => {
            const result = await userCollection.find().toArray();
            res.send(result)
        })

        app.delete('/removePart/:id', async (req, res) => {
            const id = req.params.id;
            const result = await orderCollection.deleteOne({ _id: ObjectId(id) });
            res.send(result)
        })

        app.post('/review', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result)
        })
        app.get('/reviews', async (req, res) => {
            const result = await reviewCollection.find().toArray();
            res.send(result)
        })

        app.post('/userInfo', async (req, res) => {
            const userInfo = req.body;
            const result = await userInfoCollection.insertOne(userInfo);
            res.send(result)
        })
        app.get('/userInfo/:email', async (req, res) => {
            const result = await userInfoCollection.find({ email: req.params.email }).toArray();
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