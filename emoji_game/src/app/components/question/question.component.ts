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
  easyList: Question[] = [];
  hardList: Question[] = [];
  moviesList: Question[] = [];
  currentList: Question[] = [];
  questionCount: number = 0;
  response: string = '';
  answer: string = '';
  easy: boolean = false;
  hard: boolean = false;
  movies: boolean = false;
  id: string = '';
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

    // //sets the current list to easy, hard, or movies
    // if (this.easy) {
    //   this.currentList = this.easyList;
    // } else if (this.hard) {
    //   this.currentList = this.hardList;
    // } else if (this.movies) {
    //   this.currentList = this.moviesList;
    // }
  }
  enter(i: number) {
    if (this.easy === true && this.response === this.easyList[i].answer) {
      console.log('correct!');
      this.questionCount++;
    } else if (
      this.hard === true &&
      this.response === this.hardList[i].answer
    ) {
      console.log('correct!');
      this.questionCount++;
    } else if (
      this.movies === true &&
      this.response === this.moviesList[i].answer
    ) {
      console.log('correct!');
      this.questionCount++;
    } else {
      console.log('Wrong');
    }

    this.response = '';
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
