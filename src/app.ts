import inquirer from 'inquirer'
import fs from 'fs'
import { exec } from 'child_process'
const PATTERN_FOLDER = `${__dirname}/../pattern`

export const run = async () => {
	process.stdin.on('keypress', async (str, key) => {
		if (key.name === 'escape' || key.name === 'q') {
			process.exit(0)
		}
	})
	let path = process.cwd()
	if (process.argv.length > 2) {
		if (process.argv.some(arg => arg === '-h' || arg === '--help')) {
			console.log('ts-setup -h [PATH]')
			process.exit(0)
		}
		path = process.argv[2]
		fs.lstatSync
		if (!fs.existsSync(path)) {
			console.log(`ts-setup: ${path}: No such file or directory`)
			process.exit(0)
		}
		if (fs.lstatSync(path).isFile()) {
			console.log(`ts-setup: ${path}: Not a directory`)
			process.exit(0)
		}
	}

	const choices = [
		{ name: 'package', value: 'pack', checked: false },
		{ name: 'src folder', value: 'src', checked: true },
		{ name: 'tsconfig', value: 'config', checked: true },
		{ name: '.tslint', value: 'lint', checked: true },
		{ name: '.prettierrc', value: '.pretti', checked: true },
		{ name: '.gitignore', value: '.git', checked: false },
	]
	const prompted = (
		await inquirer.prompt([
			{
				type: 'checkbox',
				choices,
				name: 'checkbox',
				message: 'Select options',
			},
		])
	).checkbox as string[]

	if (prompted.some(value => value === 'pack')) {
		//TODO
		//const pack_str = fs.readFileSync(`${PATTERN_FOLDER}/package.json`, 'utf8')
		//const pack = JSON.parse(pack_str)
		//console.log(pack)
	}
	if (prompted.some(value => value === 'src')) {
		await sh(`cd ${path}; mkdir -p src`)
		await cp(path, 'index.ts', './src/')
		await cp(path, 'app.ts', './src/')
	}
	if (prompted.some(value => value === 'config')) await cp(path, 'tsconfig.json')
	if (prompted.some(value => value === 'lint')) await cp(path, 'tslint.json')
	if (prompted.some(value => value === '.pretti')) await cp(path, '.prettierrc.json')
	if (prompted.some(value => value === '.git')) await cp(path, '.gitignore')
}

async function cp(path: string, file: string, dest?: string) {
	const res = await sh(`cd ${path}; cp -n ${PATTERN_FOLDER}/${file} ${dest || './'}`)
	if (res.stderr) console.error(res.stderr)
}

async function sh(cmd: string): Promise<{ stdout: string; stderr: string }> {
	return new Promise(function(resolve, reject) {
		exec(cmd, (err, stdout, stderr) => {
			if (err) reject(err)
			else resolve({ stdout, stderr })
		})
	})
}
