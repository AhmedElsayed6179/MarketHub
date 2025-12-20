export interface ICartItem {
  productId: number;
  quantity: number;
}

export interface ICart {
  id: number;
  userId: number;
  items: ICartItem[];
}

export interface CartViewItem {
  productId: number;
  title: string;
  image: string;
  price: number;
  quantity: number;
}
