const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

module.exports.asyncForEach = asyncForEach;

module.exports.includesByEquals = async (arr, val) => {
  var flag = false;
  await asyncForEach(arr, async (elem) => {
    flag = flag || elem.equals(val);
  });
  return flag;
};

module.exports.indexOfEquals = async (arr, val) => {
  var index = -1;
  await asyncForEach(arr, async (elem, i) => {
    if (index > -1) return;
    if (elem.equals(val)) index = i;
  });
  return index;
};

module.exports.isLatitude = (lat) => {
  return isFinite(lat) && Math.abs(lat) <= 90;
};

module.exports.isLongitude = (lng) => {
  return isFinite(lng) && Math.abs(lng) <= 180;
};
