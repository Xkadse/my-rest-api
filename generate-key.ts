import { Keypair } from "@solana/web3.js";
 
const keypair = Keypair.generate();
let sk = keypair;
console.log(sk)