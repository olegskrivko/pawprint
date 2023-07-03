const Pet = require('../models/pet');
const Location = require('../models/location');
const { ObjectId } = require('mongoose').Types;
const { cloudinary } = require('../cloudinary');
// const tt = require("@tomtom-international/web-sdk-services/dist/services-node.min.js");
const fns = require('date-fns');
// const PDFDocument = require("pdfkit");
const path = require('path');
const axios = require('axios');
const fs = require('fs');
const OneSignal = require('onesignal-node');
// //console.log('OneSignal', OneSignal);
// const client = new OneSignal.Client(process.env.oneSignal_YOUR_APP_ID, process.env.oneSignal_YOUR_APP_AUTH_KEY);
// //console.log('client', client);
// const oneSignalClient = new OneSignal.Client({
//   app: {
//     appId: process.env.oneSignal_YOUR_APP_ID,
//     appAuthKey: process.env.oneSignal_YOUR_APP_AUTH_KEY,
//   },
// });
// console.log('oneSignalClient', oneSignalClient);
// const notification = {
//   contents: { en: 'New pet added! Check it out.' },
//   included_segments: ['Subscribed Users'],
// };
// console.log('notification', notification);
// client
//   .createNotification(notification)
//   .then((response) => {
//     console.log('Push notification sent successfully:', response.body);
//     // Additional code or actions after sending the notification
//   })
//   .catch((error) => {
//     console.log('Error sending push notification:', error);
//     // Handling the error, if any
//   });

// const { genderOptions } = require('../utils/userSelectOptions');
// const pdf = require("html-pdf");
// const puppeteer = require("puppeteer");

module.exports.index = async (req, res) => {
  console.log('INDEX pet');
  const ITEMS_PER_PAGE = 10; // Number of items to display per page
  const { page, limit, age, gender, breed, species, pattern, coat, size, petStatus, identifier, name, location, color, lostdate, maxDistance, userlongitude, userlatitude, selectedRegion } = req.query;

  const petsLocale = req.__('pets'); // Translate the 'home' key based on the user's selected language
  const statusOptions = req.__('statusOptions');
  const speciesOptions = req.__('speciesOptions');
  const genderOptions = req.__('genderOptions');
  const colorOptions = req.__('colorOptions');
  const ageOptions = req.__('ageOptions');
  const coatOptions = req.__('coatOptions');
  const sizeOptions = req.__('sizeOptions');
  const regionOptions = req.__('regionOptions');
  const breedsOptions = req.__('breedsOptions');

  const selectedLocation = await Location.findOne({ region: selectedRegion });

  let selectedPolygonCoordinates = [];

  if (selectedLocation && selectedLocation.geometry) {
    const selectedPolygon = selectedLocation.geometry.coordinates[0];
    selectedPolygonCoordinates = selectedPolygon.map((coord) => [coord[0], coord[1]]);
  }

  // Validate and sanitize input parameters
  const currentPage = parseInt(page) || 1;
  const limitPerPage = parseInt(limit) || ITEMS_PER_PAGE;

  // Define filter options for the search query
  const filterOptions = {};
  if (age) {
    filterOptions.age = { $regex: new RegExp(age, 'i') };
  }
  if (species) {
    filterOptions.species = { $regex: new RegExp(species, 'i') };
  }
  if (breed) {
    filterOptions.breed = { $regex: new RegExp(breed, 'i') };
  }
  if (pattern) {
    filterOptions.pattern = { $regex: new RegExp(pattern, 'i') };
  }
  if (breed) {
    filterOptions.breed = { $regex: new RegExp(breed, 'i') };
  }
  if (coat) {
    filterOptions.coat = { $regex: new RegExp(coat, 'i') };
  }
  if (size) {
    filterOptions.size = { $regex: new RegExp(size, 'i') };
  }
  if (petStatus) {
    filterOptions.petStatus = { $regex: new RegExp(petStatus, 'i') };
  }
  if (identifier) {
    filterOptions.identifier = { $eq: parseInt(identifier) };
  }
  if (name) {
    filterOptions.name = { $regex: new RegExp(name, 'i') };
  }
  if (gender) {
    filterOptions.gender = { $regex: new RegExp(gender, 'i') };
  }
  if (lostdate) {
    filterOptions.lostdate = { $gte: new Date(lostdate) };
  }
  if (userlongitude && userlatitude && maxDistance) {
    filterOptions.location = {
      $geoWithin: {
        $centerSphere: [[userlongitude, userlatitude], maxDistance / 6371], // Divide maxDistance by the radius of the Earth in kilometers (6371)
      },
    };
  }

  // Add the condition for search within the selected polygon
  if (selectedPolygonCoordinates.length > 0) {
    filterOptions.$and = [
      {
        location: {
          $geoWithin: {
            $geometry: {
              type: 'Polygon',
              coordinates: [selectedPolygonCoordinates],
            },
          },
        },
      },
    ];
  }

  // later make that it checks in first, second and third color. so need to save colors in one field as array
  if (color) {
    filterOptions.color = { $regex: new RegExp(color, 'i') };
  }

  // Retrieve total number of pets for pagination logic
  const totalPets = await Pet.countDocuments(filterOptions);

  // Calculate starting index based on current page and limit
  const startIndex = (currentPage - 1) * limitPerPage;

  // Retrieve pets for current page with applied filter options
  const pets = await Pet.find(filterOptions).skip(startIndex).limit(limitPerPage);

  // Calculate total number of pages based on total pets and limit per page
  const totalPages = Math.ceil(totalPets / limitPerPage);
  // Render response with pagination data
  res.render('pets/index', {
    pets,
    currentPage,
    limitPerPage,
    totalPets,
    totalPages,
    age,
    gender,
    breed,
    species,
    pattern,
    coat,
    size,
    petStatus,
    identifier,
    name,
    location,
    color,
    lostdate,
    selectedPolygonCoordinates,
    // select options (better to have them in one place on the server)
    petsLocale, // Pass the language data to the view
    statusOptions,
    speciesOptions,
    genderOptions,
    colorOptions,
    ageOptions,
    coatOptions,
    sizeOptions,
    regionOptions,
    breedsOptions,
  });
};

