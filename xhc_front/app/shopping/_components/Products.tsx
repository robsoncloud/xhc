import React from 'react'
import ProductCard from './ProductCard';

const Products = () => {
    // Define a Product interface for type safety
    

    // Create an array of clothing products with prices similar to the example given
    const productList: ClothingProduct[] = [
        { name: "Leather Jacket", price: 350 },
        { name: "T-Shirt", price: 20 },
        { name: "Dress Shirt", price: 50 },
        { name: "Hoodie Sweatshirt", price: 60 }
    ];

    return (
        <div className='grid grid-cols-3 gap-10 p-8 '>
            {productList.map(p => (
                <ProductCard product={p} />
            ))}
        </div>
    )
}

export default Products


export interface ClothingProduct {
    name: string;
    price: number;
}