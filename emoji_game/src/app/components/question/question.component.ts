import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AboutComponent } from 'src/app/about/about.component';
interface Question {
  question: string;
  answer: string;
}
@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.scss'],
})
export class QuestionComponent implements OnInit {
  //booleans to keep track of what level it is
  levenshtein = require('fast-levenshtein');
  easy: boolean = false;
  hard: boolean = false;
  movies: boolean = false;
  bible: boolean = false;
  aboutClicked: boolean = false;
  id: string = ''; //id is passed from levels, either easy hard or movies
  easyList: Question[] = [];
  hardList: Question[] = [];
  moviesList: Question[] = [];
  bibleList: Question[] = [];
  currentList: Question[] = [];
  splitArray: string[] = [];
  //keeps track of current question
  questionCount: number = 0;
  lives: number[] = [1, 2, 3];
  gameover: boolean = false;
  response: string = ''; //users input
  answer: string = ''; //actual answer
  feedback: string = '';
  wordCount: number = 0;
  charCount: number = 0;
  hintCount: number = 0;
  coinType: number = 0;
  coinDecreaseAmount: number = 0;
  coinAdder: string = '';
  totalCoins: number = 30; //we should change this to local storage
  score: number = 0;
  wordCountMessage: string = '';
  charLines: string[] = [];
  value = 'Clear me';
  answerWithoutThe = '';
  //get the collection from firebase and make a list of the messages
  constructor(
    private db: AngularFirestore,
    private actRt: ActivatedRoute,
    private router: Router
  ) {
    db.collection<Question>('/easy')
      .valueChanges()
      .subscribe((result) => {
        if (result) {
          this.easyList = result;
          this.questionCount = Math.floor(Math.random() * this.easyList.length);
        }
      });
    db.collection<Question>('/hard')
      .valueChanges()
      .subscribe((result) => {
        if (result) {
          this.hardList = result;
          this.questionCount = Math.floor(Math.random() * this.hardList.length);
        }
      });
    db.collection<Question>('/movies')
      .valueChanges()
      .subscribe((result) => {
        if (result) {
          this.moviesList = result;
          this.questionCount = Math.floor(
            Math.random() * this.moviesList.length
          );
        }
      });
    db.collection<Question>('/bible')
      .valueChanges()
      .subscribe((result) => {
        if (result) {
          this.bibleList = result;
          this.questionCount = Math.floor(
            Math.random() * this.bibleList.length
          );
        }
      });
    if (this.easy === true) {
      this.currentList = this.easyList;
    } else if (this.hard === true) {
      this.currentList = this.hardList;
    } else if (this.movies === true) {
      this.currentList = this.moviesList;
    } else if (this.bible === true) {
      this.currentList = this.bibleList;
    }
  }

  displayCharCount(i: number) {
    //sets the current list to easy, hard, or movies
    this.charCount = this.currentList[i].answer.toLowerCase().length;
  }