module.exports.renderNewForm = (req, res) => {
  console.log('new form pet');
  const petsLocale = req.__('pets'); // Translate the 'home' key based on the user's selected language
  const statusOptions = req.__('statusOptions');
  const speciesOptions = req.__('speciesOptions');
  const genderOptions = req.__('genderOptions');
  const colorOptions = req.__('colorOptions');
  const ageOptions = req.__('ageOptions');
  const coatOptions = req.__('coatOptions');
  const coatPatternOptions = req.__('coatPatternOptions');
  const sizeOptions = req.__('sizeOptions');
  const regionOptions = req.__('regionOptions');
  const breedsOptions = req.__('breedsOptions');
  res.render('pets/new', {
    // select options (better to have them in one place on the server)
    petsLocale, // Pass the language data to the view
    statusOptions,
    speciesOptions,
    genderOptions,
    colorOptions,
    ageOptions,
    coatOptions,
    coatPatternOptions,
    sizeOptions,
    regionOptions,
    breedsOptions,
  });
};

// module.exports.renderMissingForm = (req, res) => {
//   // Retrieve the language preference and data from the response locals
//   const data = req.data; // Language data is available from the middleware
//   res.render('pets/missing', { data });
// };

// module.exports.renderFoundForm = (req, res) => {
//   // Retrieve the language preference and data from the response locals
//   const data = req.data; // Language data is available from the middleware
//   res.render('pets/found', { data });
// };

