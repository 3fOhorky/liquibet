// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Import this file to use console.log
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";

contract SFT is ERC1155, Ownable, ERC1155Burnable {
    uint256 public constant TIER_1 = 1; // 10% fluctuation
    uint256 public constant TIER_2 = 2; // 17% fluctuaton
    uint256 public constant TIER_3 = 3; // 25% fluctuation
    uint256 public constant TIER_4 = 4; // 35% fluctuation
    uint256 public constant TIER_5 = 5; // 50% fluctuation

    mapping(uint256 => string) private _uris;

    // id:i equals health_i
    string[] healthUrisIpfs = [
        "https://ipfs.io/ipfs/QmTppFVUw434kCXN393qAKzhZAvTiywB1hv1xKa1xQxPEo/0.json",
        "https://ipfs.io/ipfs/QmTppFVUw434kCXN393qAKzhZAvTiywB1hv1xKa1xQxPEo/1.json",
        "https://ipfs.io/ipfs/QmTppFVUw434kCXN393qAKzhZAvTiywB1hv1xKa1xQxPEo/2.json",
        "https://ipfs.io/ipfs/QmTppFVUw434kCXN393qAKzhZAvTiywB1hv1xKa1xQxPEo/3.json",
        "https://ipfs.io/ipfs/QmTppFVUw434kCXN393qAKzhZAvTiywB1hv1xKa1xQxPEo/4.json",
        "https://ipfs.io/ipfs/QmTppFVUw434kCXN393qAKzhZAvTiywB1hv1xKa1xQxPEo/5.json"
    ];

    constructor() ERC1155("") {
        _uris[1] = healthUrisIpfs[5];
        _uris[2] = healthUrisIpfs[5];
        _uris[3] = healthUrisIpfs[5];
        _uris[4] = healthUrisIpfs[5];
        _uris[5] = healthUrisIpfs[5];
    }

    function uri(uint256 id) public view override returns (string memory) {
        return _uris[id];
    }

    function buySFT(uint256 id) public {
        _mint(msg.sender, id, 1, "");
    }

    function setTokenUri(uint256 id, string memory newUri) public {
        _uris[id] = newUri;
    }
}

// // https://docs.chain.link/docs/chainlink-keepers/compatible-contracts/

// contract SFT is KeeperCompatibleInterface, ERC1155, Ownable, ChainlinkClient {
//     mapping(string => string) public weatherToWeatherURI;
//     mapping(uint256 => uint256) balanceOf; // Store liquidation winnings per NFT ID

//     // How should we represent both asset pool AND tier?

//     // The percentages are just starting points.  We can adjust.

//     uint256 public constant TIER_1 = 1; // 10% fluctuation
//     uint256 public constant TIER_2 = 2; // 17% fluctuaton
//     uint256 public constant TIER_3 = 3; // 25% fluctuation
//     uint256 public constant TIER_4 = 4; // 35% fluctuation
//     uint256 public constant TIER_5 = 5; // 50% fluctuation

//     constructor(
//         address _link,
//         address _priceFeed,
//         address _oracle,
//         bytes32 _jobId,
//         uint256 _fee
//     ) public ERC1155("LiquiBetSFT", "LIQ") {
//         if (_link == address(0)) {
//             setPublicChainlinkToken();
//         } else {
//             setChainlinkToken(_link);
//         }
//         // GOERLI ONLY address in aggregator
//         priceFeed = AggregatorV3Interface(
//             0xA39434A63A52E749F02807ae27335515BA4b07F7
//         );
//         priceFeedAddress = _priceFeed;
//         // Metadata with title, description, imageURI of Dynamic NFT
//         priceToImageURI[
//             "health_0"
//         ] = "https://ipfs.io/ipfs/QmPgbYqB2zmrMbdrGknFUueZEwvwEprHuncNdg5Rk9XBpz";
//         priceToImageURI[
//             "health_1"
//         ] = "https://ipfs.io/ipfs/QmVZGfDxHRyS7crtLoN1kQ1YXbMiZkHgxGh1pthjLgLATM";
//         priceToImageURI[
//             "health_2"
//         ] = "https://ipfs.io/ipfs/QmNcZzxdWnpw7Day8dptMfBrhkDbRtiuHkd1T6acXPDsqp";
//         priceToImageURI[
//             "health_3"
//         ] = "https://ipfs.io/ipfs/QmPwi7t3V363f6NyPEuYNG5qUDR7gJt3P5VqbGz9CNjw6q";
//         priceToImageURI[
//             "health_4"
//         ] = "https://ipfs.io/ipfs/QmToCCL4HDXC2Jrsggf9pPDB8F6vzGkKd5kZb1uP21Gphm";
//         priceToImageURI[
//             "health_5"
//         ] = "https://ipfs.io/ipfs/QmNgHWiGbo7Xu1U4WF1PJxmDGSVFM8FTtbXGLZtmRump8E";
//         oracle = _oracle;
//         jobId = _jobId;
//         fee = _fee;
//     }

//     // Prob won't need this
//     function checkUpkeep(
//         bytes calldata /* checkData */
//     )
//         external
//         view
//         override
//         returns (
//             bool upkeepNeeded,
//             bytes memory /* performData */
//         )
//     {
//         upkeepNeeded = (block.timestamp - lastTimeStamp) > interval;
//     }

//     function performUpkeep(
//         bytes calldata /* performData */
//     ) external override {
//         if ((block.timestamp - lastTimeStamp) > interval) {
//             lastTimeStamp = block.timestamp;
//             // CHECK ORACLE
//             // CALCULATE MOVING AVERAGE BASED ON (???) 12 spot checks from today?
//             // BASED ON TIER, UPDATE IMAGE
//             // MAKE SURE LIQUIDATED CONTRACTS DO NOT GET UN-LIQUIDATED
//         }
//     }

//     function setTokenHealth(
//         string memory health,
//         string memory tokenUri,
//         uint256 tokenId
//     ) private {
//         // Ref: https://github.com/kwsantiago/weather-nft/blob/main/contracts/Consensus2021ChainlinkWeatherNFT.sol
//     }
// }
