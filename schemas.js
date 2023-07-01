const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
  type: 'string',
  base: joi.string(),
  messages: {
    'string.escapeHTML': '{{#label}} must not include HTML!',
  },
  rules: {
    escapeHTML: {
      validate(value, helpers) {
        const clean = sanitizeHtml(value, {
          allowedTags: [],
          allowedAttributes: {},
        });
        if (clean !== value) return helpers.error('string.escapeHTML', { value });
        return clean;
      },
    },
  },
});

const Joi = BaseJoi.extend(extension);

module.exports.petSchema = Joi.object({
  pet: Joi.object({
    title: Joi.string().escapeHTML(),
    species: Joi.string().escapeHTML(),
    breed: Joi.string().escapeHTML(),
    identifier: Joi.number(),
    pattern: Joi.string().escapeHTML(),
    color: Joi.array().items(Joi.string()),
    firstcolor: Joi.string().escapeHTML(),
    secondcolor: Joi.string().escapeHTML(),
    thirdcolor: Joi.string().escapeHTML(),
    coat: Joi.string().escapeHTML(),
    size: Joi.string().escapeHTML(),
    age: Joi.string().escapeHTML(),
    gender: Joi.string().escapeHTML(),
    petStatus: Joi.string().escapeHTML(),
    // location: Joi.string().required().escapeHTML(),
    latitude: Joi.number(),
    longitude: Joi.number(),
    lostdate: Joi.date().greater('01-01-2023').required(),
    description: Joi.string().required().escapeHTML(),
  }),
  deleteImages: Joi.array(),
});

// module.exports.commentSchema = Joi.object({
//   comment: Joi.object({
//     // rating: Joi.number().required().min(0).max(5),
//     // latitude: Joi.number(),
//     // longitude: Joi.number(),
//     body: Joi.string().required().escapeHTML(),
//   }).required(),
// });

//  "@tomtom-international/web-sdk-services": "^6.23.0",

// Offline functionality: Utilize service workers and caching strategies to enable offline functionality for your app. This allows users to access certain features or content even when they don't have an internet connection.

// Push notifications: Implement push notifications to keep users engaged and provide them with timely updates or reminders. Push notifications can be used to notify users about new content, promotions, or important information related to your app.

// Background sync: Implement background sync to ensure that user actions or data are synchronized with the server even when the app is not actively in use or when the device is offline. This allows users to perform actions without interruption and ensures data consistency.

// Add to home screen prompt: Customize the "Add to Home Screen" prompt to encourage users to install your PWA on their devices. This makes it easy for users to access your app directly from their home screen, increasing engagement and retention.

// Responsive design: Ensure that your app is fully responsive and optimized for various screen sizes and devices. This ensures a seamless user experience across different platforms, including desktop, mobile, and tablets.

// App-like UI and interactions: Aim to provide an app-like experience to users by focusing on smooth animations, transitions, and intuitive interactions. Make use of gestures, swiping, and other mobile-specific features to enhance usability and engagement.

// Performance optimization: Continuously optimize the performance of your PWA by minimizing file sizes, reducing network requests, and utilizing caching and lazy loading techniques. This improves load times and overall responsiveness, providing a snappy and smooth user experience.

// Accessibility considerations: Pay attention to accessibility best practices and ensure that your PWA is accessible to users with disabilities. Provide alternative text for images, use semantic HTML, and follow WCAG (Web Content Accessibility Guidelines) to make your app inclusive for all users.

// Analytics and tracking: Implement analytics tools to track user behavior, measure engagement, and gather insights about how users interact with your PWA. This data can help you identify areas for improvement and make data-driven decisions to enhance the user experience.

// Continuous updates and improvements: Regularly update and improve your PWA based on user feedback, bug reports, and industry best practices. Keep an eye on emerging technologies and trends to stay ahead and provide the best possible experience to your users.
