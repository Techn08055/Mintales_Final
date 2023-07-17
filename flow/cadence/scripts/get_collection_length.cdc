import NonFungibleToken from "../contracts/NonFungibleToken.cdc"
import Mintales from "../contracts/Mintales.cdc"

pub fun main(address: Address): Int {
    let account = getAccount(address)

    let collectionRef = account
        .getCapability(Mintales.CollectionPublicPath)
        .borrow<&{NonFungibleToken.CollectionPublic}>()
        ?? panic("Could not borrow capability from public collection")
    
    return collectionRef.getIDs().length
}