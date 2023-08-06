const Pet = require('../models/pet');
const User = require('../models/user');
const Location = require('../models/location');
const { ObjectId } = require('mongoose').Types;
const { cloudinary } = require('../cloudinary');
// const tt = require("@tomtom-international/web-sdk-services/dist/services-node.min.js");
const fns = require('date-fns');
const path = require('path');
const OneSignal = require('onesignal-node');
const { PDFDocument, StandardFonts } = require('pdf-lib');
const axios = require('axios');
const nodemailer = require('nodemailer');

module.exports.index = async (req, res) => {
  const ITEMS_PER_PAGE = 10; // Number of items to display per page
  const { page, limit, age, gender, breed, species, pattern, coat, size, petStatus, identifier, name, location, color, lostdate, maxDistance, userlongitude, userlatitude, selectedRegion } = req.query;

  // Translate the 'petsPage' key based on the user's selected language
  const selectOptions = req.__('selectOptions');
  const petsPage = req.__('petsPage');

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
    // select options (better to have them in one place on the server or not?)
    selectOptions,
    petsPage,
  });
};

module.exports.renderNewForm = (req, res) => {
  const reportPetPage = req.__('reportPetPage');
  const selectOptions = req.__('selectOptions');
  res.render('pets/new', {
    reportPetPage, // Pass the language data to the view
    selectOptions,
  });
};

module.exports.createPet = async (req, res, next) => {
  console.log('new pet: ', req.body.pet);
  // Set default value for date if it's omitted
  const currentDate = new Date().toISOString().split('T')[0];
  const lostdate = req.body.pet.lostdate || currentDate;

  if (req.body.pet.latitude === null || req.body.pet.longitude === null || req.body.pet.latitude === '' || req.body.pet.longitude === '' || isNaN(req.body.pet.latitude) || isNaN(req.body.pet.longitude)) {
    req.flash('error', 'Please enable geolocation to provide accurate pet location.');
    return res.redirect('/pets/new');
  }

  // if (req.body.pet.petStatus === null || req.body.pet.petStatus === '' || req.body.pet.species === null || req.body.pet.species === '') {
  //   req.flash('error', 'Please fill all necessary fields.');
  //   return res.redirect('/pets/new');
  // }
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

  // Prepare the unprocessed body for creating a new pet
  const unprocessedBody = {
    species: req.body.pet.species,
    breed: req.body.pet.breed,
    title: req.body.pet.title,
    identifier: req.body.pet.identifier,
    gender: req.body.pet.gender,
    location: {
      type: 'Point',
      coordinates: [req.body.pet.longitude, req.body.pet.latitude],
    },
    pattern: req.body.pet.pattern,
    color: colorsFormated,
    coat: req.body.pet.coat,
    size: req.body.pet.size,
    age: req.body.pet.age,
    petStatus: req.body.pet.petStatus,
    lostdate: lostdate,
    description: req.body.pet.description,
  };

  // create new pet in memory (its not saved yet)
  const pet = new Pet(unprocessedBody);

  // assign images to the new pet
  pet.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));

  // asign current user as author
  pet.author = req.user._id;

  // Save the pet to the database
  await pet.save();

  const user = req.user;
  // add new pet in user profile page
  user.userPets.push(pet._id);
  await user.save();

  const client = new OneSignal.Client(process.env.oneSignal_YOUR_APP_ID, process.env.oneSignal_YOUR_APP_AUTH_KEY);
  //console.log(client);
  //Send push notification to all subscribed users
  const oneSignalClient = new OneSignal.Client({
    app: {
      appId: process.env.oneSignal_YOUR_APP_ID,
      appAuthKey: process.env.oneSignal_YOUR_APP_AUTH_KEY,
    },
  });
  //   let userLat = 56.946285;
  // let userLng = 24.105078;
  //console.log(oneSignalClient);
  const notification = {
    contents: { en: `URGENT! ${pet.petStatus} ${pet.species} alert!` },
    included_segments: ['Subscribed Users'],
    // filters: [
    //   {
    //     field: 'location',
    //     radius: '20000', // Radius in meters
    //     lat: 56.946285, // Latitude
    //     long: 24.105078, // Longitude
    //   },
    //   // Add more filters as needed
    // ],
    // chrome_web_icon: {
    //   url: pet.images[0].url,
    // },
    // icon: pet.images[0].url,

    // attachments: {},
    web_url: `https://pawclix.cyclic.app/pets/${pet._id}`,
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

module.exports.showPet = async (req, res) => {
  try {
    // Retrieve the pet from the database
    // REPLACE petsshow to NEW petsShowPage
    const petsshow = req.__('petsshow');
    const petId = req.params.id;

    // Check if the user has already visited this pet's page
    const viewedPets = req.session.viewedPets || [];
    if (!viewedPets.includes(petId)) {
      // If the pet has not been viewed by the user, increment the view count
      viewedPets.push(petId);
      req.session.viewedPets = viewedPets;

      // Update the view count for the pet in the database
      // this should be fixed, because it updates whole pets object, but I want to show that its updated only if some pet attribute was updated
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
  const petsLocale = req.__('pets'); // Translate the 'pets' key based on the user's selected language
  // options must be taken from another object selecOptions ...
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
  console.log('updatePet');
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
  console.log('deletePet');
  const { id } = req.params;
  const user = req.user;
  // remove from userPets as well
  // it also should be removed from all users watchlist
  user.userPets = user.userPets.filter((item) => item !== id);
  await user.save();
  await Pet.findByIdAndDelete(id);
  req.flash('success', 'Successfully deleted pet');
  res.redirect('/pets');
};

module.exports.renderPdf = async (req, res) => {
  try {
    const { id } = req.params;

    // Convert petId to ObjectId
    // const objectId = ObjectId(petId);
    const pet = await Pet.findById(id);

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();

    // Add a new page
    const page = pdfDoc.addPage();

    // Set the font and font size
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 12;

    // Fetch the image data from the URL
    const imageUrl = `${pet.images[0].url}`;
    const imageResponse = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
    });

    // Embed the image in the PDF
    const image = await pdfDoc.embedJpg(imageResponse.data);

    // Calculate the desired dimensions of the image
    const maxWidth = 200;
    const maxHeight = 200;
    const imageWidth = image.width > maxWidth ? maxWidth : image.width;
    const imageHeight = (imageWidth / image.width) * image.height;

    // Draw the image on the page
    page.drawImage(image, {
      x: 50,
      y: page.getSize().height - imageHeight - 50,
      width: imageWidth,
      height: imageHeight,
    });

    // Define the positions of the text fields

    const positions = [
      { x: 50, y: 500, text: `${pet.petStatus} ${pet.species}` },
      { x: 50, y: 475, text: `Breed: ${pet.breed}` },
      { x: 50, y: 450, text: `Coat Pattern: ${pet.pattern}` },
      { x: 50, y: 425, text: `Pet's Gender: ${pet.gender}` },
      { x: 50, y: 400, text: `First Color: ${pet.firstcolor}` },
      { x: 50, y: 375, text: `Second Color: ${pet.secondcolor}` },
      { x: 50, y: 350, text: `Third Color: ${pet.thirdcolor}` },
      // { x: 50, y: 325, text: `Last Seen: ${pet.lostdate}` },
      { x: 50, y: 300, text: `Age: ${pet.age}` },
      { x: 50, y: 275, text: `Coat Type: ${pet.coat}` },
      { x: 50, y: 250, text: `Pet's Size: ${pet.size}` },
      { x: 50, y: 225, text: `Identifier: ${pet.identifier}` },
      // { x: 50, y: 200, text: `Description: ${pet.description}` },
    ];

    // Add text fields to the page
    positions.forEach(({ x, y, text }) => {
      page.drawText(text, {
        x,
        y,
        font,
        fontSize,
      });
    });

    // Serialize the PDF document to a Uint8Array
    const pdfBytes = await pdfDoc.save();

    // Set response headers for PDF download
    res.setHeader('Content-Disposition', 'attachment; filename="Document.pdf"');
    res.setHeader('Content-Type', 'application/pdf');

    // Send the PDF bytes as the response
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).send('Error generating PDF');
  }
};

