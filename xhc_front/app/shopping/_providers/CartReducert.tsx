import { ClothingProduct } from "../_components/Products";


export type CartReducerType = {
    type: "ADD" | "REMOVE" | "UPDATE",
    payload: ClothingProduct
}
export function cartReducer(state: ClothingProduct[], action: CartReducerType) {
    switch(action.type) {
        case "ADD":
            return [...state, {name: action.payload.name, price: action.payload.price}]
        default:
            return state
    }   
}
