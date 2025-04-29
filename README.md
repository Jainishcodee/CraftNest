
# CraftNest - Handmade Marketplace

CraftNest is an online marketplace for handmade artisanal products.

## Supabase Setup

This project uses Supabase for authentication, database, and storage. Follow these steps to set up your Supabase project:

### 1. Create Database Tables

Run the following SQL in your Supabase SQL editor:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('customer', 'vendor', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  vendor_id UUID REFERENCES profiles(id) NOT NULL,
  vendor_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('pottery', 'jewelry', 'woodwork', 'textiles', 'art', 'other')),
  images TEXT[] NOT NULL,
  rating DECIMAL(3,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  approved BOOLEAN DEFAULT FALSE,
  featured BOOLEAN DEFAULT FALSE,
  stock INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES profiles(id) NOT NULL,
  customer_name TEXT NOT NULL,
  vendor_id UUID REFERENCES profiles(id) NOT NULL,
  vendor_name TEXT NOT NULL,
  products JSONB NOT NULL, -- Array of products with quantity
  total DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  shipping_address TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) NOT NULL,
  customer_id UUID REFERENCES profiles(id) NOT NULL,
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles: Users can read all profiles but only update their own
CREATE POLICY "Public profiles are viewable by everyone" 
  ON profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Products: Anyone can view approved products, vendors can CRUD their own products, admins can approve
CREATE POLICY "Approved products are viewable by everyone" 
  ON products FOR SELECT 
  USING (approved = true OR auth.uid() = vendor_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Vendors can insert their own products" 
  ON products FOR INSERT 
  WITH CHECK (auth.uid() = vendor_id);

CREATE POLICY "Vendors can update their own products" 
  ON products FOR UPDATE 
  USING (auth.uid() = vendor_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Orders: Customers can see their orders, vendors can see orders for their products
CREATE POLICY "Customers can see their orders" 
  ON orders FOR SELECT 
  USING (auth.uid() = customer_id OR auth.uid() = vendor_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Customers can create orders" 
  ON orders FOR INSERT 
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Vendors can update their orders" 
  ON orders FOR UPDATE 
  USING (auth.uid() = vendor_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Reviews: Anyone can read reviews, customers can create reviews
CREATE POLICY "Reviews are viewable by everyone" 
  ON reviews FOR SELECT 
  USING (true);

CREATE POLICY "Customers can create reviews" 
  ON reviews FOR INSERT 
  WITH CHECK (auth.uid() = customer_id);

-- Create functions
-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'name',
    new.email,
    new.raw_user_meta_data->>'role'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 2. Environment Variables

Create a `.env.local` file in your project root with the following variables:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Replace `your_supabase_url` and `your_supabase_anon_key` with your actual Supabase project URL and anon key from your Supabase dashboard.

### 3. Setup Storage

Create a storage bucket called `product-images` in your Supabase project for storing product images.

## Running the Application

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to http://localhost:5173
