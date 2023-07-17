import * as fcl from "@onflow/fcl";
import { useState, useEffect } from "react";
import styles from '../styles/View.module.css';

export default function ShowNfts() {
  const [nfts, setNfts] = useState([]);
  const [user, setUser] = useState({ loggedIn: false, addr: undefined });

	useEffect(() => {
    fcl.currentUser.subscribe(setUser);
    getNFTs(user.addr)
  }, [user.addr]);

  async function getNFTs(addr) {
    try {
      const result = await fcl.query({
        cadence: `
                import Mintales from 0x2572bde9d02c396e
                import MetadataViews from 0x631e88ae7f1d7c20
                
                pub fun main(address: Address): [Mintales.MintalesData] {
                  let collection = getAccount(address).getCapability(Mintales.CollectionPublicPath)
                                    .borrow<&{MetadataViews.ResolverCollection}>()
                                    ?? panic("Could not borrow a reference to the nft collection")
                
                  let ids = collection.getIDs()
                
                  let answer: [Mintales.MintalesData] = []
                
                  for id in ids {
                    
                    let nft = collection.borrowViewResolver(id: id)
                    let view = nft.resolveView(Type<Mintales.MintalesData>())!
                
                    let display = view as! Mintales.MintalesData
                    answer.append(display)
                  }
                    
                  return answer
                }
                `,
        args: (arg, t) => [arg(addr, t.Address)],
      });
      setNfts(result);
    } catch (error) {
      console.log("err", error);
    }
  }

  return (
    <div className={styles.div}>
    <h1 className={styles.title}>
    <span>My </span>
    <span className={styles.color}>NFTs </span>
    </h1>
    <button className={styles.button} onClick={() => getNFTs(user.addr)}>Get NFTs</button>
      <main>
        <section className={styles.section}>
          {nfts.map((nft, index) => {
            return (
              <div key={index} className={styles.nftDiv}>
                <p className={styles.p}>Id: {nft.id}</p>
                <img src= {nft.url}/>
                <p className={styles.p}>Title: {nft.name}</p>
                <p className={styles.p}>Data: {nft.data}</p>
              </div>
            );
          })}
        </section>
      </main>
    </div>
  );
}