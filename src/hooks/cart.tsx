import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsFromStorage = await AsyncStorage.getItem(
        '@GoMarketplace:cartProducts',
      );

      if (productsFromStorage) {
        setProducts([...JSON.parse(productsFromStorage)]);
      }
    }

    loadProducts();
  }, []);

  const increment = useCallback(async id => {
    setProducts(product => {
      const productToUpdate = product.map(element =>
        element.id === id
          ? { ...element, quantity: element.quantity + 1 }
          : element,
      );

      AsyncStorage.setItem(
        '@GoMarketplace:cartProducts',
        JSON.stringify(productToUpdate),
      );

      return productToUpdate;
    });
  }, []);

  const decrement = useCallback(async id => {
    // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
  }, []);

  const addToCart = useCallback(
    async product => {
      const existentsProducts = products.find(item => item.id === product.id);

      if (existentsProducts) {
        increment(product.id);
      }

      const productToAdd = {
        ...product,
        quantity: 1,
      };

      setProducts(prevState => [...prevState, productToAdd]);

      await AsyncStorage.setItem(
        '@GoMarketplace:cartProducts',
        JSON.stringify(products),
      );
    },
    [products, increment],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
