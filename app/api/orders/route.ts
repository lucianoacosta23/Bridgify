import { type NextRequest, NextResponse } from "next/server"

// In-memory store for orders and users
interface User {
  id: number;
  wallet_address: string;
  email?: string;
  created_at: string;
  updated_at: string;
  kyc_status: 'pending' | 'verified' | 'rejected';
  total_volume: number;
}

interface Order {
  id: number;
  user_id: number;
  order_type: 'buy' | 'sell';
  crypto_currency: string;
  fiat_currency: string;
  crypto_amount: number;
  fiat_amount: number;
  exchange_rate: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  payment_method?: string;
  transaction_hash?: string;
  wallet_address: string;
  rates_status: string;
  created_at: string;
  completed_at?: string;
}

// In-memory storage
let users: User[] = [];
let orders: Order[] = [];
let userIdCounter = 1;
let orderIdCounter = 1;

interface CreateOrderRequest {
  orderType: 'buy' | 'sell';
  cryptoCurrency: string;
  fiatCurrency?: string;
  cryptoAmount: number;
  fiatAmount: number;
  exchangeRate: number;
  paymentMethod?: string;
  walletAddress: string;
  ratesStatus?: string;
}

// GET /api/orders - Fetch orders with optional limit
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit') as string) : 50;
    const wallet = searchParams.get('wallet');

    // Filter orders by wallet if provided
    let result = wallet 
      ? orders.filter(order => order.wallet_address === wallet)
      : [...orders];

    // Sort by created_at in descending order
    result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Apply limit
    if (limit) {
      result = result.slice(0, limit);
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST /api/orders - Create new order
export async function POST(request: NextRequest) {
  try {
    const body: CreateOrderRequest = await request.json();

    // Basic validation
    if (!body.walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    if (!['buy', 'sell'].includes(body.orderType)) {
      return NextResponse.json(
        { error: 'Invalid order type' },
        { status: 400 }
      );
    }

    // Find or create user
    let user = users.find(u => u.wallet_address === body.walletAddress);
    
    if (!user) {
      const newUser: User = {
        id: userIdCounter++,
        wallet_address: body.walletAddress,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        kyc_status: 'pending',
        total_volume: 0
      };
      users.push(newUser);
      user = newUser;
    }

    // Create order
    const newOrder: Order = {
      id: orderIdCounter++,
      user_id: user.id,
      order_type: body.orderType,
      crypto_currency: body.cryptoCurrency,
      fiat_currency: body.fiatCurrency || 'USD',
      crypto_amount: body.cryptoAmount,
      fiat_amount: body.fiatAmount,
      exchange_rate: body.exchangeRate,
      status: 'pending',
      payment_method: body.paymentMethod,
      wallet_address: body.walletAddress,
      rates_status: body.ratesStatus || 'live',
      created_at: new Date().toISOString()
    };

    orders.push(newOrder);

    // Update user's total volume
    user.total_volume += body.fiatAmount;
    user.updated_at = new Date().toISOString();

    return NextResponse.json({
      success: true,
      data: newOrder,
      message: "Order created successfully"
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create order" },
      { status: 500 }
    );
  }
}
