const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getAdminDashboard, getUsers, getUser, updateUser,
    suspendUser, getFinancingAdmin, createFinancingOption,
    updateFinancingOption, deleteFinancingOption,
    getSystemHealth,
} = require('../controllers/adminController');

router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getAdminDashboard);
router.get('/users', getUsers);
router.get('/users/:id', getUser);
router.put('/users/:id', updateUser);
router.put('/users/:id/suspend', suspendUser);
router.get('/financing', getFinancingAdmin);
router.post('/financing', createFinancingOption);
router.put('/financing/:id', updateFinancingOption);
router.delete('/financing/:id', deleteFinancingOption);
router.get('/system-health', getSystemHealth);

module.exports = router;
