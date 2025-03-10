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
exports.DeployAction = void 0;
// 部署 GitHub Pages
const base_action_1 = require("./base/base-action");
const fs_1 = require("fs");
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
/**
 * 部署GitHub Pages的Action类
 */
class DeployAction extends base_action_1.BaseAction {
    async execute() {
        try {
            this.log('开始部署流程...');
            // 创建环境文件
            await this.createEnvFile();
            this.log('环境文件创建成功');
            // 构建前端项目
            await this.buildFrontend();
            this.log('前端构建成功');
            // 复制产品数据
            await this.copyProductsData();
            this.log('产品数据复制成功');
        }
        catch (error) {
            this.fail(`部署过程失败: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async createEnvFile() {
        this.log('创建.env文件');
        let text = `VITE_GITHUB_USERNAME=${this.context.repo.owner}\n`;
        text += `VITE_GITHUB_REPOSITORY=${this.context.repo.repo}\n`;
        text += `VITE_GITHUB_BRANCH=${this.context.ref}\n`;
        text += `VITE_PUBLIC_KEY="${process.env.PUBLIC_KEY || ''}"\n`;
        (0, fs_1.writeFileSync)('frontend/.env', text);
    }
    /**
     * 构建前端项目
     */
    async buildFrontend() {
        this.log('开始构建前端项目...');
        // 获取前端目录的绝对路径
        const frontendDir = path.resolve(process.cwd(), 'frontend');
        this.log(`前端目录: ${frontendDir}`);
        try {
            // 切换到前端目录并执行构建
            process.chdir(frontendDir);
            this.log('执行npm run build命令');
            // 执行构建命令并捕获输出
            const output = (0, child_process_1.execSync)('npm run build', {
                encoding: 'utf8',
                stdio: 'pipe'
            });
            // 输出构建日志
            this.log('构建输出:');
            this.log(output);
            // 切回原目录
            process.chdir(process.cwd());
        }
        catch (error) {
            // 确保即使构建失败也切回原目录
            try {
                process.chdir(process.cwd());
            }
            catch (e) {
                // 忽略切换目录的错误
            }
            // 抛出构建错误
            if (error instanceof Error) {
                throw new Error(`前端构建失败: ${error.message}`);
            }
            else {
                throw new Error(`前端构建失败: ${error}`);
            }
        }
    }
    /**
     * 复制产品数据到构建输出目录
     */
    async copyProductsData() {
        this.log('复制产品数据到构建输出目录...');
        const sourceDir = path.resolve(process.cwd(), '..', 'products/_.json');
        const distDir = path.resolve(process.cwd(), 'dist');
        const targetDir = path.resolve(process.cwd(), 'dist/products.json');
        // 检查源目录是否存在
        if (!(0, fs_1.existsSync)(sourceDir)) {
            this.warn(`警告：${sourceDir} 不存在！`);
            return;
        }
        if (!(0, fs_1.existsSync)(distDir)) {
            this.log(`创建目录: ${distDir}`);
            (0, fs_1.mkdirSync)(distDir);
        }
        try {
            (0, fs_1.copyFileSync)(sourceDir, targetDir);
            this.log(`复制文件: ${sourceDir} -> ${targetDir}`);
        }
        catch (error) {
            this.fail(`复制文件失败: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
exports.DeployAction = DeployAction;
// 执行Action
if (require.main === module) {
    const action = new DeployAction();
    action.execute().catch(error => {
        console.error('Action执行失败:', error);
        process.exit(1);
    });
}
