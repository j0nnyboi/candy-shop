import { SingleBase, Nft } from '@j0nnyboi/candy-shop-types';
import { AxiosInstance } from 'axios';

export async function fetchNftByMint(axiosInstance: AxiosInstance, mint: string): Promise<Nft> {
  console.log('CandyShop: fetching NFT by mint address=', mint);
  return await axiosInstance.get<SingleBase<Nft>>(`/nft/${mint}`).then((response) => response.data.result);
}
