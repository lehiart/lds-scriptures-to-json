const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const request = require('request-promise');
const jsdom = require('jsdom').JSDOM;

const inquirer = require('./config');
const constants = require('./constants')

clear();
console.log(
  chalk.yellow(
    figlet.textSync('LDS SCRIPTURES')
  )
);

const run = async () => {
    const options = await inquirer.askConfig();
    const scripture = constants.books[options.book];
    const language = constants.languages[options.language];

    const booksList = await requestBooksList(scripture, language)
    console.log(chalk.yellow("downloading...", booksList));

}

const requestBooksList = async (scripture, language) => {
    let booksList = [];
    const URL = `https://lds.org/scriptures/${scripture}?lang=${language}`;
    const data = await request.get(URL)
    const jsdomWindow = new jsdom(data);
    const bookTag = `div#primary div.table-of-contents ul.${constants.class[scripture]} li`;
    let books = jsdomWindow.window.document.querySelectorAll(bookTag);
    books.forEach((element) => booksList.push(element.getAttribute('id')));

    return booksList
}

const parseChaptersInfo = async (book, scripture, language, chapter = 1) => {

    // for (const book of booksList) {
    //     console.log(book);
    //     request.get(`https://lds.org/scriptures/${scripture}/${book}/${chapter}?lang=${language}`, (err, client, data) => {
    //         // console.log(`https://lds.org/scriptures/${scripture}/${book}/${chapter}?lang=${language}`);
    //         if (client.statusCode >= 300) break;
            
            
    //         // console.log(data);
    //         chapter = chapter + 1;
    //         // parseChaptersInfo(book, scripture, language, chapter + 1)
    //     })
    // }

}

const processHTML = async (data) => {

}

run();
