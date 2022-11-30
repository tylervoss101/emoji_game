import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
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

  //get the collection from firebase and make a list of the messages
  constructor(private db: AngularFirestore) {
    db.collection<Question>('/easy')
      .valueChanges()
      .subscribe((result) => {
        if (result) {
          this.easyList = result;
        }
      });
  }

  ngOnInit(): void {}
}
