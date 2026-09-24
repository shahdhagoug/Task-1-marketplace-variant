import { Listing } from '../models/Listing.js';

// Validate listing data
function validateListing(data, isUpdate = false) {
  const errors = [];

  if (!isUpdate && !data.title) {
    errors.push('title is required');
  }

  if (!isUpdate && data.price === undefined) {
    errors.push('price is required');
  }

  if (data.price !== undefined) {
    if (typeof data.price !== 'number' || data.price < 0) {
      errors.push('price must be a non-negative number');
    }
  }

  const categories = [
    'textbooks',
    'electronics',
    'furniture',
    'clothing',
    'other'
  ];

  if (data.category !== undefined && !categories.includes(data.category)) {
    errors.push('invalid category');
  }

  const conditions = [
    'new',
    'like-new',
    'used',
    'worn'
  ];

  if (data.condition !== undefined && !conditions.includes(data.condition)) {
    errors.push('invalid condition');
  }

  const statuses = [
    'active',
    'sold',
    'removed'
  ];

  if (data.status !== undefined && !statuses.includes(data.status)) {
    errors.push('invalid status');
  }

  return errors;
}


// GET /api/listings
export async function getAllListings(req, res, next) {
  try {
    let filter = {};

    if (req.query.includeRemoved !== 'true') {
      filter.status = { $ne: 'removed' };
    }

    const listings = await Listing.find(filter)
  .populate('seller', 'name email');

    res.status(200).json(listings);

  } catch (err) {
    next(err);
  }
}


// GET /api/listings/:id
export async function getListing(req, res, next) {
  try {
    const listing = await Listing.findById(req.params.id)
  .populate('seller', 'name email');

    if (!listing) {
      return res.status(404).json({
        message: 'Listing not found'
      });
    }

    if (
      listing.status === 'removed' &&
      req.query.includeRemoved !== 'true'
    ) {
      return res.status(404).json({
        message: 'Listing not found'
      });
    }

    res.status(200).json(listing);

  } catch (err) {
    next(err);
  }
}


// POST /api/listings
export async function createListing(req, res, next) {
  try {
    const errors = validateListing(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        errors
      });
    }

    const listing = await Listing.create(req.body);

    res.status(201).json(listing);

  } catch (err) {
    next(err);
  }
}


// PATCH /api/listings/:id
export async function updateListing(req, res, next) {
  try {
    const errors = validateListing(req.body, true);

    if (errors.length > 0) {
      return res.status(400).json({
        errors
      });
    }

    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!listing) {
      return res.status(404).json({
        message: 'Listing not found'
      });
    }

    res.status(200).json(listing);

  } catch (err) {
    next(err);
  }
}


// DELETE /api/listings/:id
export async function deleteListing(req, res, next) {
  try {
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      {
        status: 'removed'
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!listing) {
      return res.status(404).json({
        message: 'Listing not found'
      });
    }

    res.status(200).json(listing);

  } catch (err) {
    next(err);
  }
}


// PATCH /api/listings/:id/sold
export async function markListingAsSold(req, res, next) {
  try {
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { status: 'sold' },
      {
        new: true,
        runValidators: true
      }
    );

    if (!listing) {
      return res.status(404).json({
        message: 'Listing not found'
      });
    }

    res.status(200).json(listing);

  } catch (err) {
    next(err);
  }
}