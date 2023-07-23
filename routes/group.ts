import { Router } from 'express';
import { body, param } from 'express-validator';
import handleResult from '../middleware/validator.js';
import { createGroupView, createGroupRoute, groupInviteLink, groupPage } from '../controllers/groups.js';

const router = Router();

router.route('/group/create').get(createGroupView);

router.route('/group/create').post(body('groupName').exists({ checkFalsy: true }), handleResult, createGroupRoute);

router
  .route('/group/invitation/:groupToken')
  .get(param('groupToken').exists({ checkFalsy: true }), handleResult, groupInviteLink);

router.route('/group/:groupId').get(param('groupId').isInt().exists(), handleResult, groupPage);

export default router;
