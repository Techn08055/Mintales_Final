'use client';
import Head from 'next/head';
import styles from './Home.module.css';
import Nav from '../components/Nav.jsx';
import TransferNfts from '../pages/transfernft';
import ShowNfts from '../pages/viewnft.jsx';
import { useState, useEffect} from 'react';
import * as fcl from '@onflow/fcl';
import React from 'react';
import axios from "axios"
import { NFTStorage, File, Blob } from "nft.storage"
const NFT_STORAGE_KEY = 'API KEY'
const client = new NFTStorage({ token: NFT_STORAGE_KEY })
var link = ' '
var Alert = ' !!! Wait To Mint !!!'

export default function Home() {

  const [newtitle, setNewTitle] = useState(' ');
  const [imageFile, setNewImageFile] = useState();
  const [newurl, setNewUrl] = useState(' ');
  const [newipfs, setNewIpfs] = useState(' ');
  const [newstory, setNewStory] = useState('Generate your Story ');
 
  const HTTP = "http://localhost:8080/chat";
  const HTTP1 = "http://localhost:8080/image";
  
  

  const [user, setUser] = useState({loggedIn: null})
  useEffect(() => fcl.currentUser.subscribe(setUser), [])

  const handleSubmit = (e) => {
    e.preventDefault();
    var prompt = "Write a story based on title '"+ newtitle + "'\
    You can choose any genre or setting for the story. However, regardless of the genre, \
    the story can have either a sad or happy ending. Maximum 500 words";
    axios
      .post(`${HTTP}`, { prompt })
      .then((res) => {
        setNewStory(res.data);
      })
      .catch((error) => {
        console.log(error);
      });

     
  };

  const b64toBlob = (b64Data, contentType='', sliceSize=512) => {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];
  
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
  
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
  
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
  
    const blob = new Blob(byteArrays, {type: contentType});
    return blob;
  }

  const getImage = (e) => {
    Alert = "!!! Wait To Mint !!!"
    e.preventDefault();
    var prompt =  newtitle + " Now, it's your turn to bring story to life \
    through hand-drawn illustrations. Let your imagination soar as you capture the \
    vibrant scenes, the emotions, and the transformation of the story in the most unexpected way.";
  
    axios
      .post(`${HTTP1}`,  {prompt} )
      .then((res) => {
        const blob = b64toBlob(res.data.data[0].b64_json, 'image/jpeg');
        setNewUrl(blob)
        setNewImageFile(URL.createObjectURL(blob));

        const cid = client.storeBlob(blob)
        cid.then((value) =>  {
            setNewIpfs(value)
            Alert = "You can mint Now"
            
        });
      })
      .catch((error) => {
        console.log(error);
      });
     
  };

  // Send a request to the server with the prompt

  async function runTransaction() {
    const transactionId = await fcl.mutate({
      cadence: `
      import Mintales from 0x2572bde9d02c396e
      import NonFungibleToken from 0x631e88ae7f1d7c20
      import MetadataViews from 0x631e88ae7f1d7c20
      
      transaction(name: String, data: String, url: String){
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
            Mintales.mintNFT(recipient: self.recipientCollection, name: name, data: data,url: url)
        }
    }
      `,
      args: (arg, t) => [
        arg(newtitle, t.String),
        arg(newstory, t.String),
        arg("https://ipfs.io/ipfs/" + newipfs, t.String)
    ],
      proposer: fcl.authz,
      payer: fcl.authz,
      authorizations: [fcl.authz],
      limit: 999
    });
  
    console.log('Here is the transactionId: ' + transactionId);
    Alert = "!!! Wait To Mint !!!"
  }

  // async function executeScript() {
  //   const response = await fcl.query({
  //     cadence: `
  //     import NonFungibleToken from 0x1651de0ac812d413
  //     import Mintales from 0x4d6fc1ff68e058d8
      
  //     /// Script to get NFT IDs in an account's collection
  //     ///
  //     pub fun main(address: Address): [UInt64] {
  //         let account = getAccount(address)
      
  //         let collectionRef = account
  //             .getCapability(Mintales.CollectionPublicPath)
  //             .borrow<&{NonFungibleToken.CollectionPublic}>()
  //             ?? panic("Could not borrow capability from public collection at specified path")
      
  //         return collectionRef.getIDs()
  //     }`, // CADENCE CODE GOES IN THESE ``
  //     args: (arg, t) => [arg(user.addr, t.Address)] // ARGUMENTS GO IN HERE
  //   });
  
  //   console.log('Response from our script: ' + response);
  // }

  return (
    <div>
			<Head>
				<title>Mintales</title>
				<meta name="description" content="Created by Emerald Academy" />
				<link rel="icon" href="https://i.imgur.com/hvNtbgD.png" />
			</Head>

			<Nav />

			<main className={styles.main}>
				<h1 className={styles.title}>
        <span>Generate Your </span>
        <span className={styles.color}>Imagination </span>
				</h1>

        <textarea className={styles.title_box} rows="2" cols="100" onChange={(e) => setNewTitle(e.target.value)} placeholder="Your Story Title Here"  />
        <button onClick={handleSubmit}>Generate Story</button>
        <textarea className={styles.box} rows="30" cols="100" onChange={(e) => setNewStory(e.target.value)} placeholder="Generate Your Story" value= {newstory} />
        <button onClick={getImage}>Get Image</button>
        <p>{Alert}</p>
        <img className={styles.image} src={imageFile}></img>

        <div className={styles.flex}>
          <button onClick={runTransaction}>Mint Story</button>
        </div>

			</main>
      <ShowNfts/>
      <TransferNfts/>
		</div>
  )
}
