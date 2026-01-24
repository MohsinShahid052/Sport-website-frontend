// context/CartContext.js
import { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  // Load cart from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        console.log('🛒 Loaded cart from localStorage:', parsedCart);
        setCartItems(parsedCart);
      } catch (error) {
        console.error('❌ Error loading cart from localStorage:', error);
        localStorage.removeItem('cart');
      }
    }
  }, []);

  // Save cart to localStorage whenever cartItems change
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    } else {
      localStorage.removeItem('cart');
    }
    
    // Dispatch event to update navbar counter
    window.dispatchEvent(new Event('cartUpdated'));
  }, [cartItems]);

  // Fix product data structure to ensure consistency
  const normalizeProductData = (product) => {
    return {
      _id: product._id || product.product || `temp-${Date.now()}`,
      name: product.name || 'Unknown Product',
      price: product.price || 0,
      originalPrice: product.originalPrice || product.price || 0,
      images: product.images || [],
      image: product.image || product.images?.[0] || '',
      brand: product.brand || '',
      category: product.category || '',
      stock: product.stock || 10,
      quantity: product.quantity || 1
    };
  };

  const addToCart = (product, quantity = 1) => {
    console.log('🛒 Adding to cart:', product);
    
    const normalizedProduct = normalizeProductData(product);
    
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => 
        item._id === normalizedProduct._id
      );
      
      if (existingItemIndex >= 0) {
        // Update quantity if item already exists
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity
        };
        return updatedItems;
      } else {
        // Add new item to cart
        const newItem = {
          ...normalizedProduct,
          quantity: quantity
        };
        return [...prevItems, newItem];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item._id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }

    setCartItems(prevItems => {
      return prevItems.map(item =>
        item._id === productId
          ? { ...item, quantity: newQuantity }
          : item
      );
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartItem = (productId) => {
    return cartItems.find(item => item._id === productId);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    getCartItem
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}