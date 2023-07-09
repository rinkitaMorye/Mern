exports.getDate = function () {
  let date = new Date();
  let options = {
    weekday: "long",
    day: "numeric",
    month: "long",
  };
  let day = date.toLocaleDateString("en-US", options);
  return day;
};

exports.getDay = function () {
  let date = new Date();
  let options = {
    weekday: "long",
  };
  let day = date.toLocaleDateString("en-US", options);
  return day;
};
