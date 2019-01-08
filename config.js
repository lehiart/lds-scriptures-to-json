const inquirer = require('inquirer');

module.exports = {

  askConfig: () => {
    const questions = [
      {
        name: 'book',
        type: 'list',
        message: 'Select the book you want to download:',
        choices: ['Book of Mormon', 'Holy Bible'],
        validate: function( value ) {
          if (value.length) {
            return true;
          } else {
            return 'Please select the name of the book.';
          }
        }
      },
      {
        name: 'language',
        type: 'list',
        choices: ['English', 'Spanish'],
        message: 'Select the language:',
        validate: function(value) {
          if (value.length) {
            return true;
          } else {
            return 'Please enter the language.';
          }
        }
      }
    ];
    return inquirer.prompt(questions);
  },
}
