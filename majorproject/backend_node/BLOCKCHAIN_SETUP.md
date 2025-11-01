# Blockchain Integration Setup

## Environment Variables Required

Add these to your `.env` file in the backend_node directory:

```env
# Database Configuration (already configured)
DB_HOST=localhost
DB_USER=postgres
DB_PORT=5432
DB_PASSWORD=your_password
DB_NAME=identeefi

# Blockchain Configuration (ADD THESE)
SEPOLIA_QUICKNODE_KEY=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=your_wallet_private_key_here
```

## How to Get These Values:

### 1. SEPOLIA_QUICKNODE_KEY
- Go to [Infura](https://infura.io/) or [Alchemy](https://www.alchemy.com/)
- Create a new project
- Select "Ethereum" and "Sepolia" network
- Copy the HTTPS URL

### 2. PRIVATE_KEY
- Open MetaMask
- Go to Account Details → Export Private Key
- Copy the private key (starts with 0x)
- **⚠️ SECURITY WARNING: Never share this key or commit it to version control!**

## Testing the Integration:

1. Start the backend server: `node postgres.js`
2. Add a product through the frontend
3. Check the console logs for blockchain transaction details
4. Verify the product appears in both database and blockchain

## Error Handling:

- If private key is not configured, products will only be added to database
- If blockchain transaction fails, product is still added to database
- All errors are logged to console for debugging
