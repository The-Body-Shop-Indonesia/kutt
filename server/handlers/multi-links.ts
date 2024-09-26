import { Handler } from "express";
import URL from "url";

import env from "../env";
import query from "../queries";
import * as utils from "../utils";
import { CreateMultiLinkReq } from "./types";
import * as validators from "./validators";

// const dnsLookup = promisify(dns.lookup);

//custom create
export const createMulti: Handler = async (req: CreateMultiLinkReq, res) => {
  const { urls } = req.body;

  const linksData = [];

  for (const data of urls) {
    const {
      reuse,
      password,
      customurl,
      description,
      target,
      domain,
      expire_in
    } = data;

    // console.log(urls);
    const domain_id = domain ? domain.id : null;

    const targetDomain = utils.removeWww(URL.parse(target).hostname);

    const queries = await Promise.all([
      validators.cooldown(req.user),
      validators.malware(req.user, target),
      validators.linksCount(req.user),
      reuse &&
        query.link.find({
          target,
          user_id: req.user.id,
          domain_id
        }),
      customurl &&
        query.link.find({
          address: customurl,
          domain_id
        }),
      !customurl && utils.generateId(domain_id),
      validators.bannedDomain(targetDomain),
      validators.bannedHost(targetDomain)
    ]);

    // console.log(queries);

    // if "reuse" is true, try to return
    // the existent URL without creating one
    if (queries[3]) {
      linksData.push({ ...queries[3], reuse: true });
      continue;
      //   return res.json(utils.sanitize.link(queries[3]));
    }

    // Check if custom link already exists
    if (queries[4]) {
      linksData.push({ ...queries[4], customLinkExist: true });
      continue;
      //   throw new CustomError("Custom URL is already in use.");
    }

    // Create new link
    const address = customurl || queries[5];
    const link = await query.link.create({
      password,
      address,
      domain_id,
      description,
      target,
      expire_in,
      user_id: req.user && req.user.id
    });

    if (!req.user && env.NON_USER_COOLDOWN) {
      query.ip.add(req.realIP);
    }

    linksData.push(link);
  }
  

    return res
      .status(201)
      .send(`${linksData.length} Url created`);
};
