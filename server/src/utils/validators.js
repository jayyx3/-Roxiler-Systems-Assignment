import { body } from 'express-validator';

const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,16}$/;

export const signupRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required.')
    .isLength({ min: 20, max: 60 }).withMessage('Name must be between 20 and 60 characters.'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 8, max: 16 }).withMessage('Password must be between 8 and 16 characters.')
    .matches(passwordRegex).withMessage('Password must contain at least one uppercase letter and at least one special character.'),
  
  body('address')
    .trim()
    .notEmpty().withMessage('Address is required.')
    .isLength({ max: 400 }).withMessage('Address cannot exceed 400 characters.'),
];

export const loginRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required.'),
];

export const updatePasswordRules = [
  body('oldPassword')
    .notEmpty().withMessage('Current password is required.'),
  
  body('newPassword')
    .notEmpty().withMessage('New password is required.')
    .isLength({ min: 8, max: 16 }).withMessage('New password must be between 8 and 16 characters.')
    .matches(passwordRegex).withMessage('New password must contain at least one uppercase letter and at least one special character.')
    .custom((value, { req }) => {
      if (value === req.body.oldPassword) {
        throw new Error('New password cannot be the same as the old password.');
      }
      return true;
    }),
];

export const adminCreateUserRules = [
  ...signupRules,
  body('role')
    .notEmpty().withMessage('Role is required.')
    .isIn(['SYSTEM_ADMIN', 'NORMAL_USER', 'STORE_OWNER']).withMessage('Invalid role value.'),
];

export const adminCreateStoreRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Store name is required.')
    .isLength({ min: 20, max: 60 }).withMessage('Store name must be between 20 and 60 characters.'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Store email is required.')
    .isEmail().withMessage('Please provide a valid store email address.')
    .normalizeEmail(),
  
  body('address')
    .trim()
    .notEmpty().withMessage('Store address is required.')
    .isLength({ max: 400 }).withMessage('Store address cannot exceed 400 characters.'),
  
  body('ownerId')
    .optional({ nullable: true })
    .isUUID().withMessage('Owner ID must be a valid UUID.'),
];

export const submitRatingRules = [
  body('rating')
    .notEmpty().withMessage('Rating is required.')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5.'),
];
