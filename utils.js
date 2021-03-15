const checkAuthorization = function (req, res) {
  res.send({
    data: {
      error: 1,
      status: 401,
      message: "Unauthorization",
    },
  });
  return;
};

module.exports = {
  checkAuthorization,
};