module.exports.reportpost = async (req, res) => {
  try {
    const user = req.user;
    const email = user.email;
    const firstname = user.firstname;
    const lastname = user.lastname;
    const username = user.username;
    console.log(email, firstname, lastname, username, email);

    const { selectedReportpetId } = req.body;
    console.log(req.body);

    // Create a transporter using SMTP
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      port: 587,
      secure: false, // upgrade later with STARTTLS
      auth: {
        user: process.env.EMAIL_USERNAME, // Replace with your Gmail address
        pass: process.env.EMAIL_PASSWORD, // Replace with your Gmail password
      },
    });

    // Define the email options
    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: process.env.EMAIL_APP,
      subject: 'Reported post!',
      text: `From:\nFirst name: ${firstname}\nLast name: ${lastname}\nEmail: ${email}\nUsername: ${username}\nReported post ID: https://pawclix.cyclic.app/pets/${selectedReportpetId}`,
    };
    console.log(mailOptions);

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        req.flash('error', 'An error occurred while reporting post.');
      } else {
        console.log('Email sent:', info.response);
        req.flash('success', 'Thank you! Your report has been sent successfully.');
      }
      res.redirect('back');
    });
    console.log(transporter.sendMail);
  } catch (err) {
    console.error('Error sending feedback:', err);
    req.flash('error', 'An error occurred while reporting post.');
    res.redirect('back');
  }
};
