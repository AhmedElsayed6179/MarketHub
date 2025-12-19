import { ICartItem } from "./icart";

export interface PlaceOrder {
  userId: number;
  name: string;
  address: string;
  phone: string;
  paymentMethod: string;
  items: ICartItem[];
  total: number;
  createdAt: Date;
}
