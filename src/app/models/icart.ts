export interface ICartItem {
  productId: number;
  title: string;
  image?: string;
  price: number;
  quantity: number;
}

export interface ICart {
  id: number;
  userId: number;
  items: ICartItem[];
}

