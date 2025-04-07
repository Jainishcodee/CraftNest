
import { Request, Response } from 'express';
import { ProductModel, Product } from '../models/Product';

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const approved = req.query.approved === 'true' ? true : 
                      req.query.approved === 'false' ? false : 
                      undefined;
    
    const products = await ProductModel.getAll({ approved });
    res.status(200).json(products);
  } catch (error) {
    console.error('Error getting products:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await ProductModel.getById(id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.status(200).json(product);
  } catch (error) {
    console.error('Error getting product by id:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price, vendor_id, vendor_name, category, images, stock } = req.body;
    
    if (!name || !description || !price || !vendor_id || !vendor_name || !category || !images || !stock) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    const newProduct: Product = {
      name,
      description,
      price,
      vendor_id,
      vendor_name,
      category,
      images,
      approved: false, // Admin needs to approve
      featured: false,
      stock
    };
    
    const product = await ProductModel.create(newProduct);
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const approveProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { approved } = req.body;
    
    if (approved === undefined) {
      return res.status(400).json({ message: 'Approved status is required' });
    }
    
    const success = await ProductModel.updateApproval(id, approved);
    
    if (!success) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.status(200).json({ message: `Product ${approved ? 'approved' : 'unapproved'} successfully` });
  } catch (error) {
    console.error('Error approving product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getVendorProducts = async (req: Request, res: Response) => {
  try {
    const { vendorId } = req.params;
    const products = await ProductModel.getByVendorId(vendorId);
    res.status(200).json(products);
  } catch (error) {
    console.error('Error getting vendor products:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
