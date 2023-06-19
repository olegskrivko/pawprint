const Pet = require("../models/pet");

module.exports.compare = async (req, res) => {
  try {
    const petsIds = req.params.id.split(",");
    const pets = await Pet.find({ _id: { $in: petsIds } });
    if (!pets) {
      return res.redirect("/pets");
    }

    console.log("pets", pets);
    res.render("compare/compare", { pets });
  } catch (err) {
    console.log(err);
    // Handle error and display appropriate message
  }
};

// module.exports.compares = async (req, res) => {
//   try {
//     const petsIds = req.params.id.split(",");
//     const pets = await Pet.find({ _id: { $in: petsIds } });
//     if (!pets) {
//       return res.redirect("/pets");
//     }

//     console.log("pets", pets);
//     res.render("compare/compares", { pets });
//   } catch (err) {
//     console.log(err);
//     // Handle error and display appropriate message
//   }
// };