module.exports.createPet = async (req, res, next) => {
  console.log('create pete');
  let colorsFormated = [];

  // Check and format the colors from the request body
  if (req.body.pet.firstcolor) {
    colorsFormated.push(req.body.pet.firstcolor);
  }
  if (req.body.pet.secondcolor) {
    colorsFormated.push(req.body.pet.secondcolor);
  }
  if (req.body.pet.thirdcolor) {
    colorsFormated.push(req.body.pet.thirdcolor);
  }

  console.log(req.body.pet.latitude);
  console.log(req.body.pet.longitude);

  // Prepare the unprocessed body for creating a new pet
  const unprocessedBody = {
    species: req.body.pet.species,
    breed: req.body.pet.breed,
    title: req.body.pet.title,
    identifier: req.body.pet.identifier,
    gender: req.body.pet.gender,
    location: {
      type: 'Point',
      coordinates: [parseFloat(req.body.pet.longitude), parseFloat(req.body.pet.latitude)],
    },
    latitude: parseFloat(req.body.pet.latitude),
    longitude: parseFloat(req.body.pet.longitude),
    pattern: req.body.pet.pattern,
    color: colorsFormated,
    coat: req.body.pet.coat,
    size: req.body.pet.size,
    age: req.body.pet.age,
    petStatus: req.body.pet.petStatus,
    lostdate: req.body.pet.lostdate,
    description: req.body.pet.description,
  };

  const pet = new Pet(unprocessedBody);
  console.log(pet);

  // Assign images to the new pet
  pet.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));

  pet.author = req.user._id;

  // Save the pet to the database
  await pet.save();

  //console.log(pet);
  const client = new OneSignal.Client(process.env.oneSignal_YOUR_APP_ID, process.env.oneSignal_YOUR_APP_AUTH_KEY);
  console.log(client);
  //Send push notification to all subscribed users
  const oneSignalClient = new OneSignal.Client({
    app: {
      appId: process.env.oneSignal_YOUR_APP_ID,
      appAuthKey: process.env.oneSignal_YOUR_APP_AUTH_KEY,
    },
  });
  console.log(oneSignalClient);
  const notification = {
    contents: { en: 'New pet added! Check it out.' },
    included_segments: ['Subscribed Users'],
  };
  console.log(notification);
  client
    .createNotification(notification)
    .then((response) => {
      console.log('Push notification sent successfully:', response.body);
      // Additional code or actions after sending the notification
    })
    .catch((error) => {
      console.log('Error sending push notification:', error);
      // Handling the error, if any
    });

  req.flash('success', 'Successfully created a new pet');
  res.redirect(`/pets/${pet._id}`);
};

// module.exports.showPet = async (req, res) => {
//   try {
//     // Retrieve the pet from the database
//     const petsshow = req.__('petsshow'); // Translate the 'home' key based on the user's selected language
//     // Find the pet with the provided ID and populate its comments and author

//     const pet = await Pet.findById(req.params.id)
//       .populate({
//         path: 'comments',
//         populate: {
//           path: 'author',
//         },
//       })
//       .populate('author');

//     // Check if the pet is found
//     if (!pet) {
//       req.flash('error', 'Cannot find that pet!');
//       return res.redirect('/pets');
//     }

//     // Increment the view count for the pet
//     pet.views += 1;
//     await pet.save();

//     // Format the creation, update, and lost dates in words
//     const createDateInWords = fns.formatDistanceToNow(new Date(pet.createdAt), {
//       addSuffix: true,
//     });
//     const updateDateInWords = fns.formatDistanceToNow(new Date(pet.updatedAt), {
//       addSuffix: true,
//     });
//     const lostDateInWords = fns.formatDistanceToNow(new Date(pet.lostdate), {
//       addSuffix: true,
//     });

//     // Render the pet post page with the updated view count
//     res.render('pets/show', { pet: pet, createDateInWords, updateDateInWords, lostDateInWords, petsshow });
//   } catch (error) {
//     // Handle any errors that occur
//     console.error('Error retrieving pet:', error);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }

//   // Render the pet show page and pass the pet object and date information
//   // res.render('pets/show', {
//   //   pet: pet,
//   //   createDateInWords,
//   //   updateDateInWords,
//   //   lostDateInWords,
//   //   petsshow, // Pass the language data to the view,
//   // });
// };

