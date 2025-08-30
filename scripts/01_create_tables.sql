-- Bridgify Database Schema
-- SQLite database for crypto on/off-ramp platform

-- Users table for wallet integration and user management
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    wallet_address TEXT UNIQUE NOT NULL,
    email TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    kyc_status TEXT DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected')),
    total_volume DECIMAL(18, 8) DEFAULT 0.0
);

-- Orders table for buy/sell transactions
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    order_type TEXT NOT NULL CHECK (order_type IN ('buy', 'sell')),
    crypto_currency TEXT NOT NULL,
    fiat_currency TEXT NOT NULL DEFAULT 'USD',
    crypto_amount DECIMAL(18, 8) NOT NULL,
    fiat_amount DECIMAL(10, 2) NOT NULL,
    exchange_rate DECIMAL(18, 8) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    payment_method TEXT,
    transaction_hash TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Payment links for QR code generation and sharing
CREATE TABLE IF NOT EXISTS payment_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    link_id TEXT UNIQUE NOT NULL,
    order_id INTEGER,
    amount DECIMAL(18, 8) NOT NULL,
    currency TEXT NOT NULL,
    description TEXT,
    qr_code_data TEXT,
    expires_at DATETIME,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (order_id) REFERENCES orders (id)
);

-- Receipts for transaction records (simulated IPFS storage)
CREATE TABLE IF NOT EXISTS receipts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    receipt_hash TEXT UNIQUE NOT NULL,
    ipfs_hash TEXT, -- Simulated IPFS hash
    receipt_data TEXT NOT NULL, -- JSON data
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Removed donation_settings table completely

-- Simulated mixer transactions for privacy features (sandbox only)
CREATE TABLE IF NOT EXISTS mixer_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    input_amount DECIMAL(18, 8) NOT NULL,
    output_amount DECIMAL(18, 8) NOT NULL,
    currency TEXT NOT NULL,
    mixer_fee DECIMAL(18, 8) NOT NULL,
    anonymity_set_size INTEGER DEFAULT 10,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'mixing', 'completed', 'failed')),
    input_tx_hash TEXT,
    output_tx_hash TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Supported currencies and their configurations
CREATE TABLE IF NOT EXISTS supported_currencies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    is_crypto BOOLEAN NOT NULL,
    network TEXT, -- For crypto currencies (ethereum, arbitrum, etc.)
    contract_address TEXT, -- For ERC-20 tokens
    decimals INTEGER DEFAULT 18,
    min_amount DECIMAL(18, 8) DEFAULT 0.001,
    max_amount DECIMAL(18, 8) DEFAULT 1000000,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
