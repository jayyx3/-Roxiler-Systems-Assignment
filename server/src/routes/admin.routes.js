import express from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';
import authenticate from '../middlewares/auth.middleware.js';
import authorize from '../middlewares/role.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { adminCreateUserRules, adminCreateStoreRules } from '../utils/validators.js';

const router = express.Router();

// Apply auth and admin check to all routes in this file
router.use(authenticate, authorize('SYSTEM_ADMIN'));

// GET /api/admin/dashboard - return totalUsers, totalStores, totalRatings
router.get('/dashboard', async (req, res, next) => {
  try {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      prisma.user.count(),
      prisma.store.count(),
      prisma.rating.count(),
    ]);

    return res.json({
      success: true,
      data: {
        totalUsers,
        totalStores,
        totalRatings,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/users - create new user with arbitrary role
router.post('/users', adminCreateUserRules, validate, async (req, res, next) => {
  try {
    const { name, email, password, address, role } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: passwordHash,
        address,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'User created successfully.',
      user,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/users - list and paginate users
// Query params: ?sortBy=name|email|address|role|createdAt&order=asc|desc&name=&email=&address=&role=&page=1&limit=10
router.get('/users', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const sortBy = req.query.sortBy || 'createdAt';
    const order = req.query.order === 'asc' ? 'asc' : 'desc';

    const { name, email, address, role } = req.query;

    const where = {};
    if (name) {
      where.name = { contains: name, mode: 'insensitive' };
    }
    if (email) {
      where.email = { contains: email, mode: 'insensitive' };
    }
    if (address) {
      where.address = { contains: address, mode: 'insensitive' };
    }
    if (role && ['SYSTEM_ADMIN', 'NORMAL_USER', 'STORE_OWNER'].includes(role)) {
      where.role = role;
    }

    // Determine order criteria
    let orderBy = {};
    if (['name', 'email', 'address', 'role', 'createdAt'].includes(sortBy)) {
      orderBy[sortBy] = order;
    } else {
      orderBy = { createdAt: 'desc' };
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          address: true,
          role: true,
          createdAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return res.json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/users/:id - get detailed user
// If STORE_OWNER, include store's average rating
router.get('/users/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
        stores: {
          select: {
            id: true,
            name: true,
            email: true,
            address: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const responseData = { ...user };

    if (user.role === 'STORE_OWNER') {
      let averageRating = 0;
      let totalRatings = 0;

      if (user.stores.length > 0) {
        // Aggregate ratings for the store(s) owned by this user
        const storeIds = user.stores.map((s) => s.id);
        const agg = await prisma.rating.aggregate({
          where: {
            storeId: { in: storeIds },
          },
          _avg: {
            rating: true,
          },
          _count: {
            rating: true,
          },
        });

        averageRating = agg._avg.rating ? parseFloat(agg._avg.rating.toFixed(2)) : 0;
        totalRatings = agg._count.rating;
      }

      responseData.averageRating = averageRating;
      responseData.totalRatings = totalRatings;
    }

    return res.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/stores - create new store
router.post('/stores', adminCreateStoreRules, validate, async (req, res, next) => {
  try {
    const { name, email, address, ownerId } = req.body;

    const existingStore = await prisma.store.findUnique({
      where: { email },
    });

    if (existingStore) {
      return res.status(409).json({
        success: false,
        message: 'A store with this email address already exists.',
      });
    }

    // Verify owner if provided
    if (ownerId) {
      const owner = await prisma.user.findUnique({
        where: { id: ownerId },
      });

      if (!owner || owner.role !== 'STORE_OWNER') {
        return res.status(400).json({
          success: false,
          message: 'The specified owner ID does not exist or is not a STORE_OWNER.',
        });
      }
    }

    const store = await prisma.store.create({
      data: {
        name,
        email,
        address,
        ownerId: ownerId || null,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Store created successfully.',
      store,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/stores - list and paginate stores
// Query params: ?sortBy=name|email|address|rating&order=asc|desc&name=&email=&address=&page=1&limit=10
router.get('/stores', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const sortBy = req.query.sortBy || 'name';
    const order = req.query.order === 'asc' ? 'asc' : 'desc';

    const { name, email, address } = req.query;

    const where = {};
    if (name) {
      where.name = { contains: name, mode: 'insensitive' };
    }
    if (email) {
      where.email = { contains: email, mode: 'insensitive' };
    }
    if (address) {
      where.address = { contains: address, mode: 'insensitive' };
    }

    let orderBy = {};
    let shouldSortByRating = false;

    if (sortBy === 'rating') {
      shouldSortByRating = true;
    } else if (['name', 'email', 'address', 'createdAt'].includes(sortBy)) {
      orderBy[sortBy] = order;
    } else {
      orderBy = { name: 'asc' };
    }

    let stores = [];
    let total = 0;

    if (shouldSortByRating) {
      // Fetch all matching stores first, compute ratings, then sort and paginate in memory.
      const [allStores, totalCount] = await Promise.all([
        prisma.store.findMany({
          where,
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            ratings: {
              select: {
                rating: true,
              },
            },
          },
        }),
        prisma.store.count({ where }),
      ]);

      total = totalCount;

      const formatted = allStores.map((store) => {
        const ratings = store.ratings.map((r) => r.rating);
        const totalRatings = ratings.length;
        const averageRating = totalRatings > 0 
          ? parseFloat((ratings.reduce((sum, r) => sum + r, 0) / totalRatings).toFixed(2)) 
          : 0;

        const { ratings: _, ...storeData } = store;
        return {
          ...storeData,
          averageRating,
          totalRatings,
        };
      });

      formatted.sort((a, b) => {
        if (order === 'asc') {
          return a.averageRating - b.averageRating;
        } else {
          return b.averageRating - a.averageRating;
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
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            ratings: {
              select: {
                rating: true,
              },
            },
          },
        }),
        prisma.store.count({ where }),
      ]);

      const formattedStores = stores.map((store) => {
        const ratings = store.ratings.map((r) => r.rating);
        const totalRatings = ratings.length;
        const averageRating = totalRatings > 0 
          ? parseFloat((ratings.reduce((sum, r) => sum + r, 0) / totalRatings).toFixed(2)) 
          : 0;

        const { ratings: _, ...storeData } = store;
        return {
          ...storeData,
          averageRating,
          totalRatings,
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

export default router;
