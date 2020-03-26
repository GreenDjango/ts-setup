"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const inquirer_1 = __importDefault(require("inquirer"));
const fs_1 = __importDefault(require("fs"));
const child_process_1 = require("child_process");
const PATTERN_FOLDER = `${__dirname}/../pattern`;
exports.run = () => __awaiter(void 0, void 0, void 0, function* () {
    process.stdin.on('keypress', (str, key) => __awaiter(void 0, void 0, void 0, function* () {
        if (key.name === 'escape' || key.name === 'q') {
            process.exit(0);
        }
    }));
    let path = process.cwd();
    if (process.argv.length > 2) {
        if (process.argv.some(arg => arg === '-h' || arg === '--help')) {
            console.log('ts-setup -h [PATH]');
            process.exit(0);
        }
        path = process.argv[2];
        fs_1.default.lstatSync;
        if (!fs_1.default.existsSync(path)) {
            console.log(`ts-setup: ${path}: No such file or directory`);
            process.exit(0);
        }
        if (fs_1.default.lstatSync(path).isFile()) {
            console.log(`ts-setup: ${path}: Not a directory`);
            process.exit(0);
        }
    }
    const choices = [
        { name: 'package', value: 'pack', checked: false },
        { name: 'typescript & tslint', value: 'tt', checked: false },
        { name: 'src folder', value: 'src', checked: true },
        { name: 'tsconfig', value: 'config', checked: true },
        { name: '.tslint', value: 'lint', checked: true },
        { name: '.prettierrc', value: '.pretti', checked: true },
        { name: '.gitignore', value: '.git', checked: false },
    ];
    const prompted = (yield inquirer_1.default.prompt([
        {
            type: 'checkbox',
            choices,
            name: 'checkbox',
            message: 'Select options',
        },
    ])).checkbox;
    console.log('Process...');
    if (prompted.some(value => value === 'package' || value === 'tt'))
        yield cp(path, 'package', './package.json');
    if (prompted.some(value => value === 'tt'))
        yield sh(`cd ${path}; npm i typescript --save-dev; npm i tslint --save-dev`);
    if (prompted.some(value => value === 'src')) {
        yield sh(`cd ${path}; mkdir -p src`);
        yield cp(path, 'index.ts', './src/');
        yield cp(path, 'app.ts', './src/');
    }
    if (prompted.some(value => value === 'config'))
        yield cp(path, 'tsconfig.json');
    if (prompted.some(value => value === 'lint'))
        yield cp(path, 'tslint.json');
    if (prompted.some(value => value === '.pretti'))
        yield cp(path, '.prettierrc.json');
    if (prompted.some(value => value === '.git'))
        yield cp(path, '.gitignore');
});
function cp(path, file, dest) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield sh(`cd ${path}; cp -n ${PATTERN_FOLDER}/${file} ${dest || './'}`);
        if (res.stderr)
            console.error(res.stderr);
    });
}
function sh(cmd) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(function (resolve, reject) {
            child_process_1.exec(cmd, (err, stdout, stderr) => {
                if (err)
                    reject(err);
                else
                    resolve({ stdout, stderr });
            });
        });
    });
}
