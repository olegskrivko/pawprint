const Service = require('../models/service');
const ServiceProvider = require('../models/serviceProvider');

module.exports.renderServiceProvider = async (req, res) => {
  const { slug, serviceProviderId } = req.params;
  const selectOptions = req.__('selectOptions');
  const serviceProviderPage = req.__('serviceProviderPage');

  try {
    const service = await Service.findOne({ slug });
    const serviceProvider = await ServiceProvider.findById(serviceProviderId);
    res.render(`services/serviceProvider`, { service, serviceProvider, selectOptions, serviceProviderPage });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Failed to add a new comment');
    res.redirect(`/`);
  }
};
