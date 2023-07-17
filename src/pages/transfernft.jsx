import * as fcl from "@onflow/fcl";
import { useState, useEffect } from "react";
import styles from '../styles/View.module.css';

export default function TransferNfts() {
  const [id, setids] = useState();
  const [recipient, setRecipient] = useState();

  async function transferNFT (addr) {
    try {
      const transactionId = await fcl.mutate({
        cadence: `
        import Mintales from 0x2572bde9d02c396e
        import NonFungibleToken from 0x631e88ae7f1d7c20

        transaction(recipient: Address, withdrawID: UInt64) {

            /// Reference to the withdrawer's collection
            let withdrawRef: &Mintales.Collection
        
            /// Reference of the collection to deposit the NFT to
            let depositRef: &{NonFungibleToken.CollectionPublic}
        
            prepare(signer: AuthAccount) {
                // borrow a reference to the signer's NFT collection
                self.withdrawRef = signer
                    .borrow<&Mintales.Collection>(from: Mintales.CollectionStoragePath)
                    ?? panic("Account does not store an object at the specified path")
        
                // get the recipients public account object
                let recipient = getAccount(recipient)
        
                // borrow a public reference to the receivers collection
                self.depositRef = recipient
                    .getCapability(Mintales.CollectionPublicPath)
                    .borrow<&{NonFungibleToken.CollectionPublic}>()
                    ?? panic("Could not borrow a reference to the receiver's collection")
        
            }
        
            execute {
        
                // withdraw the NFT from the owner's collection
                let nft <- self.withdrawRef.withdraw(withdrawID: withdrawID)
        
                // Deposit the NFT in the recipient's collection
                self.depositRef.deposit(token: <-nft)
            }
        
            post {
                !self.withdrawRef.getIDs().contains(withdrawID): "Original owner should not have the NFT anymore"
                self.depositRef.getIDs().contains(withdrawID): "The reciever should now own the NFT"
            }
        }
                `,
        args: (arg, t) => [
            arg(recipient, t.Address),
            arg(id, t.UInt64),
        ],
            proposer: fcl.authz,
            payer: fcl.authz,
            authorizations: [fcl.authz],
            limit: 999
        });
        console.log(transactionId)
    } catch (error) {
      console.log("err", error);
    }
  }

  return (
    <div className={styles.div}>
    <h1 className={styles.title}>
    <span>Transfer </span>
    <span className={styles.color}>NFTs </span>
    </h1>
    <textarea className={styles.box} rows="2" cols="20" onChange={(e) => setRecipient(e.target.value)} placeholder="Recipient Address"  />
    <textarea className={styles.box} rows="2" cols="20" onChange={(e) => setids(e.target.value)} placeholder="NFT Id" />
    <button onClick={transferNFT}>Transfer NFT</button>
    </div>
  );
}