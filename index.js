const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const request = require('request-promise');
const jsdom = require('jsdom').JSDOM;
const fs = require('fs');
const pretty = require('json-stringify-pretty-compact');

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
       let tempList = await getChaptersList(book, scripture, language)
       const { chapters, bookName, bookSummary } = tempList;
       chaptersList.push({book: bookName, chapters, summary: bookSummary});
    })

    fs.writeFile(`${scripture}-${language}.json`, pretty(chaptersList), 'utf8', (err) => {
        if (err) throw err;
        console.log('The file has been saved!');
      });

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
    let chapterLinks = jsdomWindow.window.document.querySelectorAll(chapterTag);
    let bookName = jsdomWindow.window.document.querySelector('#details h1 span.dominant').textContent;
    let bookSummary = jsdomWindow.window.document.querySelector('div#primary div.chapters div.bookSummary') ? jsdomWindow.window.document.querySelector('div#primary div.chapters div.bookSummary').textContent  : '';
    let chapterSummary = jsdomWindow.window.document.querySelectorAll('div#content p.study-summary');

    chapterLinks = Array.from(chapterLinks)
        .map((element) => { 
            return {chapter: element.textContent, link: element.getAttribute('href'), verses: []}
        })

    await asyncForEach(chapterLinks, async(element, index) => {
         const verses =  await getChaptersData(element.link)
         element.verses = verses
         element.chapter_summary = chapterSummary[index].textContent
         chaptersList.push(element)
     })

    return {chapters: chaptersList, bookName, bookSummary};
}

const getChaptersData = async (chapterLink) => {
    let verses = [];
    const data =  await request.get({uri: chapterLink, rejectUnauthorized: false});
    const jsdomWindow = new jsdom(data);
    versesData = jsdomWindow.window.document.querySelectorAll(`div#content .article p.verse`);

    verses = Array.from(versesData).map(el => {
        return {verse_number: el.textContent.substr(0, el.textContent.indexOf(' ')) ,text: el.textContent.substr(el.textContent.indexOf(' ') +1)};
    })

    return verses;
}

const asyncForEach = async(array, callback) => {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array)
    }
}

run();
