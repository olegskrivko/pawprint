const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "PetFinder",
    allowedFormats: ["jpeg", "png", "jpg"],
    transformation: {
      height: 700,
      width: 800,
      gravity: "auto",
      crop: "fill",
    },
  },
});

const logostorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "servicelogo",
    allowedFormats: ["jpeg", "png", "jpg"],
    transformation: {
      height: 320,
      width: 320,
      gravity: "auto",
      crop: "fill",
    },
  },
});

const userAvatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "useravatar",
    allowedFormats: ["jpeg", "png", "jpg"],
    transformation: {
      height: 320,
      width: 320,
      gravity: "auto",
      crop: "fill",
    },
  },
});

module.exports = {
  cloudinary,
  storage,
  logostorage,
  userAvatarStorage,
};
