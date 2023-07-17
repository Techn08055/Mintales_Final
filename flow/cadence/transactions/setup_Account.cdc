
import NonFungibleToken from "../contracts/NonFungibleToken.cdc"
import Mintales from "../contracts/Mintales.cdc"
import MetadataViews from "../contracts/MetadataViews.cdc"
/// This transaction is what an account would run
/// to set itself up to receive NFTs

transaction {

    prepare(signer: AuthAccount) {
        // Return early if the account already has a collection
        if signer.borrow<&Mintales.Collection>(from: Mintales.CollectionStoragePath) != nil {
            return
        }

        // Create a new empty collection
        let collection <- Mintales.createEmptyCollection()

        // save it to the account
        signer.save(<-collection, to: Mintales.CollectionStoragePath)

        // create a public capability for the collection
        signer.link<&{NonFungibleToken.CollectionPublic, Mintales.MintomicsCollectionPublic, MetadataViews.ResolverCollection}>(
            Mintales.CollectionPublicPath,
            target: Mintales.CollectionStoragePath
        )
    }
}