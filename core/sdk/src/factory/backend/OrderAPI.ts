import { ListBase, Order, OrdersFilterQuery, Side, SingleBase, Status } from '@j0nnyboi/candy-shop-types';
import { AxiosInstance } from 'axios';
import qs from 'qs';

export async function fetchOrdersByStoreId(
  axiosInstance: AxiosInstance,
  storeId: string,
  ordersFilterQuery: OrdersFilterQuery
): Promise<ListBase<Order>> {
  const {
    sortBy,
    offset,
    limit,
    identifiers,
    sellerAddress,
    candyShopAddress,
    attribute: attributeQuery
  } = ordersFilterQuery;
  let queryParams: any = {};
  let attribute: any = undefined;
  if (attributeQuery) {
    const attributes = Array.isArray(attributeQuery) ? attributeQuery : [attributeQuery];
    attribute = attributes.map((attr) => {
      const entry = Object.entries(attr)[0];
      return { trait_type: entry[0], value: entry[1] };
    });
  }

  console.log(`CandyShop: fetching orders from ${storeId}`, { query: ordersFilterQuery });

  if (sortBy) {
    const arrSortBy = Array.isArray(sortBy) ? sortBy : [sortBy];
    queryParams.orderByArr = arrSortBy.map((sort) => JSON.stringify(sort));
  }

  if (offset) {
    queryParams.offset = offset;
  }

  if (limit) {
    queryParams.limit = limit;
  }

  if (identifiers && identifiers.length !== 0) {
    queryParams['filterArr[]'] = identifiers.map((identifier) =>
      JSON.stringify({
        side: Side.SELL,
        status: Status.OPEN,
        identifier,
        walletAddress: sellerAddress,
        candyShopAddress,
        attribute
      })
    );
  } else {
    queryParams['filterArr[]'] = JSON.stringify({
      side: Side.SELL,
      status: Status.OPEN,
      walletAddress: sellerAddress,
      candyShopAddress,
      attribute
    });
  }

  return axiosInstance
    .get<ListBase<Order>>(`/order/${storeId}?${qs.stringify(queryParams, { indices: false })}`)
    .then((response) => response.data);
}

/**
 * @deprecated The method should not be used.
 * Please use function fetchOrderByTokenMintAndShopId below
 */
export async function fetchOrderByTokenMint(
  axiosInstance: AxiosInstance,
  mintAddress: string
): Promise<SingleBase<Order>> {
  return axiosInstance.get<SingleBase<Order>>(`/order/mint/${mintAddress}`).then((response) => response.data);
}

export async function fetchOrderByTokenMintAndShopId(
  axiosInstance: AxiosInstance,
  mintAddress: string,
  shopId: string
): Promise<SingleBase<Order>> {
  console.log(`CandyShop: fetching orders by shop address=${shopId}, mintAddress=${mintAddress}`);
  return axiosInstance
    .get<SingleBase<Order>>(`/order/mint/${mintAddress}/shop/${shopId}`)
    .then((response) => response.data);
}

export async function fetchOrdersByStoreIdAndWalletAddress(
  axiosInstance: AxiosInstance,
  storeId: string,
  walletAddress: string
): Promise<Order[]> {
  console.log(`CandyShop: fetching orders by shop address=${storeId}, walletAddress=${walletAddress}`);
  // handles pagination internally
  const limit = 10;
  let offset = 0;
  let resCount: number | null = null;
  let orders: Order[] = [];

  while (resCount === null || resCount == limit) {
    const page: Order[] = await axiosInstance
      .get<ListBase<Order>>(
        `/order/${storeId}?offset=${offset}&limit=${limit}&filterArr[]=${JSON.stringify({
          side: 1,
          status: 0,
          walletAddress
        })}`
      )
      .then((response) => response.data?.result);
    resCount = page.length;
    offset = offset + limit;
    orders = orders.concat(page);
  }

  return orders;
}
