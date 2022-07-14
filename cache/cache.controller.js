"use strict";

const _ = require("lodash");
const {
  getRedisKeys,
  getRedisKey,
  deleteRedisKey,
  deleteRedisKeys,
} = require("./redis.service");

exports.getRedisKeys = async function (req, res) {
  try {
    getRedisKeys(req, res)
      .then((data) => {
        res.json(data);
      })
      .catch((error) => res.json(error));
  } catch (error) {
    res.send({ success: false, message: error.message });
  }
};

exports.getRedisKey = async function (req, res) {
  try {
    getRedisKey(req, res)
      .then((data) => {
        res.json(data);
      })
      .catch((error) => res.json(error));
  } catch (error) {
    res.send({ success: false, message: error.message });
  }
};

exports.deleteRedisKey = async function (req, res) {
  try {
    deleteRedisKey(req, res)
      .then((data) => {
        res.json(data);
      })
      .catch((error) => res.json(error));
  } catch (error) {
    res.send({ success: false, message: error.message });
  }
};

exports.deleteRedisKeys = async function (req, res) {
  try {
    deleteRedisKeys(req, res)
      .then((data) => {
        res.json(data);
      })
      .catch((error) => res.json(error));
  } catch (error) {
    res.send({ success: false, message: error.message });
  }
};
