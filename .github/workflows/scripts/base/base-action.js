"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseAction = void 0;
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
/**
 * 所有Action的基础类
 * 提供通用的GitHub Actions功能
 */
class BaseAction {
    /**
     * 构造函数
     */
    constructor() {
        const token = core.getInput('GITHUB_TOKEN', { required: true });
        this.octokit = github.getOctokit(token);
        this.context = github.context;
    }
    /**
   * 获取GitHub Secret
   */
    getSecret(name) {
        return process.env[name] || '';
    }
    /**
     * 获取GitHub Variable
     */
    getVariable(name) {
        return process.env[`GITHUB_${name}`] || process.env[name] || '';
    }
    /**
     * 记录信息日志
     */
    log(message) {
        core.info(message);
    }
    /**
     * 记录调试信息
     */
    debug(message) {
        core.debug(message);
    }
    /**
     * 记录警告信息
     */
    warn(message) {
        core.warning(message);
    }
    /**
     * 记录错误信息
     */
    error(message) {
        core.error(message);
    }
    /**
     * 标记Action失败
     */
    fail(message) {
        core.setFailed(message);
    }
    /**
     * 获取输入参数
     */
    getInput(name, required = false) {
        return core.getInput(name, { required });
    }
    /**
     * 获取布尔输入参数
     */
    getBooleanInput(name, required = false) {
        return core.getBooleanInput(name, { required });
    }
    /**
     * 设置输出参数
     */
    setOutput(name, value) {
        core.setOutput(name, value);
    }
}
exports.BaseAction = BaseAction;
