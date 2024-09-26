import { Router } from "express";

import auth from "./auth";
import domains from "./domains";
import health from "./health";
import links from "./links";
import multiLinks from "./multi-links";
import user from "./users";

const router = Router();

router.use("/domains", domains);
router.use("/health", health);
router.use("/links", links);
router.use("/users", user);
router.use("/auth", auth);
router.use("/multi-links", multiLinks)

export default router;
