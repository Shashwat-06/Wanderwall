const Listing = require("../models/listing");

// index route
module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

// new route
module.exports.renderNewForm = (req, res) => {
  console.log(req.user);

  res.render("listings/new.ejs");
};

// show route
module.exports.showListings = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist");
    res.redirect("/listings");
  }
  // const location = listing.location;
  // // console.log(location);
  // const country = listing.country;
  // // console.log(country);
  // let nominatimAPI = `https://nominatim.openstreetmap.org/search?q=${location},${country}&format=jsonv2`;
  // // console.log(nominatimAPI);
  // const data = await fetch(nominatimAPI);
  // const [geoData] = await data.json();
  // // console.log(`{type: Point, coordinates: [${geoData.lon}, ${geoData.lat}] }`);
  // let result = `{type: Point, coordinates: [${geoData.lon}, ${geoData.lat}] }`;

  // console.log(listing);
  res.render("listings/show.ejs", { listing });
};

//Create route
module.exports.createListings = async (req, res, next) => {
  let nominatimAPI = `https://nominatim.openstreetmap.org/search?q=${req.body.listing.location},${req.body.listing.country}&format=jsonv2`;
  // const data = await fetch(nominatimAPI);
  // const [geoData] = await data.json();
  const data = await fetch(nominatimAPI, {
    headers: {
      "User-Agent": "WanderWall/1.0 (https://wanderwall-demo.render.com)",
      Accept: "application/json",
    },
  });

  const raw = await data.text();
  console.log("Raw response:", raw.slice(0, 300));
  const geoData = JSON.parse(raw)[0];

  let response = { type: "Point", coordinates: [geoData.lon, geoData.lat] };

  let url = req.file.path;
  let filename = req.file.filename;

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };
  newListing.geometry = response;

  let savedListings = await newListing.save();
  console.log(savedListings);
  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

//edit route
module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist");
    res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_300");
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

// Update Route
module.exports.updateListings = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, req.body.listing);

  let nominatimAPI = `https://nominatim.openstreetmap.org/search?q=${req.body.listing.location},${req.body.listing.country}&format=jsonv2`;
  const data = await fetch(nominatimAPI);
  const [geoData] = await data.json();

  let response = { type: "Point", coordinates: [geoData.lon, geoData.lat] };

  // console.log(response);
  let updatedGeometry = await Listing.updateOne(
    { _id: id },
    { geometry: response }
  );

  // console.log(updatedGeometry);
  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }

  req.flash("success", "Listing Updated!");
  res.redirect(`${id}`);
};

// Delete Route
module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};

// Search Route

module.exports.searchListing = async (req, res) => {
  const searchParam = req.body.searchParam;
  // console.log(searchParam);
  let foundListings = await Listing.find({
    location: { $regex: searchParam, $options: "i" },
  });
  // console.log(foundListings);
  res.render("listings/searchResults.ejs", { foundListings });
};
