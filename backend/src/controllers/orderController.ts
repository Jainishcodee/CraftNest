
import { Request, Response } from 'express';
import { OrderModel, Order } from '../models/Order';

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await OrderModel.getAll();
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error getting orders:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getCustomerOrders = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    const orders = await OrderModel.getByCustomerId(customerId);
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error getting customer orders:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getVendorOrders = async (req: Request, res: Response) => {
  try {
    const { vendorId } = req.params;
    const orders = await OrderModel.getByVendorId(vendorId);
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error getting vendor orders:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { customer_id, customer_name, vendor_id, vendor_name, products, total, shipping_address, payment_method } = req.body;
    
    if (!customer_id || !customer_name || !vendor_id || !vendor_name || !products || !total || !shipping_address || !payment_method) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    const newOrder: Order = {
      customer_id,
      customer_name,
      vendor_id,
      vendor_name,
      products,
      total,
      status: 'pending',
      shipping_address,
      payment_method
    };
    
    const order = await OrderModel.create(newOrder);
    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    const success = await OrderModel.updateStatus(id, status);
    
    if (!success) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.status(200).json({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
