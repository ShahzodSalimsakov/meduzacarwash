export class IProduct {
  id: string;
  name: string;
  price: number;
}

export class IProductCategory {
  id: string;
  name: string;
  is_additional: boolean;
  products_product_categories: IProduct[] | null;
}
