require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Client } = require('pg')
const path = require('path');
const multer = require('multer');
const { ethers } = require('ethers');
const contractABI = require('./contract.json');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Serve static files from public/uploads at /uploads
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

const port = 5000;

const client = new Client({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
})

// Blockchain configuration
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || contractABI.address;
const CONTRACT_ABI = contractABI.abi;
const SEPOLIA_RPC_URL = process.env.SEPOLIA_QUICKNODE_KEY || process.env.SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/YOUR_PROJECT_ID';
const PRIVATE_KEY = process.env.PRIVATE_KEY; // Add this to your .env file

const ensureConsumerProductsTable = async () => {
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS consumer_products (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                serial_number VARCHAR(255) NOT NULL,
                added_at TIMESTAMPTZ DEFAULT NOW(),
                UNIQUE (username, serial_number)
            )
        `);
    } catch (err) {
        console.error('Failed to ensure consumer_products table:', err.message);
    }
};

let isDbConnected = false;

client.connect()
    .then(() => {
        console.log('✅ Database connected successfully!');
        isDbConnected = true;
        return ensureConsumerProductsTable();
    })
    .then(() => {
        console.log('✅ Database tables verified!');
    })
    .catch((err) => {
        console.error('❌ Database connection failed:', err.message);
        console.error('⚠️  Server is running but database features will not work.');
        console.error('💡 Please check:');
        console.error('   1. PostgreSQL is installed and running');
        console.error('   2. Database "myprojectdb" exists');
        console.error('   3. Credentials in .env are correct');
    });

// auth

function createAccount(username , password, role){
    const res =  client.query('INSERT INTO auth (username, password, role) VALUES ($1, $2, $3)', [username, password, role], (err, res)=>{
        if(err){
            console.log(err.message);
        }else{
            console.log('Data insert successful');
        }
    })
}

function changePassword(username, password){
    const res =  client.query('UPDATE auth SET password = $1 WHERE username = $2', [password, username], (err, res)=>{
        if(err){
            console.log(err.message);
        }else{
            console.log('Data update successful');
        }
    })
}

// profile
let lastLogTimestamp = 0;
const log = (message) => {
  const now = Date.now();
  if (now - lastLogTimestamp > 2000) {
    console.log(message);
    lastLogTimestamp = now;
  }
};

function createProfile(username, name , description, website, location, image, role){
    client.query('INSERT INTO profile (username, name, description, website, location, image, role) VALUES ($1, $2, $3, $4, $5, $6, $7)', 
        [username, name, description, website, location, image, role], (err, res)=>{
            if(err){
                log(err.message);
            }else{
                log('Data insert successful');
            }
        })

}

// product

const storageProduct = multer.diskStorage({
    destination: path.join(__dirname, 'public/uploads/product'),
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
})

const storageProfile = multer.diskStorage({
    destination: path.join(__dirname, 'public/uploads/profile'),
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
})

const storageComplaint = multer.diskStorage({
    destination: path.join(__dirname, 'public/uploads/complaint'),
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

async function addProduct(serialNumber, name, brand, manufacturer, image, expiryDate){
    try {
        const result = await client.query('INSERT INTO product (serialNumber, name, brand, manufacturer, image, expiry_date) VALUES ($1, $2, $3, $4, $5, $6)', 
            [serialNumber, name, brand, manufacturer, image, expiryDate || null]);
        console.log('Data insert successful:', result.rowCount, 'rows inserted');
        return { success: true, rowCount: result.rowCount };
    } catch (err) {
        console.error('Database insert error:', err.message);
        throw err;
    }
}

// Blockchain function to register product on smart contract
async function addProductToBlockchain(serialNumber, name, brand, description, image, manufacturer, location, timestamp, expiryDate) {
    try {
        if (!PRIVATE_KEY) {
            console.log('Private key not configured, skipping blockchain registration');
            return { success: false, error: 'Private key not configured' };
        }

        // Create provider and wallet
        const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
        const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
        
        // Create contract instance
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
        
        console.log('Registering product on blockchain:', serialNumber);
        
        // Call the registerProduct function
        const tx = await contract.registerProduct(
            name,
            brand,
            serialNumber,
            description,
            image,
            manufacturer,
            location,
            timestamp,
            expiryDate || ''
        );
        
        console.log('Transaction sent:', tx.hash);
        
        // Wait for transaction to be mined
        const receipt = await tx.wait();
        console.log('Transaction confirmed:', receipt.hash);
        
        return { success: true, txHash: receipt.hash };
        
    } catch (error) {
        console.error('Blockchain registration failed:', error);
        return { success: false, error: error.message };
    }
}


// auth
app.get('/authAll', async (req, res)=>{
    const data =  await client.query('Select * from auth');
    res.header('Access-Control-Allow-Credentials', true);
    res.send(data.rows);
    console.log("Data sent successfully");
});

app.post('/auth/:username/:password', async (req, res)=>{
    if (!isDbConnected) {
        return res.status(503).json({ error: 'Database not connected. Please check server logs.' });
    }
    
    const {username, password} = req.params;
    try {
        const data = await client.query(`SELECT * FROM auth WHERE username = '${username}' AND password = '${password}'`);
        res.send(data.rows);
        console.log("Authentication check completed");
    } catch (err) {
        console.error('Auth error:', err.message);
        res.status(500).json({ error: 'Authentication failed' });
    }
});

app.post('/addaccount', (req, res)=>{
    const {username, password, role} = req.body;
    createAccount(username, password, role);
    res.send('Data inserted');

});

app.post('/changepsw', (req, res)=>{
    const {username, password} = req.body;
    changePassword(username, password);
    res.send('Data updated');
});

// profile 

app.get('/profileAll', async (req, res)=>{
    const data =  await client.query('Select * from profile');
    res.header('Access-Control-Allow-Credentials', true);
    res.send(data.rows);
    console.log("Data sent successfully");
});

app.get('/profile/:username', async (req, res)=>{
    const {username} = req.params;
    const data =  await client.query(`SELECT * FROM profile WHERE username = '${username}'`);
    res.send(data.rows);
    console.log("Data sent successfully");
});

app.post('/addprofile', (req, res)=>{
    const {username, name, description, website, location, image, role} = req.body;
    createProfile(username, name, description, website, location, image, role);
    res.send('Data inserted');

});

// image

app.post('/upload/profile', (req, res)=>{

    let upload = multer({ storage: storageProfile}).single('image');

    upload(req, res, (err)=>{
        if(!req.file){
            return res.send('Please select an image to upload')
        }else if (err instanceof multer.MulterError){
            return res.send(err);
        } else if (err) {
            return res.send(err);
        }
    })
})

app.post('/upload/complaint', (req, res) => {
    let upload = multer({ storage: storageComplaint }).single('proof');

    upload(req, res, (err) => {
        if (!req.file) {
            return res.status(400).json({ error: 'Please select an image to upload' });
        } else if (err instanceof multer.MulterError) {
            return res.status(400).json({ error: err.message });
        } else if (err) {
            return res.status(500).json({ error: 'Error uploading file' });
        }

        res.json({ success: true, fileName: req.file.filename });
    });
});

// product

app.post('/upload/product', (req, res)=>{

    let upload = multer({ storage: storageProduct}).single('image');

    upload(req, res, (err)=>{
        if(!req.file){
            return res.send('Please select an image to upload')
        }else if (err instanceof multer.MulterError){
            return res.send(err);
        } else if (err) {
            return res.send(err);
        }
    })
})

app.get('/file/profile/:fileName', function (req, res) {
    const {fileName} = req.params;
    const filePath = path.join(__dirname, 'public/uploads/profile', fileName);
    res.sendFile(filePath);
});

app.get('/file/product/:fileName', function (req, res) {
    const {fileName} = req.params;
    const filePath = path.join(__dirname, 'public/uploads/product', fileName);
    res.sendFile(filePath);
});


app.get('/product/serialNumber', async (req, res)=>{
    const data =  await client.query(`SELECT serialNumber FROM product`);
    res.send(data.rows);
});

app.get('/product/details/:serialNumber', async (req, res)=>{
    const {serialNumber} = req.params;
    try {
        const data = await client.query(`SELECT * FROM product WHERE serialNumber = $1`, [serialNumber]);
        res.send(data.rows);
    } catch (err) {
        console.error('Error fetching product details:', err);
        res.status(500).send('Error fetching product details');
    }
});

app.get('/product/all', async (req, res)=>{
    try {
        const data = await client.query(`SELECT * FROM product ORDER BY serialNumber DESC`);
        res.send(data.rows);
    } catch (err) {
        console.error('Error fetching all products:', err);
        res.status(500).send('Error fetching products');
    }
});

app.post('/addproduct', async (req, res)=>{
    const {serialNumber, name, brand, manufacturer, description, image, location, timestamp, expiry_date} = req.body;
    
    try {
        console.log('Adding product to database:', { serialNumber, name, brand, manufacturer, image, expiry_date });
        
        // Add to database first
        const dbResult = await addProduct(serialNumber, name, brand, manufacturer, image, expiry_date);
        console.log('Database insert result:', dbResult);
        
        // Add to blockchain
        const blockchainResult = await addProductToBlockchain(
            serialNumber, 
            name, 
            brand, 
            (description || ''), 
            image, 
            manufacturer, 
            location, 
            timestamp,
            expiry_date
        );
        
        if (blockchainResult.success) {
            res.json({ 
                message: 'Product added to database and blockchain', 
                txHash: blockchainResult.txHash,
                dbResult: dbResult
            });
        } else {
            res.json({ 
                message: 'Product added to database, blockchain failed', 
                error: blockchainResult.error,
                dbResult: dbResult
            });
        }
        
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ error: 'Error adding product', details: error.message });
    }
});

// Consumer product collection endpoints
app.post('/consumer/products', async (req, res) => {
    const { username, serialNumber } = req.body || {};
    if (!username || !serialNumber) {
        return res.status(400).json({ error: 'username and serialNumber are required' });
    }

    try {
        await client.query(
            'INSERT INTO consumer_products (username, serial_number) VALUES ($1, $2) ON CONFLICT (username, serial_number) DO NOTHING',
            [username, serialNumber]
        );
        res.json({ success: true });
    } catch (err) {
        console.error('Error saving consumer product:', err);
        res.status(500).json({ error: 'Error saving product' });
    }
});

app.get('/consumer/products/:username', async (req, res) => {
    const { username } = req.params;
    if (!username) {
        return res.status(400).json({ error: 'username is required' });
    }

    try {
        const result = await client.query(
            `SELECT 
                cp.serial_number,
                cp.added_at,
                p.name,
                p.brand,
                '' AS description,
                p.manufacturer,
                p.image,
                p.expiry_date,
                (SELECT status FROM complaints c 
                    WHERE LOWER(c.complainant) = LOWER(cp.username)
                      AND LOWER(COALESCE(c.product_id::text, '')) = LOWER(cp.serial_number::text)
                    ORDER BY c.created_at DESC
                    LIMIT 1
                ) AS latest_status,
                (SELECT description FROM complaints c 
                    WHERE LOWER(c.complainant) = LOWER(cp.username)
                      AND LOWER(COALESCE(c.product_id::text, '')) = LOWER(cp.serial_number::text)
                    ORDER BY c.created_at DESC
                    LIMIT 1
                ) AS latest_complaint,
                (SELECT created_at FROM complaints c 
                    WHERE LOWER(c.complainant) = LOWER(cp.username)
                      AND LOWER(COALESCE(c.product_id::text, '')) = LOWER(cp.serial_number::text)
                    ORDER BY c.created_at DESC
                    LIMIT 1
                ) AS latest_complaint_at
            FROM consumer_products cp
            LEFT JOIN product p ON LOWER(p.serialnumber::text) = LOWER(cp.serial_number::text)
            WHERE LOWER(cp.username) = LOWER($1)
            ORDER BY cp.added_at DESC`,
            [username]
        );

        res.json(result.rows || []);
    } catch (err) {
        console.error('Error fetching consumer products:', err);
        res.status(500).json({ error: 'Error fetching consumer products' });
    }
});

// Manufacturer approval endpoints
app.put('/approve-manufacturer/:id', async (req, res)=>{
    const {id} = req.params;
    try {
        await client.query('UPDATE profile SET approved = true WHERE id = $1', [id]);
        res.send('Manufacturer approved successfully');
        console.log('Manufacturer approved successfully');
    } catch (err) {
        console.error('Error approving manufacturer:', err);
        res.status(500).send('Error approving manufacturer');
    }
});

app.delete('/reject-manufacturer/:id', async (req, res)=>{
    const {id} = req.params;
    try {
        // Get the username first to delete from auth table as well
        const profileResult = await client.query('SELECT username FROM profile WHERE id = $1', [id]);
        if (profileResult.rows.length > 0) {
            const username = profileResult.rows[0].username;
            // Delete from both tables
            await client.query('DELETE FROM profile WHERE id = $1', [id]);
            await client.query('DELETE FROM auth WHERE username = $1', [username]);
        }
        res.send('Manufacturer rejected and removed successfully');
        console.log('Manufacturer rejected and removed successfully');
    } catch (err) {
        console.error('Error rejecting manufacturer:', err);
        res.status(500).send('Error rejecting manufacturer');
    }
});

// Complaints endpoints
app.get('/complaints', async (req, res)=>{
    try {
        const data = await client.query('SELECT * FROM complaints ORDER BY created_at DESC');
        res.send(data.rows);
        console.log("Complaints data sent successfully");
    } catch (err) {
        console.error('Error fetching complaints:', err);
        res.status(500).send('Error fetching complaints');
    }
});

app.post('/add-complaint', async (req, res)=>{
    const {productId, complainant, complaintType, description, status, location, evidence} = req.body;
    try {
        await client.query(
            'INSERT INTO complaints (product_id, complainant, complaint_type, description, status, location, evidence, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())',
            [productId, complainant, complaintType, description, status || 'Open', location || null, evidence || null]
        );
        res.json({ success: true, message: 'Complaint added successfully' });
        console.log('Complaint added successfully');
    } catch (err) {
        console.error('Error adding complaint:', err);
        res.status(500).send('Error adding complaint');
    }
});

app.put('/update-complaint-status/:id', async (req, res)=>{
    const {id} = req.params;
    const {status} = req.body;
    try {
        await client.query('UPDATE complaints SET status = $1 WHERE id = $2', [status, id]);
        res.send('Complaint status updated successfully');
        console.log('Complaint status updated successfully');
    } catch (err) {
        console.error('Error updating complaint status:', err);
        res.status(500).send('Error updating complaint status');
    }
});

// Get company products endpoint
app.get('/company-products/:username', async (req, res)=>{
    const {username} = req.params;
    try {
        console.log(`Fetching products for company: ${username}`);
        
        // Get products for this specific company
        const result = await client.query(
            'SELECT * FROM product WHERE manufacturer = $1 ORDER BY serialnumber DESC', 
            [username]
        );
        
        console.log(`Found ${result.rows.length} products for ${username}`);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching company products:', err);
        res.status(500).json({ error: 'Error fetching company products', details: err.message });
    }
});

// Delete account endpoint
app.delete('/delete-account/:username', async (req, res)=>{
    const {username} = req.params;
    try {
        console.log(`Attempting to delete account: ${username}`);
        
        // First check if the account exists
        const profileCheck = await client.query('SELECT * FROM profile WHERE username = $1', [username]);
        const authCheck = await client.query('SELECT * FROM auth WHERE username = $1', [username]);
        
        if (profileCheck.rows.length === 0 && authCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Account not found' });
        }
        
        // Delete from profile table first (in case of foreign key constraints)
        if (profileCheck.rows.length > 0) {
            await client.query('DELETE FROM profile WHERE username = $1', [username]);
            console.log(`Deleted from profile table: ${username}`);
        }
        
        // Delete from auth table
        if (authCheck.rows.length > 0) {
            await client.query('DELETE FROM auth WHERE username = $1', [username]);
            console.log(`Deleted from auth table: ${username}`);
        }
        
        res.json({ message: 'Account deleted successfully' });
        console.log(`Account ${username} deleted successfully`);
    } catch (err) {
        console.error('Error deleting account:', err);
        res.status(500).json({ error: 'Error deleting account', details: err.message });
    }
});

app.listen(port, ()=>{
    console.log('Server is running on port 5000');
});
