import React, { useState } from 'react';
import './ProductCatalogue.css';
import CustomerProductList from './customer/CustomerProductList';
import ProductList from './ProductList';

const ProductCatalogue = ({ userType, user }) => {
  // Always call hooks first
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Use the admin ProductList for both admin and customer, but pass userType
  return <ProductList userType={userType} user={user} />;
};

export default ProductCatalogue;
