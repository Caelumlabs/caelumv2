// FS
const fs = require('fs')
const Spinner = require('cli-spinner').Spinner;
const spinner = new Spinner('Governance')
spinner.setSpinnerString('|/-\\')

// Log
const chalk = require('chalk')
const log = console.log
const colorize = require('json-colorizer')

// Readline
const rl = require('readline')
const r = rl.createInterface({ input: process.stdin, output: process.stdout })

module.exports = {
    nl: () => log('\n'),
    log: (txt) => { log(txt) },
    logV: (txt, value) => {
      log(chalk.grey(txt + '  : ') + chalk.magenta(value))
    },
    json: (json) => {
      log(colorize(json))
    },
    ask : (question) => {
      return new Promise((resolve, reject) => {
        r.question(question + ': ', (input) => resolve(input) )
      })
    },
    start: () => {
      log('\n\n' + chalk.blue('Let\'s do this' + '\n'))
    },
    end : () => {
      r.close()
      log('\n' + chalk.blue('Goodbye'))
      process.exit()
    },
    spin: () => spinner.start(),
    unspin: () => spinner.stop(),
    logSpinner: (title, text, step, total) => {
      spinner.setSpinnerTitle(chalk.grey(title + '(' + step + '/' + total + '): ') + chalk.blue(text))
    },
    saveFile: (name, exportJson) => {
      return new Promise((resolve, reject) => {
        fs.writeFile('./' + name + '.json', exportJson, 'utf8', async () => {
          resolve()
        })
      })
    },
    readFile: (name) => {
      return new Promise((resolve, reject) => {
        fs.readFile('./' + name + '.json', 'utf8', async (err, data) => {
          resolve(JSON.parse(data))
        })
      })
    },
    extractDid: (signedVC) => {
      const issuer = signedVC.issuer.split(':')
      return issuer[2]
    }
}
