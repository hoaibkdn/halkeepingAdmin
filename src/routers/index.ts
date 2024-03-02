import { Router } from 'express';
import { login } from '../controllers/auth.controllers';
import { getListUser } from '../controllers/user.controlers';
import { createNewJob } from '../controllers/job.controllers';
import { getProvinces } from './../controllers/province.controllers';
import { getListTools } from '../controllers/tool.controllers';

const router = Router();

router.post('/login', login);
router.get('/users', getListUser);

router.get('/provinces', getProvinces);

/**
 * @api {post} /job/create create new job
 * @apiName createNewJob
 * @apiGroup Job
 * @apiParam {String} name Customer's name: "Nguyen van A".
 * @apiParam {String} phone Customer's unique phone: "096578988".
 * @apiParam {String} email Customer's unique email: "lan@gmail.com".
 * @apiParam {String} address Customer's Addess:  "Nguyen thi minh khai Quan 1, Thanh pho HCM".
 * @apiParam {String} workdate date and time that customer request cleaner to come: "22-04-2024, 16:23".
 * @apiParam {Number} numberOfclean amount of clean needed: 2.
 * @apiParam {Number} durationEachClean amount of time of each clean and minute unit: 80.
 * @apiParam {String} method Customer will pay: "cash" (cash or credit).
 * @apiParam {Object[]} tools Array of tool objects.
 * @apiParam {String} tools.toolId id of the user.
 * @apiParam {String} tools.realPrice real price of the tool.
 *
 * @apiSuccess {Object} data
 * @apiSuccess {Object} data.job new job
 * @apiSuccess {String} data.job.customerId customer's id.
 * @apiSuccess {String} data.job.workDate date and time of job.
 * @apiSuccess {String} data.job.payment method of job.
 * @apiSuccess {Boolean} data.job.isPay is pay of job.
 * @apiSuccess {Number} data.job.pricePerHour price of per house
 * @apiSuccess {Number} data.job.duration total time of job (unit is minute)
 * @apiSuccess {Number} data.job.total total money of job
 * @apiSuccess {Number} data.job.id Job's id
 *
 * @apiError {Object} Error message indicating the reason for failure.
 * @apiErrorExample {json} Error-Response:
 *     400 Bad Request
 *     {
 *        "message": "Missing required field",
 *        "status": 400
 *     }
 */
router.post('/job/create', createNewJob);

/**
 * @api {get} /tool/all get list tools
 * @apiName getListTools
 * @apiGroup Tool
 *
 * @apiSuccess {Object} data
 * @apiSuccess {Object[]} data.tools new job
 * @apiSuccess {String} data.tools._id tool's id.
 * @apiSuccess {String} data.tools.name tool's name.
 * @apiSuccess {number} data.tools.defaultPrice tool's default price.
 * @apiSuccess {Date} data.tools.createdAt tool's createdAt.
 * @apiSuccess {Date} data.tools.updatedAt tool's updatedAt.
 */
router.get('/tool/all', getListTools);

export default router;
