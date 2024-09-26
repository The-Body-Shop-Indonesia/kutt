import { Request } from "express";

export interface CreateLinkReq extends Request {
  body: {
    reuse?: boolean;
    password?: string;
    customurl?: string;
    description?: string;
    expire_in?: string;
    domain?: Domain;
    target: string;
  };
}

export interface CreateMultiLinkReq extends Request {
  urls: CreateLinkReq[];
}
