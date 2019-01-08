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
    let chaptersList = []

    const booksList = await requestBooksList(scripture, language)
    console.log(chalk.yellow("downloading...", booksList));

    await asyncForEach(booksList, async(book) => {
       let tempList =  await getChaptersList(book, scripture, language)
       chaptersList.push(tempList)
    })

}

const requestBooksList = async (scripture, language) => {
    let booksList = [];
    const bookTag = `div#primary div.table-of-contents ul.${constants.class[scripture]} li`;

    const data = await request.get({uri:`https://lds.org/scriptures/${scripture}?lang=${language}`, rejectUnauthorized: false})
    const jsdomWindow = new jsdom(data);
    let books = jsdomWindow.window.document.querySelectorAll(bookTag);

    books.forEach((element) => booksList.push(element.getAttribute('id')));
    return booksList
}

const getChaptersList = async (book, scripture, language) => {
    let chaptersList = [];
    const chapterTag = `div#primary ul.jump-to-chapter li a`;

    const data =  await request.get({uri: `https://lds.org/scriptures/${scripture}/${book}?lang=${language}`, rejectUnauthorized: false});
    const jsdomWindow = new jsdom(data);
    let chapters = jsdomWindow.window.document.querySelectorAll(chapterTag);

    chapters.forEach( element => chaptersList.push({[book]: element.getAttribute('href')}) ) 
    return chaptersList;
}

const processHTML = async (data) => {

}

const asyncForEach = async(array, callback) => {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array)
    }
  }

run();
