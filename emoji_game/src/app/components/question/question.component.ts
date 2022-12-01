import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute } from '@angular/router';
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
  //keeps track of current question
  questionCount: number = 0;
  response: string = ''; //users input
  answer: string = ''; //actual answer
  feedback: string = '';
  wordCount: number = 0;
  charCount: number = 0;

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

    //calculate word count
    // this.wordCount = this.calculateWordCount(
    //   this.currentList[this.questionCount].answer
    // );
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

    if (this.response === this.currentList[i].answer) {
      console.log('correct!');
      this.questionCount++;
    } else {
      console.log('Wrong');
    }
    this.response = '';
  }

  calculateWordCount(str: string): number {
    const arr = str.split(' ');

    return arr.filter((word) => word !== '').length;
  }
  ngOnInit(): void {
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
