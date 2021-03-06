'use strict';
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Service = require('egg').Service;
class UserService extends Service {
  /**
   * 创建用户
   * @param userInfo
   * @returns {Promise<*>}
   */
  async create(userInfo) {
    const { ctx } = this;
    const User = ctx.model.User;
    const { nickname, userEmail, password } = userInfo;
    // if (!(userEmail && password)) {
    //     //   return {
    //     //     msg: '用户邮箱和密码不能为空',
    //     //   };
    //     // }
    const userObj = new User({ nickname, userEmail, password });
    let userRegister = await User.findOne({ userEmail });
    let retData = {};
    if (!userRegister) {
      await userObj.save();
      userRegister = await User.findOne({ userEmail });
      retData = {
        user: userRegister,
        msg: '注册成功',
        code: 200
      };
    } else {
      retData = {
        msg: '该用户已注册，请登录',
        code: 401
      };
    }
    return retData;
  }

  /**
   * 用户登录
   * @param userInfo
   * @returns {Promise<{code: number, msg: string}|{code: number, msg: string}|{msg: string, code: number, user: {uid: *, nickname: *, userEmail: string|*|userEmail}, token: *}>}
   */
  async login(userInfo) {
    const { ctx, app } = this;
    const User = ctx.model.User;
    const { userEmail, password } = userInfo;
    const userLogin = await User.findOne({ userEmail });
    let retData = {};
    if (userLogin) {
      // todo 密码加密
      if (password === userLogin.password) {
        const token = jwt.sign({
          uid: userLogin._id,
          exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60 * 7 // 过期时间为7天
        }, app.config.cert);
        retData = {
          msg: '登录成功',
          code: 200,
          user: userLogin,
          token
        }
      } else {
        retData = {
          code: 401,
          msg: '密码输入错误，请重新输入!'
        }
      }
    } else {
      retData = {
        code: 401,
        msg: '该用户不存在, 请注册!'
      }
    }
    return retData
  }

  /**
   * 获取用户信息
   * @param userId
   * @returns {Promise<{code: number, data: *}>}
   */
  async getUserInfo(userId) {
    const { ctx } = this;
    const User = ctx.model.User;
    let sendDataFormat = {nickname: 1, userEmail: 1, _id: 1, avatar: 1, friends: 1, updateTime: 1}
    const userInfo = await User.findOne({ _id: userId }, sendDataFormat)
    return {
      code: 200,
      data: userInfo
    }
  }

  /**
   * 查找用户
   * @param name
   * @returns {Promise<void>}
   */
  async find(name) {
    let { ctx } = this;
    let User = ctx.model.User;
    let sendDataFormat = {nickname: 1, userEmail: 1, _id: 1, avatar: 1}
    let results = await User.find({nickname: name}, sendDataFormat);
    return {
      code: 200,
      data: results
    };
  }
}
module.exports = UserService;
