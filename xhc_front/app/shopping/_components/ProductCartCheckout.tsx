import { ShoppingBag, ShoppingCart } from 'lucide-react'
import React, { useContext } from 'react'
import CartContext from '../_providers/CartContext'


const ProductCartCheckout = ({ visible }: { visible: boolean }) => {
    const context = useContext(CartContext)

    if (context == undefined) {
        throw new Error("You need to use the CartProvider")
    }

    const { state } = context
    if (visible === false) return null
    return (
        <div>
            {/* Cart Checkout */}
            <div className='absolute border-2 right-[10%] top-[230%]  bg-white min-w-[300px] rounded-md p-4 space-y-4 '>
                {/* Header */}
                <div className=' border-b-gray-200 border-b-[1.5px] pb-3 flex justify-between items-center'>
                    <div className='flex gap-2 relative'>
                        <ShoppingCart className='stroke-green-800' />
                        <span className='rounded-full bg-green-700  w-6 h-6 text-white text-xs flex items-center justify-center'>{state.length}</span>                        </div>
                    <div className='text-sm'>
                        <span className='text-gray-500 font-medium'>Total:</span> R$ {state.reduce((a, b) => a + b.price, 0)}
                    </div>
                </div>
                <ul className='space-y-4 flex flex-col  '>
                    {state.map(product => (
                        <li className='flex gap-4'>
                            <ShoppingBag size={48} />
                            <div className='flex flex-col flex-1'>
                                <span className='font-medium'>{product.name}</span>
                                <div className='space-x-4'>
                                    <span className='text-blue-500 text-sm'>R$ 350</span>
                                    <span className='text-gray-400 text-sm'>Quantity: 1</span>
                                </div>
                            </div>
                        </li>
                    ))}

                </ul>

                <button className='bg-green-600 text-white w-full rounded-md p-2 '>Checkout</button>
            </div>
        </div>
    )
}

export default ProductCartCheckout