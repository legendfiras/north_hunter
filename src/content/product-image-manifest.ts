/**
 * Internal asset manifest. Not rendered on the site.
 * Public availability is not permission for commercial reuse.
 * Every downloaded file is unverified and must be reviewed before publication.
 */

export type ImagePermission = "unverified";

export type ProductImageRecord = {
  productId: string;
  localPath: string | null;
  productPage: string;
  imageUrl: string | null;
  permission: ImagePermission;
  displayed: boolean;
  note: string;
};

export const productImageManifest: ProductImageRecord[] = [
  {
    productId: "vortex-diamondback-hd-10x42",
    localPath: "/images/products/vortex-diamondback-hd-10x42.jpg",
    productPage: "https://vortexoptics.com/vortex-diamondback-hd-10x42-binocular.html",
    imageUrl: "https://vortexoptics.com/media/catalog/product/v/t/vtx_bin_diamondback2_42_f_w.jpg",
    permission: "unverified",
    displayed: true,
    note: "Front gallery photo on the Diamondback HD 10x42 page. The USA 250 navy colorway on the same page was not used.",
  },
  {
    productId: "nikon-prostaff-p7-8x42",
    localPath: "/images/products/nikon-prostaff-p7-8x42.jpg",
    productPage: "https://imaging.nikon.com/sport-optics/lineup/binoculars/prostaff/prostaff_p7_x42/",
    imageUrl: "https://imaging.nikon.com/sport-optics/lineup/binoculars/prostaff/prostaff_p7_x42/img/pic_001.jpg",
    permission: "unverified",
    displayed: true,
    note: "Page labels this file as PROSTAFF P7 8x42. pic_002.jpg is the 10x42 and was not used.",
  },
  {
    productId: "streamlight-protac-hl-x",
    localPath: "/images/products/streamlight-protac-hl-x.jpg",
    productPage: "https://www.streamlight.com/products/detail/protac-hl-x",
    imageUrl: "https://www.streamlight.com/images/default-source/product-large-images/protac-hl-x/protac-hl-x_1.jpg?Status=Master",
    permission: "unverified",
    displayed: true,
    note: "Body is marked ProTac HL-X. The NTOA badge is part of the source file.",
  },
  {
    productId: "black-diamond-spot-400-r",
    localPath: "/images/products/black-diamond-spot-400-r-graphite.webp",
    productPage: "https://blackdiamondequipment.com/products/spot-400-r-rechargeable-headlamp",
    imageUrl: "https://blackdiamondequipment.com/cdn/shop/files/620676_0004_Spot_400_R_Headlamp_Graphite_01.jpg?v=1748464042&width=1600",
    permission: "unverified",
    displayed: true,
    note: "JSON-LD product image. Colorway Graphite. The catalog name includes Graphite.",
  },
  {
    productId: "biolite-alpenglow-500",
    localPath: "/images/products/biolite-alpenglow-500.png",
    productPage: "https://www.bioliteenergy.com/products/alpenglow-500",
    imageUrl: "https://www.bioliteenergy.com/cdn/shop/files/alpenglow-500lnb0100-749729.png?v=1711826915&width=1600",
    permission: "unverified",
    displayed: true,
    note: "Transparent packshot from Product.image. A lifestyle frame with promotional text was not used.",
  },
  {
    productId: "biolite-alpenglow-mini",
    localPath: "/images/products/biolite-alpenglow-mini.png",
    productPage: "https://www.bioliteenergy.com/products/alpenglow-mini",
    imageUrl: "https://www.bioliteenergy.com/cdn/shop/files/alpenglow-minilnc0103-485912.png?v=1711827036&width=1600",
    permission: "unverified",
    displayed: true,
    note: "Transparent packshot from Product.image. Red and white colorway files were not used.",
  },
  {
    productId: "suunto-a-10-nh",
    localPath: "/images/products/suunto-a-10-nh.webp",
    productPage: "https://us.suunto.com/products/suunto-a-10-nh-compass",
    imageUrl: "https://us.suunto.com/cdn/shop/files/SS021237000_A-10_NH_COMPASS_FRONT_f6ed9b85-665d-48c1-8e49-a03bcb4749b9.png?v=1778238901",
    permission: "unverified",
    displayed: true,
    note: "JSON-LD image named A-10 NH front. File has transparency. The compass is marked SUUNTO A-10.",
  },
  {
    productId: "osprey-talon-22",
    localPath: null,
    productPage: "https://www.osprey.com/eu/osprey-talon-22-s25",
    imageUrl: null,
    permission: "unverified",
    displayed: false,
    note: "EU, UK, and a later GB retry returned HTTP 403 with a Cloudflare challenge. Not bypassed. Product removed from the catalog.",
  },
  {
    productId: "osprey-daylite",
    localPath: null,
    productPage: "https://www.osprey.com/daylite-daylites21-794?size=O%2FS&color=Tunnel+Vision+Grey",
    imageUrl: null,
    permission: "unverified",
    displayed: false,
    note: "Product page returned HTTP 403 with a Cloudflare challenge, including a later retry. Not bypassed. Product removed from the catalog.",
  },
  {
    productId: "helikon-cpu-shirt",
    localPath: null,
    productPage: "https://helikon-tex.com/en/cpu-shirt-polycotton-ripstopen.html",
    imageUrl: null,
    permission: "unverified",
    displayed: false,
    note: "helikon-tex.com returned HTTP 429 with a Cloudflare challenge, including a later retry. Not bypassed. Product removed from the catalog.",
  },
  {
    productId: "helikon-cpu-pants",
    localPath: null,
    productPage: "https://www.helikon-tex.com/en_usd/sp-cpu-pr-cpu-pants-polycotton-ripstop.html",
    imageUrl: null,
    permission: "unverified",
    displayed: false,
    note: "Same host returned HTTP 429. Not requested again after the rate limit. Product removed from the catalog.",
  },
  {
    productId: "merrell-moab-3-mid-waterproof",
    localPath: "/images/products/merrell-moab-3-mid-black-beluga.jpg",
    productPage: "https://www.merrell.com/US/en/moab-3-mid-waterproof/52470M.html",
    imageUrl: "https://thekit.wolverineworldwide.com/match/media_lookup/MRLM-J00003598-012826-F26-000/?preset=dw-hi-res",
    permission: "unverified",
    displayed: true,
    note: "Primary product image. Page alt text is Moab 3 Mid Waterproof, Black/Beluga.",
  },
  {
    productId: "sea-to-summit-ultra-sil-nano-poncho",
    localPath: "/images/products/sea-to-summit-ultra-sil-nano-poncho-lime.webp",
    productPage: "https://seatosummit.eu/en-lu/products/ultra-sil-nano-poncho",
    imageUrl: "https://seatosummit.eu/cdn/shop/products/UltraSil_Nano_Poncho___lime___in_use_2_03841393-0d2f-4c13-8024-a937ecbec6c7.jpg?v=1650960268&width=1600",
    permission: "unverified",
    displayed: true,
    note: "Product JSON-LD image. Lime colorway, worn. The catalog name includes Lime.",
  },
  {
    productId: "mechanix-original-black",
    localPath: "/images/products/mechanix-original-black.jpg",
    productPage: "https://www.mechanix.com/ca-en/all-work-gloves/MG-05.html",
    imageUrl: "https://res.cloudinary.com/hdtsjhzsw/image/upload/s--k0ud-0Gn--/w_902,h_1024,c_lpad,b_white,f_jpg/b4e3bd8abbd83575339a508ede8692959f14bf94.jpg",
    permission: "unverified",
    displayed: true,
    note: "US SKU page DTC-MG-05-013 returned HTTP 404. Photo is The Original, black, from the official Mechanix Canada page for that model.",
  },
  {
    productId: "outdoor-research-seattle-rain-hat",
    localPath: "/images/products/outdoor-research-seattle-rain-hat.webp",
    productPage: "https://www.outdoorresearch.com/products/seattle-rain-hat-322290",
    imageUrl: "https://www.outdoorresearch.com/cdn/shop/files/3222903011E1.png?v=1770145761&width=1600",
    permission: "unverified",
    displayed: true,
    note: "Style 322290, color code 3011. Page variant name is Ascent Blue/Skyline.",
  },
  {
    productId: "helinox-chair-one",
    localPath: "/images/products/helinox-chair-one-black.jpg",
    productPage: "https://helinox.com/products/chair-one",
    imageUrl: "https://cdn.shopify.com/s/files/1/0039/1367/8918/files/helinox_chair_one_black_hero_ea8a12ef-f947-4971-8da8-60b6122140c3.jpg?v=1773390628",
    permission: "unverified",
    displayed: true,
    note: "JSON-LD image for Chair One, black. Not Chair One (re).",
  },
  {
    productId: "msr-hubba-hubba-lt-2",
    localPath: "/images/products/msr-hubba-hubba-lt-2.webp",
    productPage: "https://www.msrgear.com/tents/backpacking-tents/hubba-hubba-lt-2-person-backpacking-tent/13937.html",
    imageUrl: "https://cascadedesigns.com/cdn/shop/files/13937_msr_hubba_LT_2P_body_angled.jpg?v=1725608857&width=1600",
    permission: "unverified",
    displayed: true,
    note: "JSON-LD image for item 13937. Fly is labeled Hubba Hubba LT 2.",
  },
  {
    productId: "sea-to-summit-trek-down-minus-1",
    localPath: "/images/products/sea-to-summit-trek-down-minus-1c.webp",
    productPage: "https://seatosummit.com.au/products/trek-down-sleeping-bag",
    imageUrl: "https://seatosummit.com.au/cdn/shop/files/TrekDownSleepingBag-1C-30FRegular_ASL041172-050201_PRIMARY_WBG_676987f9-54ef-49ce-8782-f07df170fec0.jpg?v=1714448121&width=1600",
    permission: "unverified",
    displayed: true,
    note: "Primary image filename is the −1°C / 30°F regular bag. A −9°C image on the same page was not used.",
  },
  {
    productId: "hydro-flask-21-oz",
    localPath: null,
    productPage: "https://www.hydroflask.com/21-oz-standard-mouth",
    imageUrl: null,
    permission: "unverified",
    displayed: false,
    note: "US page returned HTTP 403 with a Cloudflare challenge, including a later retry. The AU product URL redirected to the store homepage. Not bypassed. Product removed from the catalog.",
  },
  {
    productId: "amk-ultralight-watertight-7",
    localPath: "/images/products/adventure-medical-kits-ultralight-7.webp",
    productPage: "https://adventuremedicalkits.com/products/ultralight-watertight-medical-kit-7",
    imageUrl: "https://adventuremedicalkits.com/cdn/shop/files/Shopify_-_Product_Images_19.jpg?v=1764781824&width=1600",
    permission: "unverified",
    displayed: true,
    note: "JSON-LD image. The pouch is printed Ultralight/Watertight Medical Kit .7.",
  },
];
