const ServiceProvider = require('../models/serviceProvider');
const Service = require('../models/service');
const { cloudinary } = require('../cloudinary');
const i18n = require('i18n');

module.exports.renderAddServiceForm = (req, res) => {
  // Retrieve the language preference and data from the response locals
  res.render('services/new');
};

module.exports.index = async (req, res) => {
  try {
    const servicesPage = req.__('servicesPage'); // Translate the 'servicesPage' key based on the user's selected language
    const translationMap = req.__('services');
    const services = await Service.find();

    const translatedServices = services.map((service) => {
      const translatedName = translationMap[service.slug] || service.name;
      return { ...service._doc, translatedName };
    });
    res.render('services/index', { services: translatedServices, servicesPage });
  } catch (error) {
    console.error('Error retrieving services:', error);
    req.flash('error', 'Failed to retrieve services.');
    res.redirect('/'); // Redirect to an appropriate error page or fallback route
  }
};

module.exports.showService = async (req, res) => {
  try {
    const translationMap = req.__('servicesDescription');
    const slug = req.params.slug;
    const service = await Service.findOne({ slug }).populate('serviceProviders');
    // console.log('service slug', service.slug);
    // console.log('result', translationMap[service.slug]);
    const serviceTitle = translationMap[service.slug];
    if (!service) {
      req.flash('error', 'Cannot find that service!');
      return res.redirect('/services');
    }

    res.render('services/show', { service, serviceTitle });
  } catch (error) {
    console.error('Error retrieving service:', error);
    req.flash('error', 'Failed to retrieve service.');
    res.redirect('/services'); // Redirect to an appropriate error page or fallback route
  }
};

module.exports.addNewService = async (req, res) => {
  try {
    const service = await Service.findOne({ slug: req.body.serviceName });

    if (req.body.user.latitude === null || req.body.user.longitude === null || req.body.user.latitude === '' || req.body.user.longitude === '' || isNaN(req.body.user.latitude) || isNaN(req.body.user.longitude)) {
      req.flash('error', 'Please enable geolocation to provide service location.');
      return res.redirect('/pets/new');
    }

    const userCoords = req.body.user;

    const image = req.file;
    const unprocessedBody = {
      name: req.body.name,
      serviceProviderType: req.body.serviceProviderType,
      serviceName: req.body.serviceName,
      website: req.body.website,
      phonecode: req.body.phonecode,
      phone: req.body.phone,
      email: req.body.email,
      location: {
        type: 'Point',
        coordinates: [userCoords.longitude, userCoords.latitude],
      },
      description: req.body.description,
      socialMedia: {
        facebook: req.body.facebook || '', // Provide a default value if not provided
        instagram: req.body.instagram || '', // Provide a default value if not provided
      },
    };

    if (image) {
      const cloudinaryRes = await cloudinary.uploader.upload(image.path);
      const serviceProvider = await ServiceProvider.create({
        ...unprocessedBody,
        logo: { url: cloudinaryRes.url, filename: cloudinaryRes.public_id },
        author: req.user._id,
      });

      service.serviceProviders.push(serviceProvider);

      const user = req.user;

      await serviceProvider.save();
      await service.save();
      user.userServices.push(serviceProvider._id);
      await user.save();

      req.flash('success', 'Successfully added new service!');
      return res.redirect(`/services`);
    }

    req.flash('error', 'Please upload an image for the service.');
    res.redirect('/services/new');
  } catch (error) {
    console.error('Error adding new service:', error);
    req.flash('error', 'Failed to add new service.');
    res.redirect('/services/new'); // Redirect to an appropriate error page or fallback route
  }
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  //const meid = '64be38477207febe098ce887';
  const serviceProvider = await ServiceProvider.findById(id);
  if (!serviceProvider) {
    req.flash('error', 'Cannot find that service!');
    return res.redirect('/services');
  }
  res.render('services/edit', { serviceProvider });
};

module.exports.updateService = async (req, res) => {
  try {
    const serviceId = req.params.id;
    const updatedServiceData = {
      name: req.body.name,
      description: req.body.description,
      icon: req.body.icon,
    };

    const updatedService = await Service.findByIdAndUpdate(serviceId, updatedServiceData, { new: true });

    if (!updatedService) {
      req.flash('error', 'Service not found');
      return res.redirect('/services');
    }

    req.flash('success', 'Service updated successfully');
    res.redirect(`/services/${updatedService._id}`);
  } catch (error) {
    console.error('Error updating service:', error);
    req.flash('error', 'Failed to update service');
    res.redirect('/services'); // Redirect to an appropriate error page or fallback route
  }
};

module.exports.deleteService = async (req, res) => {
  try {
    const serviceId = req.params.id;

    const deletedService = await Service.findByIdAndDelete(serviceId);

    if (!deletedService) {
      req.flash('error', 'Service not found');
      return res.redirect('/services');
    }

    req.flash('success', 'Service deleted successfully');
    res.redirect('/services');
  } catch (error) {
    console.error('Error deleting service:', error);
    req.flash('error', 'Failed to delete service');
    res.redirect('/services'); // Redirect to an appropriate error page or fallback route
  }
};
