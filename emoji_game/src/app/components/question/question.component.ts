import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';

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
  easy: boolean = false;
  hard: boolean = false;
  movies: boolean = false;
  id: string = ''; //id is passed from levels, either easy hard or movies
  easyList: Question[] = [];
  hardList: Question[] = [];
  moviesList: Question[] = [];
  currentList: Question[] = [];
  splitArray: string[] = [];
  //keeps track of current question
  questionCount: number = 0;
  lives: number[] = [1, 2, 3];
  response: string = ''; //users input
  answer: string = ''; //actual answer
  feedback: string = '';
  wordCount: number = 0;
  charCount: number = 0;
  hintCount: number = 0;
  wordCountMessage: string = '';
  charLines: string[] = [];
  value = 'Clear me';

  //get the collection from firebase and make a list of the messages
  constructor(private db: AngularFirestore, private actRt: ActivatedRoute) {
    db.collection<Question>('/easy')
      .valueChanges()
      .subscribe((result) => {
        if (result) {
          this.easyList = result;
        }
      });

    db.collection<Question>('/hard')
      .valueChanges()
      .subscribe((result) => {
        if (result) {
          this.hardList = result;
        }
      });
    db.collection<Question>('/movies')
      .valueChanges()
      .subscribe((result) => {
        if (result) {
          this.moviesList = result;
        }
      });
    console.log(this.easyList);
  }
  displayCharCount(i: number) {
    //sets the current list to easy, hard, or movies
    if (this.easy === true) {
      this.currentList = this.easyList;
    } else if (this.hard === true) {
      this.currentList = this.hardList;
    } else if (this.movies === true) {
      this.currentList = this.moviesList;
    }
    this.charCount = this.currentList[i].answer.toLowerCase().length;
  }
  displayBlanks(str: string) {
    for (let i = 0; i < str.length; i++) {
      this.charLines.push('_ ');
    }
    this.charLines.push(' -- '); //using hyphens for now because the spaces don't show up on screen
  }
  displayBlanksPlusFirstLetter(str: string) {
    this.charLines.push(str.charAt(0));
    for (let i = 0; i < str.length - 1; i++) {
      this.charLines.push('_ ');
    }
    this.charLines.push(' -- '); //using hyphens for now because the spaces don't show up on screen
  }
  displayWordCount(i: number) {
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
    }
    this.wordCount = this.calculateWordCount(this.currentList[i].answer);
    //if hint count is 1, just display word count.
    if (this.hintCount === 1) {
      this.wordCountMessage = 'Word Count: ' + this.wordCount;
    }
    //if hint count is 2, display character and word count
    else if (this.hintCount === 2) {
      this.wordCountMessage = 'Word Count: ' + this.wordCount;
      this.wordCount = this.calculateWordCount(
        this.currentList[i].answer.toLowerCase()
      );
      for (let i = 0; i < this.splitArray.length; i++) {
        this.displayBlanks(this.splitArray[i]);
      }
    } else if (this.hintCount === 3) {
      for (let i = 0; i < this.splitArray.length; i++) {
        this.displayBlanksPlusFirstLetter(this.splitArray[i]);
      }
    } else {
      this.hintCount = 0;
      console.log('reset');
    }

    //this.wordCountMessage = 'Word Count: ' + this.wordCount;
  }
  //TO dO FIX WORD COuNT
  calculateWordCount(str: string): number {
    this.splitArray = str.split(' ');

    this.charLines.pop(); //deletes the unnecessary space at the end
    return this.splitArray.filter((word) => word !== '').length;
  }
  enter(i: number) {
    //sets the current list to easy, hard, or movies
    if (this.easy === true) {
      this.currentList = this.easyList;
    } else if (this.hard === true) {
      this.currentList = this.hardList;
    } else if (this.movies === true) {
      this.currentList = this.moviesList;
    }

    if (
      this.response.toLowerCase() === this.currentList[i].answer.toLowerCase()
    ) {
      console.log('correct!');

    this.feedback = 'Correct';
      this.questionCount = (this.questionCount + 1) % this.currentList.length;
    } else {
      console.log('Wrong');
      this.lives.pop();
      this.feedback = 'Wrong';
    }
    this.response = '';
    this.wordCountMessage = '';
    this.wordCount = 0;
    this.charCount = 0;
    this.hintCount = 0;
    this.charLines = [];
  }

  calculateWordCount(str: string): number {
    const arr = str.split(' ');

    return arr.filter((word) => word !== '').length;
  }


  ngOnInit(): void {
    this.questionCount =
      Math.floor(Math.random() * this.currentList.length) + 1;
    console.log(this.questionCount);
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
  }
}
