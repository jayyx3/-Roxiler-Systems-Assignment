import express from 'express';
import prisma from '../config/db.js';
import authenticate from '../middlewares/auth.middleware.js';
import authorize from '../middlewares/role.middleware.js';

const router = express.Router();

// Apply auth and store owner check to all routes in this file
router.use(authenticate, authorize('STORE_OWNER'));

// GET /api/store-owner/dashboard
router.get('/dashboard', async (req, res, next) => {
  try {
    const ownerId = req.user.id;

    // Find the store(s) owned by this user
    const store = await prisma.store.findFirst({
      where: { ownerId },
      include: {
        ratings: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'No store linked to this owner account found.',
      });
    }

    const ratingsCount = store.ratings.length;
    const averageRating = ratingsCount > 0
      ? parseFloat((store.ratings.reduce((sum, r) => sum + r.rating, 0) / ratingsCount).toFixed(2))
      : 0;

    const raters = store.ratings.map((r) => ({
      userName: r.user.name,
      userEmail: r.user.email,
      rating: r.rating,
      ratedAt: r.createdAt,
    }));

    return res.json({
      success: true,
      data: {
        storeId: store.id,
        storeName: store.name,
        storeEmail: store.email,
        storeAddress: store.address,
        averageRating,
        totalRatings: ratingsCount,
        raters,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