module.exports.showPet = async (req, res) => {
  console.log('show pete');
  try {
    // Retrieve the pet from the database
    const petsshow = req.__('petsshow');
    const petId = req.params.id;

    // Check if the user has already visited this pet's page
    const viewedPets = req.session.viewedPets || [];
    if (!viewedPets.includes(petId)) {
      // If the pet has not been viewed by the user, increment the view count
      viewedPets.push(petId);
      req.session.viewedPets = viewedPets;

      // Update the view count for the pet in the database
      await Pet.findByIdAndUpdate(petId, { $inc: { views: 1 } });
    }

    // Find the pet with the provided ID and populate its comments and author
    const pet = await Pet.findById(petId)
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
        },
      })
      .populate('author');

    // Check if the pet is found
    if (!pet) {
      req.flash('error', 'Cannot find that pet!');
      return res.redirect('/pets');
    }

    // Format the creation, update, and lost dates in words
    const createDateInWords = fns.formatDistanceToNow(new Date(pet.createdAt), {
      addSuffix: true,
    });
    const updateDateInWords = fns.formatDistanceToNow(new Date(pet.updatedAt), {
      addSuffix: true,
    });
    const lostDateInWords = fns.formatDistanceToNow(new Date(pet.lostdate), {
      addSuffix: true,
    });

    // Render the pet post page with the updated view count
    res.render('pets/show', {
      pet: pet,
      createDateInWords,
      updateDateInWords,
      lostDateInWords,
      petsshow,
    });
  } catch (error) {
    // Handle any errors that occur
    console.error('Error retrieving pet:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports.renderEditForm = async (req, res) => {
  // Retrieve the language preference and data from the response locals
  const petsLocale = req.__('pets'); // Translate the 'home' key based on the user's selected language
  const statusOptions = req.__('statusOptions');
  const speciesOptions = req.__('speciesOptions');
  const genderOptions = req.__('genderOptions');
  const colorOptions = req.__('colorOptions');
  const ageOptions = req.__('ageOptions');
  const coatOptions = req.__('coatOptions');
  const sizeOptions = req.__('sizeOptions');
  const regionOptions = req.__('regionOptions');
  const breedsOptions = req.__('breedsOptions');
  const coatPatternOptions = req.__('coatPatternOptions');

  const { id } = req.params;
  const pet = await Pet.findById(id);
  if (!pet) {
    req.flash('error', 'Cannot find that pet!');
    return res.redirect('/pets');
  }
  res.render('pets/edit', {
    pet,
    petsLocale, // Pass the language data to the view
    statusOptions,
    speciesOptions,
    genderOptions,
    colorOptions,
    ageOptions,
    coatOptions,
    sizeOptions,
    regionOptions,
    breedsOptions,
    coatPatternOptions,
  });
};

module.exports.updatePet = async (req, res) => {
  const { id } = req.params;
  const pet = await Pet.findByIdAndUpdate(id, {
    ...req.body.pet,
  });
  const imgs = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  pet.images.push(...imgs);
  await pet.save();
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await pet.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
  }
  req.flash('success', 'Successfully updated pet!');
  res.redirect(`/pets/${pet._id}`);
};

module.exports.deletePet = async (req, res) => {
  const { id } = req.params;
  await Pet.findByIdAndDelete(id);
  req.flash('success', 'Successfully deleted pet');
  res.redirect('/pets');
};

// Function to download the image from Cloudinary
// async function downloadImage(url, imagePath) {
//   const writer = fs.createWriteStream(imagePath);

//   const response = await axios({
//     url,
//     method: "GET",
//     responseType: "stream",
//   });

//   response.data.pipe(writer);

//   return new Promise((resolve, reject) => {
//     writer.on("finish", resolve);
//     writer.on("error", reject);
//   });
// }

// function buildPDF(content, imagePath) {
//   const doc = new PDFDocument();
//   doc.text(content);

//   // Add image to the PDF
//   doc.image(imagePath, {
//     fit: [350, 350], // Set the width and height of the image
//     align: "center", // Align the image to the center
//   });

//   return doc;
// }

// Route for generating and downloading the PDF
// module.exports.renderPdf = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const pet = await Pet.findById(id);

//     if (!pet) {
//       req.flash("error", "Cannot find that pet!");
//       return res.redirect("/pets");
//     }

