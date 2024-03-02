import { Router } from 'express';
import { login } from '../controllers/auth.controllers';
import { getListUser } from '../controllers/user.controlers';
import { createNewJob } from '../controllers/job.controllers';
import { getProvinces } from './../controllers/province.controllers';

const router = Router();

// Auth
router.post('/login', login);
router.get('/users', getListUser);

router.get('/provinces', getProvinces);

// job
/**
 * @api {post} /job create new job
 * @apiName createNewJob
 * @apiGroup Job
 * @param {
 *  @name: "A",
 *  @phone: "096578988"
 *  @email: "lan@gmail.com",
 *  @address: "Nguyen thi minh khai",
 *  @workdate: "22-04-2024, 16:23",
 *  @numberOfClean: 2,
 *  @durationEachClean: 80, // minute
 *  @method: "cash",
 *  @tools: [{
 *    @toolId: "1",
 *    @realPrice": 34000
 *  }]
 * }
 * @apiSuccess {Job} new job
 */
router.post('/job/create', createNewJob);

export default router;
