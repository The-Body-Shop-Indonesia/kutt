import cors from "cors";
import { Router } from "express";
import asyncHandler from "express-async-handler";

import env from "../env";
import * as auth from "../handlers/auth";
import * as helpers from "../handlers/helpers";
import * as link from "../handlers/multi-links";

const router = Router();

router.post(
  "/",
  cors(),
  asyncHandler(auth.apikey),
  asyncHandler(env.DISALLOW_ANONYMOUS_LINKS ? auth.jwt : auth.jwtLoose),
  asyncHandler(auth.recaptcha),
  asyncHandler(auth.cooldown),
//   validators.createLink,
  asyncHandler(helpers.verify),
  asyncHandler(link.createMulti)
);

export default router;
