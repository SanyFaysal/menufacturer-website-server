const express = require('express');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const app = express()
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;


app.use(express.json())
app.use(cors())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.vue0r.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
    const authHeaders = req.headers.authorization;
    if (!authHeaders) {
        return res.status(401).send({ message: 'Unauthorized access' })
    };
    const token = authorization.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' })
        }
        req.decoded = decoded;
        next()
    })

}
async function run() {
    try {
        await client.connect();

        const partsCollection = client.db('manufacturer-website').collection('parts');
        const orderCollection = client.db('manufacturer-website').collection('orders');
        const reviewCollection = client.db('manufacturer-website').collection('reviews');
        const userInfoCollection = client.db('manufacturer-website').collection('userInfo');
        const userCollection = client.db('manufacturer-website').collection('users');


        const verifyAdmin = async (req, res, next) => {
            const requester = req.decoded.email;
            const requesterAccount = await userCollection.findOne({ email: requester });
            if (requesterAccount.role === 'admin') {
                next()
            }
            else {
                res.status(403).send({ message: 'Forbiden ' })
            }
        }
        app.post('/create-payment-intent', async (req, res) => {
            const service = req.body;
            const price = service.price;
            const amount = price * 100;
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: 'usd',
                payment_method_types: ['card']
            })
            res.send({ clientSecret: paymentIntent.client_secret })
        })
        //    get all parts 
        app.get('/part', async (req, res) => {
            const result = await partsCollection.find().toArray()
            res.send(result)
        })
        // get parts by id 
        app.get('/part/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await partsCollection.findOne(query)
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
        app.get('/order/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.findOne(query);
            res.send(result)
        })
        app.get('/parts/:email', async (req, res) => {
            const result = await orderCollection.find({ email: req.params.email }).toArray();
            res.send(result)
        });
        app.post('/addProduct', async (req, res) => {
            const product = req.body;
            const result = await partsCollection.insertOne(product);
            res.send(result)
        })

        app.post('/user/:email', async (req, res) => {
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
        app.put('/user/admin/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: { role: 'admin' }
            }
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.send(result)
        })
        app.get('/user/admin/:email', async (req, res) => {

            const email = req.params.email;

            const result = await userCollection.find({ email: email }).toArray();
            res.send(result)
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