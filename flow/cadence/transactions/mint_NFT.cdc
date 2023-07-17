import Mintales from "../contracts/Mintales.cdc"
import NonFungibleToken from "../contracts/NonFungibleToken.cdc"
import MetadataViews from "../contracts/MetadataViews.cdc"
transaction(name: String, data: String){
    let recipientCollection: &Mintales.Collection{NonFungibleToken.CollectionPublic}

    prepare(signer: AuthAccount){
        
    if signer.borrow<&Mintales.Collection>(from: Mintales.CollectionStoragePath) == nil {
    signer.save(<- Mintales.createEmptyCollection(), to: Mintales.CollectionStoragePath)
    signer.link<&Mintales.Collection{NonFungibleToken.CollectionPublic, MetadataViews.ResolverCollection}>(Mintales.CollectionPublicPath, target: Mintales.CollectionStoragePath)
    }

    self.recipientCollection = signer.getCapability(Mintales.CollectionPublicPath)
                                .borrow<&Mintales.Collection{NonFungibleToken.CollectionPublic}>() ?? panic("Could not get receiver reference to the NFT Collection")
    }
    execute{
        Mintales.mintNFT(recipient: self.recipientCollection, name: name, data: data)
    }
}