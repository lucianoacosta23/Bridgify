-- Seed data for Bridgify platform

-- Insert supported cryptocurrencies
INSERT OR IGNORE INTO supported_currencies (symbol, name, is_crypto, network, decimals, min_amount, max_amount) VALUES
('ETH', 'Ethereum', 1, 'ethereum', 18, 0.001, 1000.0),
('USDC', 'USD Coin', 1, 'ethereum', 6, 1.0, 100000.0),
('USDT', 'Tether USD', 1, 'ethereum', 6, 1.0, 100000.0),
('ARB', 'Arbitrum', 1, 'arbitrum', 18, 0.1, 10000.0),
('WETH', 'Wrapped Ethereum', 1, 'arbitrum', 18, 0.001, 1000.0);

-- Insert supported fiat currencies
INSERT OR IGNORE INTO supported_currencies (symbol, name, is_crypto, decimals, min_amount, max_amount) VALUES
('USD', 'US Dollar', 0, 2, 10.0, 50000.0),
('EUR', 'Euro', 0, 2, 10.0, 50000.0),
('GBP', 'British Pound', 0, 2, 10.0, 50000.0);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_payment_links_user_id ON payment_links(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_links_link_id ON payment_links(link_id);
CREATE INDEX IF NOT EXISTS idx_receipts_order_id ON receipts(order_id);
CREATE INDEX IF NOT EXISTS idx_mixer_transactions_user_id ON mixer_transactions(user_id);