  randomNumber(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  displayBlanks(str: string) {
    for (let i = 0; i < str.length; i++) {
      this.charLines.push('_');
    }
    this.charLines.push('\xa0\xa0\xa0\xa0'); //using hyphens for now because the spaces don't show up on screen
  }

  displayBlanksPlusFirstLetter(str: string) {
    this.charLines.push(str.charAt(0));
    for (let i = 0; i < str.length - 1; i++) {
      this.charLines.push('_');
    }
    this.charLines.push('\xa0\xa0\xa0\xa0'); //using hyphens for now because the spaces don't show up on screen
  }
  hint(i: number) {
    this.wordCountMessage = '';
    this.hintCount++;
    this.charLines = [];
    //sets the current list to easy, hard, or movies
    if (this.easy === true) {
      this.currentList = this.easyList;
    } else if (this.hard === true) {
      this.currentList = this.hardList;
    } else if (this.movies === true) {
      this.currentList = this.moviesList;
    } else if (this.bible === true) {
      this.currentList = this.bibleList;
    }
    this.wordCount = this.calculateWordCount(this.currentList[i].answer);
    //if hint count is 1, just display word count.
    if (this.totalCoins > 0) {
      if (this.hintCount === 1) {
        this.wordCountMessage = 'Word Count: ' + this.wordCount;
        this.coinDecreaseAmount = 1;
        this.coinDecrease();
        this.totalCoins = Math.max(
          0,
          this.totalCoins - this.coinDecreaseAmount
        ); //subtract a coin for using a hint
      }
      //if hint count is 2, display blanks and word count
      else if (this.hintCount === 2) {
        this.wordCountMessage = 'Word Count: ' + this.wordCount;
        this.wordCount = this.calculateWordCount(
          this.currentList[i].answer.toLowerCase()
        );
        for (let i = 0; i < this.splitArray.length; i++) {
          this.displayBlanks(this.splitArray[i]);
        }
        this.charLines.pop();
        this.coinDecreaseAmount = 2;
        this.coinDecrease();
        this.totalCoins = Math.max(
          0,
          this.totalCoins - this.coinDecreaseAmount
        ); //subtract even more coins for using a second hint
      }
      //if hint count is 3, display blanks, word count, and first letter of each word
      else if (this.hintCount === 3) {
        this.wordCountMessage = 'Word Count: ' + this.wordCount;
        for (let i = 0; i < this.splitArray.length; i++) {
          this.displayBlanksPlusFirstLetter(this.splitArray[i]);
        }
        this.charLines.pop();
        this.coinDecreaseAmount = 3;
        this.coinDecrease();
        this.totalCoins = Math.max(
          0,
          this.totalCoins - this.coinDecreaseAmount
        ); //subtract coins for using a third hint
      } else {
        this.hintCount = 0;
      }
    } else {
      this.wordCountMessage = 'Not Enough Coins!';
      setTimeout(() => {
        this.wordCountMessage = '';
      }, 1000);
    }
  }
  calculateWordCount(str: string): number {
    this.splitArray = str.split(' ');
    this.charLines.pop(); //deletes the unnecessary space at the end
    return this.splitArray.filter((word) => word !== '').length;
  }

  // removeFirstWord taken from https://bobbyhadz.com/blog/javascript-remove-first-word-from-string#:~:text=To%20remove%20the%20first%20word,with%20the%20first%20word%20removed.&text=Copied!
  removeFirstWord(str: string) {
    const indexOfSpace = str.indexOf(' ');

    if (indexOfSpace === -1) {
      return '';
    }

    return str.substring(indexOfSpace + 1);
  }

  //uses leveshtein function to calculate similarity between words
  //this function allows a user to misspell a couple of letters
  isSimilar(input: string, answer: string): boolean {
    // Calculate the Levenshtein distance between the input and answer strings.
    // This will give us the number of edits (insertions, deletions, or substitutions)
    // needed to make the input string match the answer string.
    const distance = this.levenshtein.get(input, answer);

    // Calculate the length of the answer string.
    const length = answer.length;

    // Calculate the similarity as a percentage by subtracting the distance from the length
    // and dividing by the length. Multiply by 100 to get the percentage.
    const similarity = ((length - distance) / length) * 100;
    console.log(similarity >= 80);
    // Return true if the similarity is 80% or greater, otherwise return false.
    return similarity >= 80;
  }
  enter(i: number) {
    //sets the current list to easy, hard, or movies
    if (this.easy === true) {
      this.currentList = this.easyList;
      this.coinType = 1;
    } else if (this.hard === true) {
      this.currentList = this.hardList;
      this.coinType = 10;
    } else if (this.movies === true) {
      this.currentList = this.moviesList;
      this.coinType = 5;
    } else if (this.bible === true) {
      this.currentList = this.bibleList;
      this.coinType = 5;
    }
    // This code determines if the first word of the phrase is 'The' or 'the'.

    // It allows the user to not have to type in 'the'

    const first = this.currentList[i].answer.split(' ')[0];

    if (first === 'The' || first === 'the') {
      this.answerWithoutThe = this.response;
      this.answerWithoutThe = this.removeFirstWord(this.currentList[i].answer);
    }

    if (
      this.isSimilar(
        this.response.toLowerCase(),
        this.currentList[i].answer.toLowerCase()
      )
      ||
      this.response.toLowerCase() === this.answerWithoutThe.toLowerCase()
    ) {
      this.feedback = 'Correct!';
      setTimeout(() => {
        this.feedback = '';
      }, 1000);
      this.questionCount = (this.questionCount + 1) % this.currentList.length;
      this.score++;
      this.totalCoins = this.totalCoins + this.coinType;
      this.coinIncrease();
    } else {
      this.lives.pop();
      this.feedback = 'Try Again!';
      setTimeout(() => {
        this.feedback = '';
      }, 1000);
    }
    this.response = '';
    this.wordCountMessage = '';
    this.wordCount = 0;
    this.charCount = 0;
    this.hintCount = 0;
    this.charLines = [];
  }
  coinIncrease() {
    this.coinAdder = '+' + String(this.coinType);
    setTimeout(() => {
      this.coinAdder = '';
    }, 1000);
  }
  coinDecrease() {
    this.coinAdder = '-' + String(this.coinDecreaseAmount);
    setTimeout(() => {
      this.coinAdder = '';
    }, 1000);
  }
  toggleModal(e: boolean) {
    return !e;
  }
  ngOnInit(): void {
    // this.questionCount =
    //   Math.floor(Math.random() * this.currentList.length) + 1;
    Number(this.id);
    this.id = this.actRt.snapshot.paramMap.get('id')!;
    console.log(this.id);
    if (this.id == ':easy') {
      this.easy = true;
    }
    if (this.id == ':hard') {
      this.hard = true;
    }
    if (this.id == ':movies') {
      this.movies = true;
    }
    if (this.id == ':bible') {
      this.bible = true;
    }
  }
}
