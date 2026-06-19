import express from 'express';
import prisma from '../config/db.js';
import authenticate from '../middlewares/auth.middleware.js';
import authorize from '../middlewares/role.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { submitRatingRules } from '../utils/validators.js';

const router = express.Router();

// Apply auth and normal user check to all routes in this file
router.use(authenticate, authorize('NORMAL_USER'));

// GET /api/stores - list stores for normal users
// Query params: ?search=&searchBy=name|address&sortBy=name|address|rating&order=asc|desc&page=1&limit=10
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { search, searchBy, sortBy, order } = req.query;
    const sortOrder = order === 'asc' ? 'asc' : 'desc';

    const where = {};
    if (search) {
      if (searchBy === 'name') {
        where.name = { contains: search, mode: 'insensitive' };
      } else if (searchBy === 'address') {
        where.address = { contains: search, mode: 'insensitive' };
      } else {
        // search in name or address
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { address: { contains: search, mode: 'insensitive' } },
        ];
      }
    }

    let orderBy = {};
    let sortByRating = false;

    if (sortBy === 'rating') {
      sortByRating = true;
    } else if (['name', 'address'].includes(sortBy)) {
      orderBy[sortBy] = sortOrder;
    } else {
      orderBy = { name: 'asc' };
    }

    let stores = [];
    let total = 0;

    if (sortByRating) {
      const [allStores, totalCount] = await Promise.all([
        prisma.store.findMany({
          where,
          include: {
            ratings: {
              select: {
                userId: true,
                rating: true,
              },
            },
          },
        }),
        prisma.store.count({ where }),
      ]);

      total = totalCount;

      const formatted = allStores.map((store) => {
        const allRatings = store.ratings.map((r) => r.rating);
        const totalRatings = allRatings.length;
        const overallRating = totalRatings > 0
          ? parseFloat((allRatings.reduce((sum, r) => sum + r, 0) / totalRatings).toFixed(2))
          : 0;

        const userRatingRecord = store.ratings.find((r) => r.userId === userId);
        const userSubmittedRating = userRatingRecord ? userRatingRecord.rating : null;

        const { ratings: _, ...storeData } = store;
        return {
          ...storeData,
          overallRating,
          totalRatings,
          userSubmittedRating,
        };
      });

      formatted.sort((a, b) => {
        if (sortOrder === 'asc') {
          return a.overallRating - b.overallRating;
        } else {
          return b.overallRating - a.overallRating;
        }
      });

      stores = formatted.slice(skip, skip + limit);

      return res.json({
        success: true,
        data: {
          stores,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        },
      });
    } else {
      [stores, total] = await Promise.all([
        prisma.store.findMany({
          where,
          orderBy,
          skip,
          take: limit,
          include: {
            ratings: {
              select: {
                userId: true,
                rating: true,
              },
            },
          },
        }),
        prisma.store.count({ where }),
      ]);

      const formattedStores = stores.map((store) => {
        const allRatings = store.ratings.map((r) => r.rating);
        const totalRatings = allRatings.length;
        const overallRating = totalRatings > 0
          ? parseFloat((allRatings.reduce((sum, r) => sum + r, 0) / totalRatings).toFixed(2))
          : 0;

        const userRatingRecord = store.ratings.find((r) => r.userId === userId);
        const userSubmittedRating = userRatingRecord ? userRatingRecord.rating : null;

        const { ratings: _, ...storeData } = store;
        return {
          ...storeData,
          overallRating,
          totalRatings,
          userSubmittedRating,
        };
      });

      return res.json({
        success: true,
        data: {
          stores: formattedStores,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        },
      });
    }
  } catch (error) {
    next(error);
  }
});

// Helper for upserting rating
const upsertRating = async (userId, storeId, ratingValue, res, next) => {
  try {
    // Check if store exists
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found.',
      });
    }

    // Upsert rating using unique user-store constraint
    const rating = await prisma.rating.upsert({
      where: {
        userId_storeId: {
          userId,
          storeId,
        },
      },
      update: {
        rating: ratingValue,
      },
      create: {
        userId,
        storeId,
        rating: ratingValue,
      },
    });

    // Calculate new overall rating
    const agg = await prisma.rating.aggregate({
      where: { storeId },
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      },
    });

    return res.json({
      success: true,
      message: 'Rating submitted successfully.',
      data: {
        rating: rating.rating,
        overallRating: agg._avg.rating ? parseFloat(agg._avg.rating.toFixed(2)) : 0,
        totalRatings: agg._count.rating,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/stores/:storeId/ratings - submit a rating (1-5)
router.post('/:storeId/ratings', submitRatingRules, validate, async (req, res, next) => {
  const userId = req.user.id;
  const { storeId } = req.params;
  const ratingValue = req.body.rating;
  await upsertRating(userId, storeId, ratingValue, res, next);
});

// PUT /api/stores/:storeId/ratings - modify a rating
router.put('/:storeId/ratings', submitRatingRules, validate, async (req, res, next) => {
  const userId = req.user.id;
  const { storeId } = req.params;
  const ratingValue = req.body.rating;
  await upsertRating(userId, storeId, ratingValue, res, next);
});

export default router;
