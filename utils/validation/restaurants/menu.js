const isEmptyObject = require("is-empty-object");

const { isEmpty, isLength, isMobilePhone, isDecimal } = require("validator");

const countryList = require("country-list");

module.exports.validateMenu = (req, res, next) => {
  const { name, categories } = req.body;
  const errors = {};
  if (!name || isEmpty(name)) errors.name = "Menu name is required";
  if (!categories || !Array.isArray(categories) || categories.length === 0)
    errors.categories = []
      .concat(errors.categories)
      .concat("At least one category is required");
  categories.forEach((cat, index) => {
    if (!cat.categoryName || isEmpty(cat.categoryName))
      errors.categories = []
        .concat(errors.categories)
        .concat(`Category name is required at category ${index + 1}`);
    if (!cat.categoryDescription || isEmpty(cat.categoryDescription))
      errors.categories = []
        .concat(errors.categories)
        .concat(`Category description is required at category ${index + 1}`);
    if (!cat.items || !Array.isArray(cat.items) || cat.items.length === 0)
      errors.categories = []
        .concat(errors.categories)
        .concat(`Category items are required at category ${index + 1}`);
    else {
      cat.items.forEach((item, i) => {
        if (
          (!item.description || isEmpty(item.description)) &&
          (!item.name || isEmpty(item.name))
        )
          errors.categories = []
            .concat(errors.categories)
            .concat(
              `Error at category ${index + 1}, item ${
                i + 1
              }: name is required, or you can use a description instead`
            );
        if (description && isEmpty(description))
          errors.categories = []
            .concat(errors.categories)
            .concat(
              `Error at category ${index + 1}, item ${
                i + 1
              }: invalid description`
            );
        if (name && isEmpty(name))
          errors.categories = []
            .concat(errors.categories)
            .concat(
              `Error at category ${index + 1}, item ${i + 1}: invalid name`
            );
      });
    }
    if (!isEmptyObject(errors)) return res.status(400).json(errors);
  });
};