//     const myTemplate = `
//       Name: ${pet.title}
//       Owner: ${pet.owner}
//       Species: ${pet.species}
//       Breed: ${pet.breed}
//       Pattern: ${pet.pattern}
//       Age: ${pet.age}
//       Coat: ${pet.coat}
//       Size: ${pet.size}
//       Status: ${pet.petStatus}

//       Description: ${pet.description}
//     `;

//     // Modify the Cloudinary image URL to the correct location
//     const imageUrl = pet.images[0].url;
//     const imagePath = path.join(__dirname, "../public/images/pet-image.jpg");

//     await downloadImage(imageUrl, imagePath); // Download the image from Cloudinary

//     const pdfDoc = buildPDF(myTemplate, imagePath); // Generate the PDF document

//     res.set({
//       "Content-Type": "application/pdf",
//       "Content-Disposition": "attachment;filename=petinfo.pdf",
//     });

//     pdfDoc.pipe(res); // Pipe the PDF document to the response
//     pdfDoc.end();
//   } catch (error) {
//     console.error(error);
//     req.flash("error", "Failed to generate PDF");
//     res.redirect("/pets");
//   }
// };

// Function to download an image from a URL and save it to the specified path
// const downloadImage = async (imageUrl, imagePath) => {
//   const response = await axios({
//     method: "GET",
//     url: imageUrl,
//     responseType: "stream",
//   });

//   response.data.pipe(fs.createWriteStream(imagePath));

//   return new Promise((resolve, reject) => {
//     response.data.on("end", () => resolve());
//     response.data.on("error", (error) => reject(error));
//   });
// };

// module.exports.renderPdf = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const pet = await Pet.findById(id);

//     if (!pet) {
//       req.flash("error", "Cannot find that pet!");
//       return res.redirect("/pets");
//     }

//     const imageUrl = pet.images[0].url; // Cloudinary image URL
//     const imagePath = path.join(__dirname, "../public/images/pet-image.jpg");

//     await downloadImage(imageUrl, imagePath); // Download the image from Cloudinary

//     const myTemplate = `
//       <!DOCTYPE html>
//       <html>
//         <head>
//           <meta charset="utf-8" />
//           <title>Pet Information</title>
//           <style>
//             body {
//               font-family: Arial, sans-serif;
//               margin: 0;
//               padding: 20px;
//             }
//             h1 {
//               font-size: 24px;
//               margin-bottom: 20px;
//               text-align: center;
//             }
//             p {
//               margin: 5px 0;
//             }
//           </style>
//         </head>
//         <body>
//           <h1>Pet Information</h1>
//           <p><strong>Name:</strong> ${pet.title}</p>
//           <p><strong>Species:</strong> ${pet.species}</p>
//           <p><strong>Breed:</strong> ${pet.breed}</p>
//           <p><strong>Pattern:</strong> ${pet.pattern}</p>
//           <p><strong>Age:</strong> ${pet.age}</p>
//           <p><strong>Coat:</strong> ${pet.coat}</p>
//           <p><strong>Size:</strong> ${pet.size}</p>
//           <p><strong>Status:</strong> ${pet.petStatus}</p>
//           <p><strong>Description:</strong> ${pet.description}</p>
//           <img src="${imageUrl}" alt="Pet Image" style="width: 800px; height: 700px; object-fit: cover;" />
//         </body>
//       </html>
//     `;

//     // Create the Puppeteer browser instance
//     const browser = await puppeteer.launch();

//     // Generate PDF using html-pdf package with Puppeteer options
//     pdf
//       .create(myTemplate, { puppeteer: browser })
//       .toBuffer(async (err, buffer) => {
//         if (err) {
//           console.error(err);
//           req.flash("error", "Failed to generate PDF");
//           return res.redirect("/pets");
//         }

//         res.set({
//           "Content-Type": "application/pdf",
//           "Content-Disposition": "attachment;filename=petinfo.pdf",
//         });

//         res.send(buffer); // Send the PDF buffer as the response

//         // Close the Puppeteer browser instance
//         await browser.close();
//       });
//   } catch (error) {
//     console.error(error);
//     req.flash("error", "Failed to generate PDF");
//     res.redirect("/pets");
//   }
// };
