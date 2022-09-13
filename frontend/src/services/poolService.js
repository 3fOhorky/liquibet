import { ethers, utils } from 'ethers';
import { formatDateTime, formatPeriod } from "../helpers/dates";
import { toast } from "react-toastify";
import { provider, getLiquibetContract, getTokenContract } from "./blockchainService";

async function getPoolIds() {
  const contract = getLiquibetContract(provider);
  const count = await contract.getPoolsCount();
  return [...Array(count).keys()].map(i => i + 1);
}

async function getPools() {
  const contract = getLiquibetContract(provider);
  const count = await contract.getPoolsCount();

  const pools = []; 
  for (let poolId = 1; poolId <= count; poolId++) {
    pools.push(await getPoolData(poolId));
  }
  
  return pools;
}

// Chinlink feeds return to 8 decimal places NOT 18 so add 10 decimal places back in
function parseTokenUnits(assetName, amount){
  console.log("ASSET: %s; units %s", assetName, ethers.utils.formatEther(amount));
  if (assetName === "ETHUSD" || assetName === "LINKUSD"){
    return (Math.round((ethers.utils.formatEther(amount)*1e10)*100)/100).toFixed(2);
  } else if (assetName === "BTCUSD"){
  console.log("ASSET: %s; units %s", assetName, (amount/100000000));
    return (amount / 100000000);
  }
  else throw new Error("Couldn't parse asset name %s", assetName);
}

async function getPoolData(poolId) {
  const contract = getLiquibetContract(provider);
  const pool = await contract.pools(poolId);
  const fee = await contract.fee();

  let tiersCount = 5;
  let tiers = [];
  for(let i = 0; i < tiersCount; i++) {
    let tier = await contract.tiers(poolId, i);
    tiers.push({
      buyInPrice: utils.formatEther(tier.buyInPrice),
      liquidationPrice: utils.formatUnits(tier.liquidationPrice, 0)
    });
  }

  return {
    poolId: utils.formatUnits(pool.poolId, 0),
    creatorFee: utils.formatEther(pool.creatorFee),
    contractFee: utils.formatEther(fee),
    startDateTime: formatDateTime(pool.startDateTime),
    lockPeriod: formatPeriod(pool.lockPeriod),
    stakingApy: utils.formatUnits(pool.stakingInfo.apy, 0),
    amountStaked: utils.formatEther(pool.stakingInfo.amountStaked),
    assetPair: {
      name: utils.parseBytes32String(pool.assetPair.name),
      lowestPrice: parseTokenUnits(utils.parseBytes32String(pool.assetPair.name), pool.assetPair.lowestPrice),
      referencePrice: parseTokenUnits(utils.parseBytes32String(pool.assetPair.name), pool.assetPair.referencePrice),
    },
    tiers: tiers,
    // TODO: pool.lockInExecuted
    locked: Date.now() / 1000 > ethers.utils.formatUnits(pool.startDateTime, 0),
    // TODO: pool.resolved
    resolved: Date.now() / 1000 > parseInt(ethers.utils.formatUnits(pool.startDateTime, 0)) + parseInt(ethers.utils.formatUnits(pool.lockPeriod, 0))
  };
}

async function getPoolSFTs(poolId) {
  try {
    const signer = provider.getSigner();
    const contract = getLiquibetContract(signer);
    const tokenContract = getTokenContract(await contract.token());
    const userAddress = await signer.getAddress();
    const sfts = [];

    for (let i = 0; i < 5; i++) {
      let tokenId = poolId * 10 + i;
      let amountTier = await tokenContract.balanceOf(userAddress, tokenId);
      if (amountTier > 0) {
        let sftDetails = getSftDetails(tokenId);
        sfts.push({
          tokenId: tokenId,
          tierId: i,
          amount: parseInt(utils.formatUnits(amountTier, 0)),
          imgSrc: sftDetails.imgSrc,
          status: sftDetails.status
        });
      }
    }
    
    return sfts;

  } catch (e) {
    toast.error("Error: " + e.message);
  }
}

async function getSft(tokenId) {
  const signer = provider.getSigner();
  const userAddress = await signer.getAddress();
  
  const contract = getLiquibetContract(signer);
  const tokenContract = getTokenContract(await contract.token());
  
  let amountTier = await tokenContract.balanceOf(userAddress, tokenId);
  
  if (amountTier === 0) {
    throw Error("User has no tokens of givven tokenId");
  }

  let sftDetails = getSftDetails(tokenId);
  
  return {
    tokenId: tokenId,
    tierId: tokenId % 10,
    amount: parseInt(utils.formatUnits(amountTier, 0)),
    imgSrc: sftDetails.imgSrc,
    status: sftDetails.status
  };
}

function getSftDetails(tokenId) {
  
  // TODO: get image urls from ipfs
  // const images = [];
  // for (let i = 0; i < 5; i++) {
  //   let metaData = await tokenContract.uri(i);
  //   let metaJson = await fetch(metaData)
  //     .then((res) => console.log(res))
  //     .then((out) => console.log("Checkout this JSON! ", out))
  //     .catch((err) => toast.error("Upload Error: " + err.message));
  //   console.log(metaJson);
  //   let imageSrc = metaJson.image;
  //   images.push(imageSrc);
  // }

  // No luck with IPFS, Poinata or NFTStorage :( so using Drive as backup for now
  if (tokenId === 11) {
    return {
      id: 1,
      imgSrc: "/components/backup_images/bonsai_2.jpg",
      poolId: 1,
      tierId: 1,
      poolStatus: "Open",
      status: "Health Level 3, OK!"
    };
  } else {
    
    return {
      id: 2,
      imgSrc: "/components/backup_images/bonsai_4.jpg",
      poolId: 1,
      tierId: 2,
      poolStatus: "Closed",
      status: "Health Level 4, looking happy!"
    };
  }
}

async function buySFT(poolId, tierId, price) {
  let contract = getLiquibetContract(provider.getSigner());
  
  const salePrice = utils.parseEther(price);
  const feePrice = await contract.fee();
  const totalPrice = salePrice.add(feePrice);
  let transaction = await contract.buyIn(poolId, tierId, 1, {
    value: totalPrice,
  });
  await transaction.wait();
}

export {
  getPools,
  getPoolIds,
  getPoolData,
  getPoolSFTs,
  getSftDetails,
  getSft,
  buySFT
};