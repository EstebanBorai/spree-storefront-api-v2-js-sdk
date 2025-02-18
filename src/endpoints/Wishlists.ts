import Http from '../Http'
import type { NoContentResponse, NoContentResult } from '../interfaces/NoContent'
import type { IToken } from '../interfaces/Token'
import type {
  WishedItem,
  WishedItemResult,
  WishlistsAddWishedItem,
  WishlistsUpdateWishedItem
} from '../interfaces/WishedItem'
import type {
  WishlistsList,
  WishlistsResult,
  Wishlists as WishlistsResponse,
  Wishlist as WishlistResponse,
  WishlistsShow,
  WishlistResult,
  WishlistsDefault,
  WishlistsCreate,
  WishlistsUpdate
} from '../interfaces/Wishlist'
import routes from '../routes'

export default class Wishlists extends Http {
  public async list(token: IToken, params: WishlistsList = {}): Promise<WishlistsResult> {
    return await this.spreeResponse<WishlistsResponse>('get', routes.wishlistsPath(), token, params)
  }

  public async show(token: IToken, wishlistToken: string, params: WishlistsShow = {}): Promise<WishlistResult> {
    return await this.spreeResponse<WishlistResponse>('get', routes.wishlistPath(wishlistToken), token, params)
  }

  public async default(token: IToken, params: WishlistsDefault = {}): Promise<WishlistResult> {
    return await this.spreeResponse<WishlistResponse>('get', routes.defaultWishlistPath(), token, params)
  }

  public async create(token: IToken, params: WishlistsCreate): Promise<WishlistResult> {
    return await this.spreeResponse<WishlistResponse>('post', routes.wishlistsPath(), token, params)
  }

  public async update(token: IToken, wishlistToken: string, params: WishlistsUpdate): Promise<WishlistResult> {
    return await this.spreeResponse<WishlistResponse>('patch', routes.wishlistPath(wishlistToken), token, params)
  }

  public async remove(token: IToken, wishlistToken: string): Promise<NoContentResult> {
    return await this.spreeResponse<NoContentResponse>('delete', routes.wishlistPath(wishlistToken), token)
  }

  public async addWishedItem(
    token: IToken,
    wishlistToken: string,
    params: WishlistsAddWishedItem
  ): Promise<WishedItemResult> {
    return await this.spreeResponse<WishedItem>('post', routes.wishlistsAddWishedItemPath(wishlistToken), token, params)
  }

  public async updateWishedItem(
    token: IToken,
    wishlistToken: string,
    id: string,
    params: WishlistsUpdateWishedItem
  ): Promise<WishedItemResult> {
    return await this.spreeResponse<WishedItem>(
      'patch',
      routes.wishlistsUpdateWishedItemQuantityPath(wishlistToken, id),
      token,
      params
    )
  }

  public async removeWishedItem(token: IToken, wishlistToken: string, id: string): Promise<WishedItemResult> {
    return await this.spreeResponse<WishedItem>(
      'delete',
      routes.wishlistsRemoveWishedItemPath(wishlistToken, id),
      token
    )
  }
}
