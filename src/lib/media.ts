/**
 * Site photography, all from Unsplash (Unsplash License: free for commercial use,
 * no attribution required). Sources are listed in public/media/photos/credits.json.
 * Shown black & white until hovered, to keep the site in the brand colours.
 */
export interface Photo {
  src: string;
  alt: string;
}

const p = (file: string, alt: string): Photo => ({ src: `/media/photos/${file}.jpg`, alt });

export const PHOTOS = {
  studioCrew: p("studio-crew", "Two young printers at work in a bright studio"),
  teeReveal: p("tee-reveal", "A printer holding up a freshly printed white T-shirt"),
  heatPress: p("heat-press", "A yellow T-shirt laid out on a heat press"),
  inkRed: p("ink-red", "Red ink pulled across a screen-printing frame"),
  inkBuckets: p("ink-buckets", "Shelves of bright ink tubs in a print workshop"),
  squeegees: p("squeegees", "Colourful squeegees lined up on a shelf"),
  screenPink: p("screen-pink", "Hands lifting a printing screen loaded with pink ink"),
  inkJars: p("ink-jars", "Open jars of pink and blue printing ink"),
  rainbowPrint: p("rainbow-print", "A rainbow gradient being screen-printed by hand"),
  inkRoller: p("ink-roller", "A roller spreading thick black ink across paper"),
  swatches: p("swatches", "A colour swatch book fanned out"),
  teeGraphic: p("tee-graphic", "A T-shirt with a bold, colourful printed graphic"),
  teeLogo: p("tee-logo", "A white T-shirt with a small printed logo"),
  capPool: p("cap-pool", "A printed cap floating in a swimming pool"),
  hoodieYellow: p("hoodie-yellow", "The back of a yellow hoodie with a printed graphic"),
  teeRack: p("tee-rack", "Printed T-shirts hanging on a rail"),
  stickersYellow: p("stickers-yellow", "Illustrated stickers on a yellow background"),
  stickerWall: p("sticker-wall", "A wall covered edge to edge in stickers"),
  helloSticker: p("hello-sticker", "A hand holding a smiley Hello sticker"),
  mugGiftbox: p("mug-giftbox", "A printed mug nestled in a green gift box"),
  bagsLine: p("bags-line", "Printed kraft bags pegged on a line"),
  boxTape: p("box-tape", "A kraft box sealed with orange tape"),
  giftHandover: p("gift-handover", "Two pairs of hands passing a wrapped gift"),
  giftRibbon: p("gift-ribbon", "A kraft-wrapped gift tied with pink ribbon"),
  boxRug: p("box-rug", "A parcel on a colourful rug in the sun"),
  mugHeart: p("mug-heart", "A white mug printed with a black heart on yellow"),
  mugHeartHandle: p("mug-heart-handle", "A white mug with a red heart-shaped handle"),
  mugHands: p("mug-hands", "Hands holding a mug printed all over with flowers"),
  tumblerPink: p("tumbler-pink", "A pink tumbler beside sliced oranges"),
  bottlesPool: p("bottles-pool", "Yellow and teal water bottles by a pool"),
  keyringSneaker: p("keyring-sneaker", "A mini sneaker keyring on a bunch of keys"),
  keyringsClear: p("keyrings-clear", "Clear acrylic keyrings catching the light"),
  portrait: p("portrait", "A designer in glasses and a black blazer"),
  polaroidWall: p("polaroid-wall", "A wall of instant photo prints"),
  polaroids: p("polaroids", "Colourful instant photos laid out on black"),
  stickerPrinter: p("sticker-printer", "A printer feeding out a sheet of butterfly stickers"),
  paperCutter: p("paper-cutter", "A paper trimmer squaring up a printed sheet"),
  cardShelf: p("card-shelf", "Shelves of colourful printed cards"),
  crewTees: p("crew-tees", "Three friends in custom-printed shirts"),
  hoodieAmanzi: p("hoodie-amanzi", "A man in a black hoodie printed in isiZulu"),
  deskSetup: p("desk-setup", "A warm desk setup on a full-size desk mat"),
} satisfies Record<string, Photo>;

/** Photos shown beside each link in the full-screen menu. */
export const MENU_PHOTOS = {
  studio: PHOTOS.portrait,
  products: PHOTOS.tumblerPink,
  process: PHOTOS.screenPink,
  services: PHOTOS.swatches,
  contact: PHOTOS.helloSticker,
};
